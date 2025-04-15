"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShowtimeForm } from "@/components/showtime-form"
import type { Movie, Showtime } from "@/lib/types"
import { addMovie, updateMovie, getMovies, addShowtime } from "@/lib/actions"

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  director: z.string().min(1, "Director is required"),
  year: z.coerce
    .number()
    .min(1888, "Year must be 1888 or later")
    .max(new Date().getFullYear() + 5, "Year cannot be in the far future"),
  genre: z.string().min(1, "Genre is required"),
  posterUrl: z.string().url("Must be a valid URL").or(z.literal("")),
})

type FormValues = z.infer<typeof formSchema>

interface MovieDialogProps {
  movie?: Movie
  open: boolean
  onOpenChange: (open: boolean) => void
  setMovies?: (movies: Movie[]) => void
}

export function MovieDialog({ movie, open, onOpenChange, setMovies }: MovieDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const isEditing = !!movie

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: movie?.title || "",
      director: movie?.director || "",
      year: movie?.year || new Date().getFullYear(),
      genre: movie?.genre || "",
      posterUrl: movie?.posterUrl || "",
    },
  })

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    try {
      if (isEditing && movie) {
        await updateMovie({ ...values, id: movie.id, showtimes: movie.showtimes })
      } else {
        await addMovie(values)
      }

      if (setMovies) {
        const updatedMovies = await getMovies()
        setMovies(updatedMovies)
      }

      onOpenChange(false)
    } catch (error) {
      console.error("Failed to save movie:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddShowtime = async (showtime: Omit<Showtime, "id">) => {
    if (!movie) return

    try {
      await addShowtime(movie.id, showtime)
      if (setMovies) {
        const updatedMovies = await getMovies()
        setMovies(updatedMovies)
      }
    } catch (error) {
      console.error("Failed to add showtime:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Movie" : "Add New Movie"}</DialogTitle>
        </DialogHeader>

        {isEditing ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Movie Details</TabsTrigger>
              <TabsTrigger value="showtimes">Showtimes</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter movie title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="director"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Director</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter director name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Release Year</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Enter release year" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="genre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Genre</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter genre" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="posterUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Poster URL</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter poster image URL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Updating..." : "Update Movie"}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="showtimes">
              <ShowtimeForm
                movieId={movie.id}
                onAddShowtime={handleAddShowtime}
                existingShowtimes={movie.showtimes || []}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter movie title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="director"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Director</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter director name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Release Year</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter release year" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter genre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="posterUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Poster URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter poster image URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Movie"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
