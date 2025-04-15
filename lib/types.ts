export interface Movie {
  id: string
  title: string
  director: string
  year: number
  genre: string
  posterUrl?: string
  showtimes?: Showtime[]
}

export interface Showtime {
  id: string
  date: string
  time: string
  price: number
  availableSeats: number
  totalSeats: number
}

export interface Booking {
  id: string
  movieId: string
  showtimeId: string
  seats: Seat[]
  customerName: string
  customerEmail: string
  totalPrice: number
  bookingDate: string
}

export interface Seat {
  row: string
  number: number
  isBooked: boolean
}
