'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { calculateBattingAverage, calculateERA } from '@/lib/utils'
import Link from 'next/link'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface PlayerCardProps {
  player: {
    id: string
    firstName: string
    lastName: string
    jerseyNumber: number
    photo?: string | null
    positions: string[]
    bats: string
    throws: string
    graduationYear: number
    stats?: Array<{
      season: string
      ab: number
      h: number
      ip: number
      er: number
    }>
  }
}

export function PlayerCard({ player }: PlayerCardProps) {
  const initials = `${player.firstName[0]}${player.lastName[0]}`

  // Get current season stats (most recent)
  const currentStats = player.stats?.[0]
  const battingAvg = currentStats
    ? calculateBattingAverage(currentStats.h, currentStats.ab)
    : '.000'
  const era = currentStats && currentStats.ip > 0
    ? calculateERA(currentStats.er, currentStats.ip)
    : '0.00'

  return (
    <Link href={`/dashboard/roster/${player.id}`}>
      <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={player.photo || undefined} alt={`${player.firstName} ${player.lastName}`} />
              <AvatarFallback className="text-lg font-semibold bg-blue-100 text-blue-600">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {player.firstName} {player.lastName}
                </h3>
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-900 text-white font-bold text-sm">
                  {player.jerseyNumber}
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {player.positions.map((position) => (
                  <Badge key={position} variant="secondary" className="text-xs">
                    {position}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Bats/Throws</p>
                  <p className="font-medium">{player.bats}/{player.throws}</p>
                </div>
                <div>
                  <p className="text-gray-500">Grad Year</p>
                  <p className="font-medium">{player.graduationYear}</p>
                </div>
              </div>

              {currentStats && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {currentStats.ab > 0 && (
                      <div>
                        <p className="text-gray-500">AVG</p>
                        <p className="font-bold text-blue-600">{battingAvg}</p>
                      </div>
                    )}
                    {currentStats.ip > 0 && (
                      <div>
                        <p className="text-gray-500">ERA</p>
                        <p className="font-bold text-green-600">{era}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
