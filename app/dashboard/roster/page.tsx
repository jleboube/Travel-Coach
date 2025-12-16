import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { db } from '@/lib/db'
import { PlayerCard } from '@/components/roster/player-card'
import { PlayerFormDialog } from '@/components/roster/player-form-dialog'
import { RosterFilters } from '@/components/roster/roster-filters'
import { RosterUpload } from '@/components/roster/roster-upload'
import { Users, TrendingUp, Target } from 'lucide-react'

interface RosterPageProps {
  searchParams: Promise<{
    search?: string
    position?: string
    active?: string
  }>
}

export default async function RosterPage({ searchParams }: RosterPageProps) {
  const params = await searchParams
  const { search, position, active } = params

  // Build where clause based on filters
  const where: any = {}

  if (active !== undefined) {
    where.active = active === 'true'
  } else {
    where.active = true // Default to active players only
  }

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (position) {
    where.positions = { has: position }
  }

  const players = await db.player.findMany({
    where,
    include: {
      stats: {
        orderBy: { season: 'desc' },
        take: 1,
      },
    },
    orderBy: [
      { jerseyNumber: 'asc' },
      { lastName: 'asc' },
    ],
  })

  // Calculate roster stats
  const totalPlayers = players.length
  const totalActive = players.filter(p => p.active).length
  const positions = new Set(players.flatMap(p => p.positions))
  const avgGradYear = totalPlayers > 0
    ? Math.round(players.reduce((sum, p) => sum + p.graduationYear, 0) / totalPlayers)
    : new Date().getFullYear()

  const stats = [
    {
      name: 'Total Players',
      value: totalPlayers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Active Players',
      value: totalActive,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Unique Positions',
      value: positions.size,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Roster</h1>
          <p className="mt-2 text-gray-600">
            Manage your team roster and player profiles
          </p>
        </div>
        <div className="flex gap-2">
          <RosterUpload />
          <PlayerFormDialog />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
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

      {/* Filters */}
      <RosterFilters />

      {/* Player Grid */}
      {players.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No players found</h3>
            <p className="text-gray-600 text-center mb-4">
              {search || position
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by adding your first player to the roster.'}
            </p>
            {!search && !position && <PlayerFormDialog />}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}
    </div>
  )
}
