'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { Activity, Zap, Target } from 'lucide-react'

interface CustomMetricsDisplayProps {
  metrics: Array<{
    id: string
    name: string
    value: string
    date: Date
  }>
  playerId: string
}

const metricIcons: Record<string, any> = {
  'Exit Velocity': Zap,
  'Exit Velo': Zap,
  '60-Yard': Activity,
  '60 Yard': Activity,
  '60-yd': Activity,
  'Pop Time': Target,
  'Pop-Time': Target,
}

const metricColors: Record<string, string> = {
  'Exit Velocity': 'text-orange-600 bg-orange-100',
  'Exit Velo': 'text-orange-600 bg-orange-100',
  '60-Yard': 'text-blue-600 bg-blue-100',
  '60 Yard': 'text-blue-600 bg-blue-100',
  '60-yd': 'text-blue-600 bg-blue-100',
  'Pop Time': 'text-purple-600 bg-purple-100',
  'Pop-Time': 'text-purple-600 bg-purple-100',
}

function getMetricIcon(name: string) {
  for (const key in metricIcons) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return metricIcons[key]
    }
  }
  return Activity
}

function getMetricColor(name: string) {
  for (const key in metricColors) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return metricColors[key]
    }
  }
  return 'text-gray-600 bg-gray-100'
}

export function CustomMetricsDisplay({ metrics, playerId }: CustomMetricsDisplayProps) {
  // Group metrics by name to show latest value
  const latestMetrics = metrics.reduce((acc, metric) => {
    if (!acc[metric.name] || new Date(metric.date) > new Date(acc[metric.name].date)) {
      acc[metric.name] = metric
    }
    return acc
  }, {} as Record<string, typeof metrics[0]>)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Metrics</CardTitle>
        <CardDescription>Player-specific performance measurements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.values(latestMetrics).map((metric) => {
            const Icon = getMetricIcon(metric.name)
            const colorClass = getMetricColor(metric.name)

            return (
              <div
                key={metric.id}
                className="flex items-start space-x-3 p-4 rounded-lg border bg-white hover:shadow-md transition-shadow"
              >
                <div className={`p-3 rounded-lg ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500">{metric.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(metric.date)}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Historical View */}
        {metrics.length > Object.keys(latestMetrics).length && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Historical Measurements</h4>
            <div className="space-y-2">
              {metrics.slice(0, 10).map((metric) => (
                <div
                  key={metric.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="text-xs">
                      {metric.name}
                    </Badge>
                    <span className="font-semibold text-gray-900">{metric.value}</span>
                  </div>
                  <span className="text-sm text-gray-500">{formatDate(metric.date)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
