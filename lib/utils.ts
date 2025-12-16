import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d)
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d)
}

export function calculateBattingAverage(hits: number, atBats: number): string {
  if (atBats === 0) return '.000'
  return (hits / atBats).toFixed(3).substring(1)
}

export function calculateOBP(hits: number, walks: number, atBats: number, hbp: number = 0, sf: number = 0): string {
  const denominator = atBats + walks + hbp + sf
  if (denominator === 0) return '.000'
  return ((hits + walks + hbp) / denominator).toFixed(3).substring(1)
}

export function calculateSLG(singles: number, doubles: number, triples: number, hrs: number, atBats: number): string {
  if (atBats === 0) return '.000'
  const totalBases = singles + (doubles * 2) + (triples * 3) + (hrs * 4)
  return (totalBases / atBats).toFixed(3).substring(1)
}

export function calculateERA(earnedRuns: number, inningsPitched: number): string {
  if (inningsPitched === 0) return '0.00'
  return ((earnedRuns * 9) / inningsPitched).toFixed(2)
}

export function calculateWHIP(walks: number, hits: number, inningsPitched: number): string {
  if (inningsPitched === 0) return '0.00'
  return ((walks + hits) / inningsPitched).toFixed(2)
}

export function calculateFieldingPercentage(putOuts: number, assists: number, errors: number): string {
  const total = putOuts + assists + errors
  if (total === 0) return '1.000'
  return ((putOuts + assists) / total).toFixed(3)
}
