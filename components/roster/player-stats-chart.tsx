'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { calculateBattingAverage, calculateERA, calculateOBP, calculateSLG } from '@/lib/utils'

interface PlayerStatsChartProps {
  stats: Array<{
    season: string
    // Hitting
    ab: number
    h: number
    doubles: number
    triples: number
    hr: number
    rbi: number
    bb: number
    k: number
    // Pitching
    ip: number
    pitchingH: number
    r: number
    er: number
    pitchingBB: number
    pitchingK: number
    // Fielding
    po: number
    a: number
    e: number
  }>
  playerName: string
}

export function PlayerStatsChart({ stats, playerName }: PlayerStatsChartProps) {
  // Prepare data for hitting charts
  const hittingData = stats
    .filter(s => s.ab > 0)
    .reverse()
    .map(stat => {
      const singles = stat.h - stat.doubles - stat.triples - stat.hr
      return {
        season: stat.season,
        AVG: parseFloat(calculateBattingAverage(stat.h, stat.ab)),
        OBP: parseFloat(calculateOBP(stat.h, stat.bb, stat.ab)),
        SLG: parseFloat(calculateSLG(singles, stat.doubles, stat.triples, stat.hr, stat.ab)),
        HR: stat.hr,
        RBI: stat.rbi,
        H: stat.h,
      }
    })

  // Prepare data for pitching charts
  const pitchingData = stats
    .filter(s => s.ip > 0)
    .reverse()
    .map(stat => ({
      season: stat.season,
      ERA: parseFloat(calculateERA(stat.er, stat.ip)),
      IP: stat.ip,
      K: stat.pitchingK,
      BB: stat.pitchingBB,
    }))

  return (
    <div className="space-y-6">
      {/* Hitting Performance Chart */}
      {hittingData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Hitting Performance Trends</CardTitle>
            <CardDescription>
              Batting average, on-base percentage, and slugging percentage over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hittingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="season" />
                <YAxis domain={[0, 1]} />
                <Tooltip
                  formatter={(value: number) => value.toFixed(3)}
                  labelStyle={{ color: '#000' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="AVG"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Batting Average"
                />
                <Line
                  type="monotone"
                  dataKey="OBP"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="On-Base %"
                />
                <Line
                  type="monotone"
                  dataKey="SLG"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Slugging %"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Power Numbers Chart */}
      {hittingData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Power & Production</CardTitle>
            <CardDescription>Home runs and RBIs by season</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hittingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="season" />
                <YAxis />
                <Tooltip labelStyle={{ color: '#000' }} />
                <Legend />
                <Bar dataKey="HR" fill="#f97316" name="Home Runs" />
                <Bar dataKey="RBI" fill="#3b82f6" name="RBIs" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Pitching Performance Chart */}
      {pitchingData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pitching Performance Trends</CardTitle>
            <CardDescription>ERA and innings pitched over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={pitchingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="season" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip labelStyle={{ color: '#000' }} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="ERA"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="ERA"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="IP"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Innings Pitched"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Strikeout Chart */}
      {pitchingData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Strikeouts & Walks</CardTitle>
            <CardDescription>Pitching control metrics by season</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pitchingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="season" />
                <YAxis />
                <Tooltip labelStyle={{ color: '#000' }} />
                <Legend />
                <Bar dataKey="K" fill="#10b981" name="Strikeouts" />
                <Bar dataKey="BB" fill="#f59e0b" name="Walks" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
