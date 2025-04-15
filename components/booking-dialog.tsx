"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Check, ChevronsUpDown } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { SeatSelector } from "@/components/seat-selector"
import type { Movie, Showtime, Seat, Booking } from "@/lib/types"
import { getSeats, createBooking } from "@/lib/actions"

const formSchema = z.object({
  showtimeId: z.string().min(1, "Please select a showtime"),
  customerName: z.string().min(1, "Name is required"),
  customerEmail: z.string().email("Invalid email address"),
})

type FormValues = z.infer<typeof formSchema>

interface BookingDialogProps {
  movie: Movie
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BookingDialog({ movie, open, onOpenChange }: BookingDialogProps) {
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null)
  const [seats, setSeats] = useState<Seat[]>([])
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)
  const [bookingReference, setBookingReference] = useState("")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      showtimeId: "",
      customerName: "",
      customerEmail: "",
    },
  })

  const handleShowtimeChange = async (showtimeId: string) => {
    setIsLoading(true)
    setSelectedSeats([])

    try {
      const showtime = movie.showtimes?.find((st) => st.id === showtimeId) || null
      setSelectedShowtime(showtime)

      if (showtime) {
        const seatsData = await getSeats(movie.id, showtimeId)
        setSeats(seatsData)
      }
    } catch (error) {
      console.error("Failed to fetch seats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSeatToggle = (seat: Seat) => {
    if (seat.isBooked) return

    const isSeatSelected = selectedSeats.some((s) => s.row === seat.row && s.number === seat.number)

    if (isSeatSelected) {
      setSelectedSeats(selectedSeats.filter((s) => !(s.row === seat.row && s.number === seat.number)))
    } else {
      setSelectedSeats([...selectedSeats, seat])
    }
  }

  const onSubmit = async (values: FormValues) => {
    if (selectedSeats.length === 0) {
      form.setError("showtimeId", {
        type: "manual",
        message: "Please select at least one seat",
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (!selectedShowtime) throw new Error("No showtime selected")

      const bookingData: Omit<Booking, "id" | "bookingDate"> = {
        movieId: movie.id,
        showtimeId: values.showtimeId,
        seats: selectedSeats,
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        totalPrice: selectedShowtime.price * selectedSeats.length,
      }

      const booking = await createBooking(bookingData)
      setBookingReference(booking.id)
      setBookingComplete(true)
    } catch (error) {
      console.error("Failed to create booking:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetBooking = () => {
    setBookingComplete(false)
    setSelectedShowtime(null)
    setSelectedSeats([])
    setSeats([])
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={bookingComplete ? resetBooking : onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{bookingComplete ? "Booking Confirmed" : `Book Tickets for ${movie.title}`}</DialogTitle>
        </DialogHeader>

        {bookingComplete ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Confirmation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Movie:</div>
                  <div className="text-sm">{movie.title}</div>

                  <div className="text-sm font-medium">Date & Time:</div>
                  <div className="text-sm">
                    {selectedShowtime?.date} at {selectedShowtime?.time}
                  </div>

                  <div className="text-sm font-medium">Seats:</div>
                  <div className="text-sm">{selectedSeats.map((seat) => `${seat.row}${seat.number}`).join(", ")}</div>

                  <div className="text-sm font-medium">Total Price:</div>
                  <div className="text-sm">${(selectedShowtime?.price || 0) * selectedSeats.length}</div>

                  <div className="text-sm font-medium">Booking Reference:</div>
                  <div className="text-sm font-mono">{bookingReference}</div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={resetBooking} className="w-full">
                  Done
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="showtimeId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Select Showtime</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                          >
                            {field.value
                              ? movie.showtimes?.find((showtime) => showtime.id === field.value)
                                ? `${movie.showtimes.find((showtime) => showtime.id === field.value)?.date} at ${
                                    movie.showtimes.find((showtime) => showtime.id === field.value)?.time
                                  }`
                                : "Select showtime"
                              : "Select showtime"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search showtimes..." />
                          <CommandList>
                            <CommandEmpty>No showtimes found.</CommandEmpty>
                            <CommandGroup>
                              {movie.showtimes?.map((showtime) => (
                                <CommandItem
                                  key={showtime.id}
                                  value={showtime.id}
                                  onSelect={() => {
                                    form.setValue("showtimeId", showtime.id)
                                    handleShowtimeChange(showtime.id)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      showtime.id === field.value ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  {showtime.date} at {showtime.time} - ${showtime.price.toFixed(2)}
                                  {showtime.availableSeats === 0 && " (Sold Out)"}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedShowtime && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Select Seats</h3>
                    <SeatSelector
                      seats={seats}
                      selectedSeats={selectedSeats}
                      onSeatToggle={handleSeatToggle}
                      isLoading={isLoading}
                    />

                    {selectedSeats.length > 0 && (
                      <div className="text-sm">
                        Selected seats: {selectedSeats.map((seat) => `${seat.row}${seat.number}`).join(", ")}
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Customer Information</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="customerEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Booking Summary</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm">Movie:</div>
                      <div className="text-sm font-medium">{movie.title}</div>

                      <div className="text-sm">Date & Time:</div>
                      <div className="text-sm font-medium">
                        {selectedShowtime.date} at {selectedShowtime.time}
                      </div>

                      <div className="text-sm">Number of Tickets:</div>
                      <div className="text-sm font-medium">{selectedSeats.length}</div>

                      <div className="text-sm">Price per Ticket:</div>
                      <div className="text-sm font-medium">${selectedShowtime.price.toFixed(2)}</div>

                      <div className="text-sm font-semibold">Total:</div>
                      <div className="text-sm font-semibold">
                        ${(selectedShowtime.price * selectedSeats.length).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || selectedSeats.length === 0 || !selectedShowtime}>
                  {isSubmitting ? "Processing..." : "Complete Booking"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
