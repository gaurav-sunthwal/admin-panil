import { MovieList } from "@/components/movie-list"
import { AddMovieButton } from "@/components/add-movie-button"
import Link from "next/link"
import { LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Movie Management System</h1>
          <div className="flex gap-2">
            <AddMovieButton />
            <Button variant="outline" asChild>
              <Link href="/admin">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Admin
              </Link>
            </Button>
          </div>
        </div>
        <MovieList />
      </div>
    </main>
  )
}
