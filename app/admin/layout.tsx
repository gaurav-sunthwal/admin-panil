import type React from "react"
import Link from "next/link"
import { Film, LayoutDashboard, LogOut, Settings, Ticket, Users } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/40 p-4 hidden md:block">
        <div className="flex items-center gap-2 mb-8">
          <Film className="h-6 w-6" />
          <h1 className="text-xl font-bold">Movie Admin</h1>
        </div>
        <nav className="space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Film className="h-5 w-5" />
            Movies
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Ticket className="h-5 w-5" />
            Bookings
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Users className="h-5 w-5" />
            Customers
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
          <div className="pt-4 mt-4 border-t">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Exit Admin
            </Link>
          </div>
        </nav>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  )
}
