"use server"

import { revalidatePath } from "next/cache"
import { db } from "../utlis/db"
import * as schema from "../utlis/schema"
import { eq, and, desc, sql } from "drizzle-orm"
import type { Movie, Showtime, Seat, Booking } from "./types"

// Convert database movie to application movie
function dbMovieToMovie(dbMovie: any, dbShowtimes?: any[]): Movie {
  return {
    id: String(dbMovie.id),
    title: dbMovie.title,
    director: dbMovie.director,
    year: dbMovie.year,
    genre: dbMovie.genre,
    posterUrl: dbMovie.posterUrl || dbMovie.poster_url,
    showtimes: dbShowtimes
      ? dbShowtimes
          .filter((st) => st.movieId === dbMovie.id || st.movie_id === dbMovie.id)
          .map((st) => ({
            id: String(st.id),
            date: st.date,
            time: st.time,
            price: st.price,
            totalSeats: st.totalSeats || st.total_seats,
            availableSeats: st.availableSeats || st.available_seats,
          }))
      : [],
  }
}

// Convert database showtime to application showtime
function dbShowtimeToShowtime(dbShowtime: any): Showtime {
  return {
    id: String(dbShowtime.id),
    date: dbShowtime.date,
    time: dbShowtime.time,
    price: dbShowtime.price,
    totalSeats: dbShowtime.totalSeats || dbShowtime.total_seats,
    availableSeats: dbShowtime.availableSeats || dbShowtime.available_seats,
  }
}

// Convert database seat to application seat
function dbSeatToSeat(dbSeat: any): Seat {
  return {
    row: dbSeat.row,
    number: dbSeat.number,
    isBooked: dbSeat.isBooked || dbSeat.is_booked,
  }
}

export async function getMovies(): Promise<Movie[]> {
  try {
    const dbMovies = await db.select().from(schema.movies).orderBy(desc(schema.movies.id))
    const dbShowtimes = await db.select().from(schema.showtimes)

    return dbMovies.map((movie) => dbMovieToMovie(movie, dbShowtimes))
  } catch (error) {
    console.error("Failed to get movies:", error)
    throw new Error("Failed to get movies")
  }
}

export async function getMovie(id: string): Promise<Movie | undefined> {
  try {
    const dbMovie = await db
      .select()
      .from(schema.movies)
      .where(eq(schema.movies.id, Number.parseInt(id)))
      .then((res) => res[0])

    if (!dbMovie) return undefined

    const dbShowtimes = await db
      .select()
      .from(schema.showtimes)
      .where(eq(schema.showtimes.movieId, Number.parseInt(id)))

    return dbMovieToMovie(dbMovie, dbShowtimes)
  } catch (error) {
    console.error(`Failed to get movie with ID ${id}:`, error)
    throw new Error(`Failed to get movie with ID ${id}`)
  }
}

export async function addMovie(movie: Omit<Movie, "id">): Promise<Movie> {
  try {
    const [dbMovie] = await db
      .insert(schema.movies)
      .values({
        title: movie.title,
        director: movie.director,
        year: movie.year,
        genre: movie.genre,
        posterUrl: movie.posterUrl,
      })
      .returning()

    revalidatePath("/")
    return dbMovieToMovie(dbMovie)
  } catch (error) {
    console.error("Failed to add movie:", error)
    throw new Error("Failed to add movie")
  }
}

export async function updateMovie(movie: Movie): Promise<Movie> {
  try {
    const [dbMovie] = await db
      .update(schema.movies)
      .set({
        title: movie.title,
        director: movie.director,
        year: movie.year,
        genre: movie.genre,
        posterUrl: movie.posterUrl,
        updatedAt: new Date(),
      })
      .where(eq(schema.movies.id, Number.parseInt(movie.id)))
      .returning()

    revalidatePath("/")
    return dbMovieToMovie(dbMovie)
  } catch (error) {
    console.error(`Failed to update movie with ID ${movie.id}:`, error)
    throw new Error(`Failed to update movie with ID ${movie.id}`)
  }
}

export async function deleteMovie(id: string): Promise<void> {
  try {
    await db.delete(schema.movies).where(eq(schema.movies.id, Number.parseInt(id)))
    revalidatePath("/")
  } catch (error) {
    console.error(`Failed to delete movie with ID ${id}:`, error)
    throw new Error(`Failed to delete movie with ID ${id}`)
  }
}

