"use client"

import { useState, useEffect } from "react"
import { getBookingDetails } from "@/lib/actions"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Mail, User, MapPin, Film, Clock, CreditCard } from "lucide-react"
import { format } from "date-fns"

interface BookingDetailsProps {
  bookingId: string
  onBack: () => void
}

export function BookingDetails({ bookingId, onBack }: BookingDetailsProps) {
  const [booking, setBooking] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const data = await getBookingDetails(bookingId)
        setBooking(data)
      } catch (error) {
        console.error("Failed to fetch booking details:", error)
        setError("Failed to load booking details")
      } finally {
        setLoading(false)
      }
    }

    fetchBookingDetails()
  }, [bookingId])

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">Loading booking details...</div>
        </CardContent>
      </Card>
    )
  }

  if (error || !booking) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-destructive">{error || "Booking not found"}</div>
          <div className="flex justify-center">
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bookings
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const bookingDate = new Date(booking.bookingDate)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bookings
        </Button>
        <h2 className="text-2xl font-bold">Booking Details</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Booking Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full p-2 bg-muted">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium">Booking Date</div>
                <div className="text-sm text-muted-foreground">
                  {format(bookingDate, "PPP")} at {format(bookingDate, "p")}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-full p-2 bg-muted">
                <User className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium">Customer</div>
                <div className="text-sm text-muted-foreground">{booking.customerName}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-full p-2 bg-muted">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium">Email</div>
                <div className="text-sm text-muted-foreground">{booking.customerEmail}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-full p-2 bg-muted">
                <CreditCard className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium">Payment</div>
                <div className="text-sm text-muted-foreground">${booking.totalPrice.toFixed(2)}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-full p-2 bg-muted">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium">Seats</div>
                <div className="text-sm text-muted-foreground">
                  {booking.seats.map((seat: any) => `${seat.row}${seat.number}`).join(", ")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Movie Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full p-2 bg-muted">
                <Film className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium">Movie</div>
                <div className="text-sm text-muted-foreground">{booking.movie.title}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-full p-2 bg-muted">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium">Date</div>
                <div className="text-sm text-muted-foreground">{booking.showtime.date}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-full p-2 bg-muted">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium">Time</div>
                <div className="text-sm text-muted-foreground">{booking.showtime.time}</div>
              </div>
            </div>

            {booking.movie.posterUrl && (
              <div className="mt-4">
                <img
                  src={booking.movie.posterUrl || "/placeholder.svg"}
                  alt={booking.movie.title}
                  className="rounded-md w-full max-w-[200px] mx-auto object-cover"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ticket Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium">Movie</div>
                <div className="text-lg">{booking.movie.title}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Showtime</div>
                <div className="text-lg">
                  {booking.showtime.date} at {booking.showtime.time}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Seats</div>
                <div className="text-lg">
                  {booking.seats.map((seat: any) => `${seat.row}${seat.number}`).join(", ")}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Booking Reference</div>
                <div className="text-lg font-mono">{booking.id}</div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back to Bookings
          </Button>
          <Button onClick={() => window.print()}>Print Ticket</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
