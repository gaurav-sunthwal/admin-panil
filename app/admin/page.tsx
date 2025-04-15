import { getDashboardStats } from "@/lib/actions"
import { AdminDashboard } from "@/components/admin/dashboard"

export default async function AdminPage() {
  const stats = await getDashboardStats()

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <AdminDashboard stats={stats} />
    </main>
  )
}
