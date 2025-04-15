"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Database, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSetup = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/setup-db")
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Failed to set up database")
      }

      setIsComplete(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Database Setup</CardTitle>
          <CardDescription>Initialize your movie management system database</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <Database className="h-8 w-8 text-muted-foreground" />
            <div>
              <h3 className="font-medium">Neon PostgreSQL Database</h3>
              <p className="text-sm text-muted-foreground">
                This will create all necessary tables and seed initial data
              </p>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isComplete && (
            <Alert variant="default" className="border-green-500 text-green-500">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Database setup completed successfully!</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {isComplete ? (
            <div className="flex gap-4 w-full">
              <Button asChild className="w-full">
                <Link href="/">Go to Movies</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin">Go to Admin</Link>
              </Button>
            </div>
          ) : (
            <Button onClick={handleSetup} disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Setting Up..." : "Initialize Database"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
