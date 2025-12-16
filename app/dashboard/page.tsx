import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/db"
import { Calendar, Users, Plane, Trophy } from "lucide-react"

export default async function DashboardPage() {
  const [playerCount, eventCount, tournamentCount, gameCount] = await Promise.all([
    db.player.count({ where: { active: true } }),
    db.event.count(),
    db.tournament.count(),
    db.game.count(),
  ])

  const stats = [
    {
      name: "Active Players",
      value: playerCount,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      name: "Scheduled Events",
      value: eventCount,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      name: "Tournaments",
      value: tournamentCount,
      icon: Plane,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      name: "Games Played",
      value: gameCount,
      icon: Trophy,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to CoachHub Baseball - Your team management command center
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.name}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for team management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/dashboard/schedule" className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-medium">Add Event</div>
              <div className="text-sm text-gray-600">Schedule a practice, game, or tournament</div>
            </a>
            <a href="/dashboard/roster" className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-medium">Manage Roster</div>
              <div className="text-sm text-gray-600">Add or update player information</div>
            </a>
            <a href="/dashboard/games" className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-medium">Enter Game Stats</div>
              <div className="text-sm text-gray-600">Record player statistics from recent games</div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                No recent activity to display.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
