"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MovieDialog } from "@/components/movie-dialog"

export function AddMovieButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Movie
      </Button>
      <MovieDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
