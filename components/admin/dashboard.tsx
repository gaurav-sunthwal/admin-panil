"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookingsList } from "@/components/admin/bookings-list"
import { BookingDetails } from "@/components/admin/booking-details"
import { CalendarClock, CreditCard, Film, Ticket } from "lucide-react"

interface AdminDashboardProps {
  stats: {
    totalMovies: number
    totalBookings: number
    totalRevenue: number
    upcomingShowtimes: any[]
  }
}

export function AdminDashboard({ stats }: AdminDashboardProps) {
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="bookings">Bookings</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Movies</CardTitle>
              <Film className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMovies}</div>
              <p className="text-xs text-muted-foreground">Movies in the database</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">Tickets booked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">From all bookings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Shows</CardTitle>
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingShowtimes.length}</div>
              <p className="text-xs text-muted-foreground">Scheduled showtimes</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Showtimes</CardTitle>
            <CardDescription>Next scheduled movie screenings</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.upcomingShowtimes.length > 0 ? (
              <div className="space-y-4">
                {stats.upcomingShowtimes.map((showtime) => (
                  <div key={showtime.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <div className="font-medium">
                        {showtime.date} at {showtime.time}
                      </div>
                      <div className="text-sm text-muted-foreground">{showtime.availableSeats} seats available</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${showtime.price.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">per ticket</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">No upcoming showtimes scheduled</div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="bookings" className="space-y-6">
        {selectedBookingId ? (
          <BookingDetails bookingId={selectedBookingId} onBack={() => setSelectedBookingId(null)} />
        ) : (
          <BookingsList onSelectBooking={setSelectedBookingId} />
        )}
      </TabsContent>
    </Tabs>
  )
}
