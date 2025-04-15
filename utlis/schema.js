import { relations } from "drizzle-orm"
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  uuid,
  doublePrecision,
  primaryKey,
} from "drizzle-orm/pg-core"

// Movies table
export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  director: text("director").notNull(),
  year: integer("year").notNull(),
  genre: text("genre").notNull(),
  posterUrl: text("poster_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Showtimes table
export const showtimes = pgTable("showtimes", {
  id: serial("id").primaryKey(),
  movieId: integer("movie_id")
    .references(() => movies.id, { onDelete: "cascade" })
    .notNull(),
  date: text("date").notNull(), // Format: YYYY-MM-DD
  time: text("time").notNull(), // Format: HH:MM
  price: doublePrecision("price").notNull(),
  totalSeats: integer("total_seats").notNull(),
  availableSeats: integer("available_seats").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Bookings table
export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  movieId: integer("movie_id")
    .references(() => movies.id, { onDelete: "cascade" })
    .notNull(),
  showtimeId: integer("showtime_id")
    .references(() => showtimes.id, { onDelete: "cascade" })
    .notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  totalPrice: doublePrecision("total_price").notNull(),
  bookingDate: timestamp("booking_date").defaultNow().notNull(),
})

// Seats table
export const seats = pgTable("seats", {
  id: serial("id").primaryKey(),
  row: text("row").notNull(),
  number: integer("number").notNull(),
  isBooked: boolean("is_booked").default(false).notNull(),
  showtimeId: integer("showtime_id")
    .references(() => showtimes.id, { onDelete: "cascade" })
    .notNull(),
})

// Booked seats table (many-to-many relationship between bookings and seats)
export const bookedSeats = pgTable(
  "booked_seats",
  {
    bookingId: uuid("booking_id")
      .references(() => bookings.id, { onDelete: "cascade" })
      .notNull(),
    seatId: integer("seat_id")
      .references(() => seats.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.bookingId, t.seatId] }),
  }),
)

// Relations
export const moviesRelations = relations(movies, ({ many }) => ({
  showtimes: many(showtimes),
}))

export const showtimesRelations = relations(showtimes, ({ one, many }) => ({
  movie: one(movies, {
    fields: [showtimes.movieId],
    references: [movies.id],
  }),
  seats: many(seats),
  bookings: many(bookings),
}))

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  movie: one(movies, {
    fields: [bookings.movieId],
    references: [movies.id],
  }),
  showtime: one(showtimes, {
    fields: [bookings.showtimeId],
    references: [showtimes.id],
  }),
  seats: many(bookedSeats),
}))

export const seatsRelations = relations(seats, ({ one, many }) => ({
  showtime: one(showtimes, {
    fields: [seats.showtimeId],
    references: [showtimes.id],
  }),
  bookings: many(bookedSeats),
}))

export const bookedSeatsRelations = relations(bookedSeats, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookedSeats.bookingId],
    references: [bookings.id],
  }),
  seat: one(seats, {
    fields: [bookedSeats.seatId],
    references: [seats.id],
  }),
}))
