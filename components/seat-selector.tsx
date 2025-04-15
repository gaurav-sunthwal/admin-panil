"use client"

import type { Seat } from "@/lib/types"
import { cn } from "@/lib/utils"

interface SeatSelectorProps {
  seats: Seat[]
  selectedSeats: Seat[]
  onSeatToggle: (seat: Seat) => void
  isLoading: boolean
}

export function SeatSelector({ seats, selectedSeats, onSeatToggle, isLoading }: SeatSelectorProps) {
  if (isLoading) {
    return <div className="h-40 flex items-center justify-center">Loading seats...</div>
  }

  if (seats.length === 0) {
    return <div className="h-40 flex items-center justify-center">No seats available</div>
  }

  // Group seats by row
  const seatsByRow: Record<string, Seat[]> = {}
  seats.forEach((seat) => {
    if (!seatsByRow[seat.row]) {
      seatsByRow[seat.row] = []
    }
    seatsByRow[seat.row].push(seat)
  })

  // Sort rows alphabetically
  const rows = Object.keys(seatsByRow).sort()

  const isSeatSelected = (seat: Seat) => {
    return selectedSeats.some((s) => s.row === seat.row && s.number === seat.number)
  }

  return (
    <div className="space-y-6">
      <div className="w-full bg-muted py-2 text-center text-sm font-medium rounded-md">SCREEN</div>

      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row} className="flex items-center gap-2">
            <div className="w-6 text-center font-medium">{row}</div>
            <div className="flex flex-wrap gap-1">
              {seatsByRow[row].map((seat) => (
                <button
                  key={`${seat.row}${seat.number}`}
                  type="button"
                  className={cn(
                    "w-7 h-7 text-xs rounded-md flex items-center justify-center transition-colors",
                    seat.isBooked
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : isSeatSelected(seat)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80",
                  )}
                  onClick={() => onSeatToggle(seat)}
                  disabled={seat.isBooked}
                >
                  {seat.number}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-secondary"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-primary"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-muted"></div>
          <span>Booked</span>
        </div>
      </div>
    </div>
  )
}
