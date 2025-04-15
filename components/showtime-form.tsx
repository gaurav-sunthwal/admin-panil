"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, Clock, DollarSign, Users } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { Showtime } from "@/lib/types"

const showtimeSchema = z.object({
  date: z.date({
    required_error: "Date is required",
  }),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format"),
  price: z.coerce.number().positive("Price must be positive"),
  totalSeats: z.coerce.number().int().positive("Total seats must be a positive integer"),
})

type ShowtimeFormValues = z.infer<typeof showtimeSchema>

interface ShowtimeFormProps {
  movieId: string
  onAddShowtime: (showtime: Omit<Showtime, "id">) => Promise<void>
  existingShowtimes: Showtime[]
}

export function ShowtimeForm({ movieId, onAddShowtime, existingShowtimes }: ShowtimeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ShowtimeFormValues>({
    resolver: zodResolver(showtimeSchema),
    defaultValues: {
      date: new Date(),
      time: "18:00",
      price: 12.99,
      totalSeats: 50,
    },
  })

  const onSubmit = async (values: ShowtimeFormValues) => {
    setIsSubmitting(true)
    try {
      await onAddShowtime({
        date: format(values.date, "yyyy-MM-dd"),
        time: values.time,
        price: values.price,
        totalSeats: values.totalSeats,
        availableSeats: values.totalSeats,
      })
      form.reset()
    } catch (error) {
      console.error("Failed to add showtime:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time (HH:MM)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="18:00" className="pl-10" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ticket Price</FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input type="number" step="0.01" className="pl-10" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="totalSeats"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Seats</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input type="number" className="pl-10" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Showtime"}
          </Button>
        </form>
      </Form>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Existing Showtimes</h3>
        {existingShowtimes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No showtimes added yet.</p>
        ) : (
          <div className="grid gap-4">
            {existingShowtimes.map((showtime) => (
              <Card key={showtime.id}>
                <CardHeader className="py-4">
                  <CardTitle className="text-base">
                    {showtime.date} at {showtime.time}
                  </CardTitle>
                  <CardDescription>${showtime.price.toFixed(2)} per ticket</CardDescription>
                </CardHeader>
                <CardContent className="py-2">
                  <p className="text-sm">
                    Available seats: {showtime.availableSeats} / {showtime.totalSeats}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
