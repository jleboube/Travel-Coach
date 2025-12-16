import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { StatsDisplay } from '@/components/roster/stats-display'
import { PlayerFormDialog } from '@/components/roster/player-form-dialog'
import { PlayerStatsChart } from '@/components/roster/player-stats-chart'
import { CustomMetricsDisplay } from '@/components/roster/custom-metrics-display'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, Edit, Mail, Phone, Calendar, Award } from 'lucide-react'
import Link from 'next/link'

interface PlayerProfilePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PlayerProfilePage({ params }: PlayerProfilePageProps) {
  const { id } = await params

  const player = await db.player.findUnique({
    where: { id },
    include: {
      stats: {
        orderBy: { season: 'desc' },
      },
      customMetrics: {
        orderBy: { date: 'desc' },
      },
      gameStats: {
        include: {
          game: true,
        },
        orderBy: {
          game: {
            date: 'desc',
          },
        },
        take: 10,
      },
    },
  })

  if (!player) {
    notFound()
  }

  const initials = `${player.firstName[0]}${player.lastName[0]}`
  const currentSeasonStats = player.stats[0]

  // Calculate career totals
  const careerStats = player.stats.reduce(
    (acc, stat) => ({
      season: 'Career',
      ab: acc.ab + stat.ab,
      h: acc.h + stat.h,
      doubles: acc.doubles + stat.doubles,
      triples: acc.triples + stat.triples,
      hr: acc.hr + stat.hr,
      rbi: acc.rbi + stat.rbi,
      bb: acc.bb + stat.bb,
      k: acc.k + stat.k,
      ip: acc.ip + stat.ip,
      pitchingH: acc.pitchingH + stat.pitchingH,
      r: acc.r + stat.r,
      er: acc.er + stat.er,
      pitchingBB: acc.pitchingBB + stat.pitchingBB,
      pitchingK: acc.pitchingK + stat.pitchingK,
      po: acc.po + stat.po,
      a: acc.a + stat.a,
      e: acc.e + stat.e,
    }),
    {
      season: 'Career',
      ab: 0,
      h: 0,
      doubles: 0,
      triples: 0,
      hr: 0,
      rbi: 0,
      bb: 0,
      k: 0,
      ip: 0,
      pitchingH: 0,
      r: 0,
      er: 0,
      pitchingBB: 0,
      pitchingK: 0,
      po: 0,
      a: 0,
      e: 0,
    }
  )

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link href="/dashboard/roster">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Roster
        </Button>
      </Link>

      {/* Player Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-32 w-32">
              <AvatarImage src={player.photo || undefined} alt={`${player.firstName} ${player.lastName}`} />
              <AvatarFallback className="text-4xl font-bold bg-blue-100 text-blue-600">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {player.firstName} {player.lastName}
                    </h1>
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-900 text-white font-bold text-xl">
                      {player.jerseyNumber}
                    </div>
                  </div>
                  {!player.active && (
                    <Badge variant="secondary" className="mt-2">Inactive</Badge>
                  )}
                </div>
                <PlayerFormDialog
                  player={player}
                  trigger={
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  }
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {player.positions.map((position) => (
                  <Badge key={position} variant="default">
                    {position}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Bats</p>
                  <p className="text-lg font-semibold">{player.bats}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Throws</p>
                  <p className="text-lg font-semibold">{player.throws}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Grad Year</p>
                  <p className="text-lg font-semibold">{player.graduationYear}</p>
                </div>
                {player.birthDate && (
                  <div>
                    <p className="text-sm text-gray-500">Birth Date</p>
                    <p className="text-lg font-semibold">{formatDate(player.birthDate)}</p>
                  </div>
                )}
              </div>

              {/* Parent Contact Info */}
              {(player.parentName || player.parentEmail || player.parentPhone) && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Parent/Guardian Contact</h3>
                    <div className="space-y-1">
                      {player.parentName && (
                        <p className="text-sm text-gray-600">
                          <Award className="h-4 w-4 inline mr-2" />
                          {player.parentName}
                        </p>
                      )}
                      {player.parentEmail && (
                        <p className="text-sm text-gray-600">
                          <Mail className="h-4 w-4 inline mr-2" />
                          <a href={`mailto:${player.parentEmail}`} className="text-blue-600 hover:underline">
                            {player.parentEmail}
                          </a>
                        </p>
                      )}
                      {player.parentPhone && (
                        <p className="text-sm text-gray-600">
                          <Phone className="h-4 w-4 inline mr-2" />
                          <a href={`tel:${player.parentPhone}`} className="text-blue-600 hover:underline">
                            {player.parentPhone}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Metrics */}
      {player.customMetrics.length > 0 && (
        <CustomMetricsDisplay metrics={player.customMetrics} playerId={player.id} />
      )}

      {/* Current Season Stats */}
      {currentSeasonStats && (
        <Card>
          <CardHeader>
            <CardTitle>Current Season Stats ({currentSeasonStats.season})</CardTitle>
            <CardDescription>Statistics for the current season</CardDescription>
          </CardHeader>
          <CardContent>
            <StatsDisplay stats={currentSeasonStats} />
          </CardContent>
        </Card>
      )}

      {/* Career Stats */}
      {player.stats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Career Totals</CardTitle>
            <CardDescription>Cumulative statistics across all seasons</CardDescription>
          </CardHeader>
          <CardContent>
            <StatsDisplay stats={careerStats} />
          </CardContent>
        </Card>
      )}

      {/* Historical Performance Charts */}
      {player.stats.length > 1 && (
        <PlayerStatsChart stats={player.stats} playerName={`${player.firstName} ${player.lastName}`} />
      )}

      {/* Season-by-Season Breakdown */}
      {player.stats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Season-by-Season Performance</CardTitle>
            <CardDescription>Historical statistics by season</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {player.stats.map((seasonStats) => (
                <div key={seasonStats.id}>
                  <h3 className="font-semibold text-lg mb-3">{seasonStats.season} Season</h3>
                  <StatsDisplay stats={seasonStats} />
                  <Separator className="mt-4" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Games */}
      {player.gameStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Game Stats</CardTitle>
            <CardDescription>Last 10 game performances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {player.gameStats.map((gameStat) => (
                <div
                  key={gameStat.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium">vs {gameStat.game.opponent}</p>
                    <p className="text-sm text-gray-500">{formatDate(gameStat.game.date)}</p>
                  </div>
                  <div className="text-right text-sm">
                    {gameStat.ab > 0 && (
                      <p>
                        <span className="font-semibold">{gameStat.h}-{gameStat.ab}</span>
                        {gameStat.hr > 0 && <span className="text-orange-600 ml-2">{gameStat.hr} HR</span>}
                        {gameStat.rbi > 0 && <span className="text-blue-600 ml-2">{gameStat.rbi} RBI</span>}
                      </p>
                    )}
                    {gameStat.ip > 0 && (
                      <p>
                        <span className="font-semibold">{gameStat.ip} IP</span>
                        <span className="text-green-600 ml-2">{gameStat.pitchingK} K</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {player.stats.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Award className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Statistics Yet</h3>
            <p className="text-gray-600 text-center">
              Statistics will appear here once games are recorded for this player.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