export async function getShowtime(movieId: string, showtimeId: string): Promise<Showtime | undefined> {
  try {
    const dbShowtime = await db
      .select()
      .from(schema.showtimes)
      .where(
        and(
          eq(schema.showtimes.id, Number.parseInt(showtimeId)),
          eq(schema.showtimes.movieId, Number.parseInt(movieId)),
        ),
      )
      .then((res) => res[0])

    if (!dbShowtime) return undefined

    return dbShowtimeToShowtime(dbShowtime)
  } catch (error) {
    console.error(`Failed to get showtime with ID ${showtimeId}:`, error)
    throw new Error(`Failed to get showtime with ID ${showtimeId}`)
  }
}

export async function getSeats(movieId: string, showtimeId: string): Promise<Seat[]> {
  try {
    const dbSeats = await db
      .select()
      .from(schema.seats)
      .where(eq(schema.seats.showtimeId, Number.parseInt(showtimeId)))

    return dbSeats.map(dbSeatToSeat)
  } catch (error) {
    console.error(`Failed to get seats for showtime with ID ${showtimeId}:`, error)
    throw new Error(`Failed to get seats for showtime with ID ${showtimeId}`)
  }
}

export async function createBooking(bookingData: Omit<Booking, "id" | "bookingDate">): Promise<Booking> {
  try {
    // Start a transaction
    return await db.transaction(async (tx) => {
      // 1. Get the showtime to check available seats
      const dbShowtime = await tx
        .select()
        .from(schema.showtimes)
        .where(eq(schema.showtimes.id, Number.parseInt(bookingData.showtimeId)))
        .then((res) => res[0])

      if (!dbShowtime) {
        throw new Error(`Showtime with ID ${bookingData.showtimeId} not found`)
      }

      if (dbShowtime.availableSeats < bookingData.seats.length) {
        throw new Error("Not enough available seats")
      }

      // 2. Create the booking
      const [dbBooking] = await tx
        .insert(schema.bookings)
        .values({
          movieId: Number.parseInt(bookingData.movieId),
          showtimeId: Number.parseInt(bookingData.showtimeId),
          customerName: bookingData.customerName,
          customerEmail: bookingData.customerEmail,
          totalPrice: bookingData.totalPrice,
        })
        .returning()

      // 3. Update the seats to be booked
      for (const seat of bookingData.seats) {
        // Find the seat ID
        const dbSeat = await tx
          .select()
          .from(schema.seats)
          .where(
            and(
              eq(schema.seats.row, seat.row),
              eq(schema.seats.number, seat.number),
              eq(schema.seats.showtimeId, Number.parseInt(bookingData.showtimeId)),
            ),
          )
          .then((res) => res[0])

        if (!dbSeat) {
          throw new Error(`Seat ${seat.row}${seat.number} not found`)
        }

        // Mark the seat as booked
        await tx.update(schema.seats).set({ isBooked: true }).where(eq(schema.seats.id, dbSeat.id))

        // Create the booking-seat relationship
        await tx.insert(schema.bookedSeats).values({
          bookingId: dbBooking.id,
          seatId: dbSeat.id,
        })
      }

      // 4. Update the available seats count in the showtime
      await tx
        .update(schema.showtimes)
        .set({
          availableSeats: dbShowtime.availableSeats - bookingData.seats.length,
          updatedAt: new Date(),
        })
        .where(eq(schema.showtimes.id, Number.parseInt(bookingData.showtimeId)))

      // 5. Return the created booking
      return {
        id: dbBooking.id,
        movieId: bookingData.movieId,
        showtimeId: bookingData.showtimeId,
        customerName: bookingData.customerName,
        customerEmail: bookingData.customerEmail,
        totalPrice: bookingData.totalPrice,
        seats: bookingData.seats,
        bookingDate: dbBooking.bookingDate.toISOString(),
      }
    })
  } catch (error) {
    console.error("Failed to create booking:", error)
    throw new Error(`Failed to create booking: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function getBookings(movieId?: string): Promise<any[]> {
  try {
    let query = db
      .select({
        booking: schema.bookings,
        movie: schema.movies,
        showtime: schema.showtimes,
      })
      .from(schema.bookings)
      .innerJoin(schema.movies, eq(schema.bookings.movieId, schema.movies.id))
      .innerJoin(schema.showtimes, eq(schema.bookings.showtimeId, schema.showtimes.id))
      .orderBy(desc(schema.bookings.bookingDate))

    if (movieId) {
      query = query.where(eq(schema.bookings.movieId, Number.parseInt(movieId)))
    }

    const results = await query

    // Get seats for each booking
    const bookingsWithSeats = await Promise.all(
      results.map(async (result) => {
        const bookedSeatsRelations = await db
          .select({
            seat: schema.seats,
          })
          .from(schema.bookedSeats)
          .innerJoin(schema.seats, eq(schema.bookedSeats.seatId, schema.seats.id))
          .where(eq(schema.bookedSeats.bookingId, result.booking.id))

        const seats = bookedSeatsRelations.map((relation) => dbSeatToSeat(relation.seat))

        return {
          id: result.booking.id,
          movieId: String(result.booking.movieId),
          showtimeId: String(result.booking.showtimeId),
          customerName: result.booking.customerName,
          customerEmail: result.booking.customerEmail,
          totalPrice: result.booking.totalPrice,
          bookingDate: result.booking.bookingDate.toISOString(),
          movie: {
            id: String(result.movie.id),
            title: result.movie.title,
          },
          showtime: {
            id: String(result.showtime.id),
            date: result.showtime.date,
            time: result.showtime.time,
          },
          seats,
        }
      }),
    )

    return bookingsWithSeats
  } catch (error) {
    console.error("Failed to get bookings:", error)
    throw new Error("Failed to get bookings")
  }
}

export async function addShowtime(movieId: string, showtime: Omit<Showtime, "id">): Promise<Showtime> {
  try {
    // Insert the showtime
    const [dbShowtime] = await db
      .insert(schema.showtimes)
      .values({
        movieId: Number.parseInt(movieId),
        date: showtime.date,
        time: showtime.time,
        price: showtime.price,
        totalSeats: showtime.totalSeats,
        availableSeats: showtime.availableSeats,
      })
      .returning()

    // Generate seats for this showtime
    const rows = ["A", "B", "C", "D", "E"]
    const seatsPerRow = Math.ceil(showtime.totalSeats / rows.length)

    for (const row of rows) {
      for (let i = 1; i <= seatsPerRow; i++) {
        if ((row.charCodeAt(0) - 65) * seatsPerRow + i <= showtime.totalSeats) {
          await db.insert(schema.seats).values({
            row,
            number: i,
            isBooked: false,
            showtimeId: dbShowtime.id,
          })
        }
      }
    }

    revalidatePath("/")
    return dbShowtimeToShowtime(dbShowtime)
  } catch (error) {
    console.error(`Failed to add showtime for movie with ID ${movieId}:`, error)
    throw new Error(`Failed to add showtime for movie with ID ${movieId}`)
  }
}

// Admin-specific actions
export async function getDashboardStats() {
  try {
    const totalMovies = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.movies)
      .then((res) => res[0].count)

    const totalBookings = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.bookings)
      .then((res) => res[0].count)

    const totalRevenue = await db
      .select({ sum: sql<number>`sum(total_price)` })
      .from(schema.bookings)
      .then((res) => res[0].sum || 0)

    const upcomingShowtimes = await db
      .select()
      .from(schema.showtimes)
      .where(sql`${schema.showtimes.date} >= ${new Date().toISOString().split("T")[0]}`)
      .orderBy(schema.showtimes.date, schema.showtimes.time)
      .limit(5)

    return {
      totalMovies,
      totalBookings,
      totalRevenue,
      upcomingShowtimes: upcomingShowtimes.map(dbShowtimeToShowtime),
    }
  } catch (error) {
    console.error("Failed to get dashboard stats:", error)
    throw new Error("Failed to get dashboard stats")
  }
}

export async function getBookingDetails(bookingId: string) {
  try {
    const booking = await db
      .select({
        booking: schema.bookings,
        movie: schema.movies,
        showtime: schema.showtimes,
      })
      .from(schema.bookings)
      .innerJoin(schema.movies, eq(schema.bookings.movieId, schema.movies.id))
      .innerJoin(schema.showtimes, eq(schema.bookings.showtimeId, schema.showtimes.id))
      .where(eq(schema.bookings.id, bookingId))
      .then((res) => res[0])

    if (!booking) {
      throw new Error(`Booking with ID ${bookingId} not found`)
    }

    const bookedSeatsRelations = await db
      .select({
        seat: schema.seats,
      })
      .from(schema.bookedSeats)
      .innerJoin(schema.seats, eq(schema.bookedSeats.seatId, schema.seats.id))
      .where(eq(schema.bookedSeats.bookingId, bookingId))

    const seats = bookedSeatsRelations.map((relation) => dbSeatToSeat(relation.seat))

    return {
      id: booking.booking.id,
      movieId: String(booking.booking.movieId),
      showtimeId: String(booking.booking.showtimeId),
      customerName: booking.booking.customerName,
      customerEmail: booking.booking.customerEmail,
      totalPrice: booking.booking.totalPrice,
      bookingDate: booking.booking.bookingDate.toISOString(),
      movie: dbMovieToMovie(booking.movie),
      showtime: dbShowtimeToShowtime(booking.showtime),
      seats,
    }
  } catch (error) {
    console.error(`Failed to get booking details for ID ${bookingId}:`, error)
    throw new Error(`Failed to get booking details for ID ${bookingId}`)
  }
}
