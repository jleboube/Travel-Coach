'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  calculateBattingAverage,
  calculateOBP,
  calculateSLG,
  calculateERA,
  calculateWHIP,
  calculateFieldingPercentage,
} from '@/lib/utils'

interface StatsDisplayProps {
  stats: {
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
  }
}

export function StatsDisplay({ stats }: StatsDisplayProps) {
  // Calculate hitting metrics
  const singles = stats.h - stats.doubles - stats.triples - stats.hr
  const avg = calculateBattingAverage(stats.h, stats.ab)
  const obp = calculateOBP(stats.h, stats.bb, stats.ab)
  const slg = calculateSLG(singles, stats.doubles, stats.triples, stats.hr, stats.ab)
  const ops = stats.ab > 0 ? (parseFloat(obp) + parseFloat(slg)).toFixed(3) : '.000'

  // Calculate pitching metrics
  const era = calculateERA(stats.er, stats.ip)
  const whip = calculateWHIP(stats.pitchingBB, stats.pitchingH, stats.ip)
  const kPer9 = stats.ip > 0 ? ((stats.pitchingK * 9) / stats.ip).toFixed(2) : '0.00'

  // Calculate fielding metrics
  const fieldingPct = calculateFieldingPercentage(stats.po, stats.a, stats.e)

  return (
    <Tabs defaultValue="hitting" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="hitting">Hitting</TabsTrigger>
        <TabsTrigger value="pitching">Pitching</TabsTrigger>
        <TabsTrigger value="fielding">Fielding</TabsTrigger>
      </TabsList>

      <TabsContent value="hitting" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">Key Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{avg}</p>
                <p className="text-sm text-gray-500">AVG</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{obp}</p>
                <p className="text-sm text-gray-500">OBP</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{slg}</p>
                <p className="text-sm text-gray-500">SLG</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{ops}</p>
                <p className="text-sm text-gray-500">OPS</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">Raw Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatItem label="AB" value={stats.ab} />
              <StatItem label="H" value={stats.h} />
              <StatItem label="2B" value={stats.doubles} />
              <StatItem label="3B" value={stats.triples} />
              <StatItem label="HR" value={stats.hr} />
              <StatItem label="RBI" value={stats.rbi} />
              <StatItem label="BB" value={stats.bb} />
              <StatItem label="K" value={stats.k} />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="pitching" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">Key Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{era}</p>
                <p className="text-sm text-gray-500">ERA</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{whip}</p>
                <p className="text-sm text-gray-500">WHIP</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{kPer9}</p>
                <p className="text-sm text-gray-500">K/9</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">Raw Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatItem label="IP" value={stats.ip.toFixed(1)} />
              <StatItem label="H" value={stats.pitchingH} />
              <StatItem label="R" value={stats.r} />
              <StatItem label="ER" value={stats.er} />
              <StatItem label="BB" value={stats.pitchingBB} />
              <StatItem label="K" value={stats.pitchingK} />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="fielding" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">Key Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{fieldingPct}</p>
                <p className="text-sm text-gray-500">Fielding Percentage</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">Raw Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <StatItem label="PO" value={stats.po} />
              <StatItem label="A" value={stats.a} />
              <StatItem label="E" value={stats.e} />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

function StatItem({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )
}
