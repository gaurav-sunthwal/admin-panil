"use client"

import { useState } from "react"
import { Pencil, Trash2, Ticket } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Movie } from "@/lib/types"
import { deleteMovie, getMovies } from "@/lib/actions"
import { MovieDialog } from "@/components/movie-dialog"
import { BookingDialog } from "@/components/booking-dialog"

interface MovieCardProps {
  movie: Movie
  setMovies: (movies: Movie[]) => void
}

export function MovieCard({ movie, setMovies }: MovieCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteMovie(movie.id)
      const updatedMovies = await getMovies()
      setMovies(updatedMovies)
    } catch (error) {
      console.error("Failed to delete movie:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const hasShowtimes = movie.showtimes && movie.showtimes.length > 0
  const availableSeats = movie.showtimes?.reduce((total, st) => total + st.availableSeats, 0) || 0

  return (
    <>
      <Card className="overflow-hidden">
        <div className="aspect-video relative overflow-hidden bg-muted">
          {movie.posterUrl ? (
            <img
              src={movie.posterUrl || "/placeholder.svg"}
              alt={`${movie.title} poster`}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-muted">
              <span className="text-muted-foreground">No poster available</span>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-2">{movie.title}</h2>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Director:</span> {movie.director}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Year:</span> {movie.year}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary">{movie.genre}</Badge>
              {hasShowtimes && (
                <Badge variant="outline" className="ml-auto">
                  {movie.showtimes?.length} showtimes
                </Badge>
              )}
            </div>
            {hasShowtimes && (
              <p className="text-sm text-muted-foreground mt-2">
                <span className="font-medium text-foreground">Available seats:</span> {availableSeats}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
          {hasShowtimes && (
            <Button variant="default" size="sm" onClick={() => setIsBooking(true)} className="ml-auto">
              <Ticket className="h-4 w-4 mr-2" />
              Book Tickets
            </Button>
          )}
        </CardFooter>
      </Card>

      {isEditing && <MovieDialog movie={movie} open={isEditing} onOpenChange={setIsEditing} setMovies={setMovies} />}
      {isBooking && <BookingDialog movie={movie} open={isBooking} onOpenChange={setIsBooking} />}
    </>
  )
}
