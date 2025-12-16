'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import { useState, useTransition } from 'react'

const POSITION_OPTIONS = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'OF', 'INF', 'UTIL']

export function RosterFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const currentPosition = searchParams.get('position')

  const handleSearchChange = (value: string) => {
    setSearch(value)
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set('search', value)
    } else {
      params.delete('search')
    }

    startTransition(() => {
      router.push(`/dashboard/roster?${params.toString()}`)
    })
  }

  const handlePositionFilter = (position: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (currentPosition === position) {
      params.delete('position')
    } else {
      params.set('position', position)
    }

    startTransition(() => {
      router.push(`/dashboard/roster?${params.toString()}`)
    })
  }

  const clearFilters = () => {
    setSearch('')
    startTransition(() => {
      router.push('/dashboard/roster')
    })
  }

  const hasFilters = search || currentPosition

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search players by name..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        {hasFilters && (
          <Button variant="outline" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {POSITION_OPTIONS.map((position) => (
          <Button
            key={position}
            variant={currentPosition === position ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePositionFilter(position)}
          >
            {position}
          </Button>
        ))}
      </div>
    </div>
  )
}
