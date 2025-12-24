import { describe, it, expect, beforeAll } from '@jest/globals'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:9090'

describe('Team API', () => {
  let authToken: string

  beforeAll(async () => {
    // This would normally authenticate and get a real token
    // For now, we'll assume TOKEN is provided via environment
    authToken = process.env.TEST_AUTH_TOKEN || ''
  })

  describe('POST /api/teams/create', () => {
    it('should create a team and return properly formatted dates', async () => {
      const teamName = `Test Team ${Date.now()}`
      const response = await fetch(`${API_BASE_URL}/api/teams/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: teamName,
          season: '2025 Spring',
          ageGroup: '13U'
        })
      })

      expect(response.status).toBe(201)

      const data = await response.json()
      expect(data).toHaveProperty('team')
      expect(data.team).toHaveProperty('id')
      expect(data.team).toHaveProperty('name', teamName)
      expect(data.team).toHaveProperty('joinCode')

      // Verify dates are in ISO8601 format
      expect(data.team).toHaveProperty('createdAt')
      expect(data.team).toHaveProperty('updatedAt')

      // ISO8601 format validation
      const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      expect(data.team.createdAt).toMatch(iso8601Regex)
      expect(data.team.updatedAt).toMatch(iso8601Regex)

      // Verify dates can be parsed
      expect(() => new Date(data.team.createdAt)).not.toThrow()
      expect(() => new Date(data.team.updatedAt)).not.toThrow()
    })

    it('should return 409 for duplicate team name', async () => {
      const teamName = 'Raptors' // Known existing team
      const response = await fetch(`${API_BASE_URL}/api/teams/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: teamName,
          season: '2025 Spring'
        })
      })

      expect(response.status).toBe(409)
      const data = await response.json()
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('already exists')
    })

    it('should return 401 without authentication', async () => {
      const response = await fetch(`${API_BASE_URL}/api/teams/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Unauthenticated Team',
          season: '2025 Spring'
        })
      })

      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/teams/join', () => {
    it('should join a team with valid code and return properly formatted dates', async () => {
      // This test requires a valid join code
      // You would need to create a team first or use a known code
      const joinCode = process.env.TEST_JOIN_CODE || ''

      if (!joinCode) {
        console.log('Skipping join test - no TEST_JOIN_CODE provided')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/teams/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          joinCode
        })
      })

      if (response.status === 409) {
        // Already a member, that's okay for this test
        return
      }

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data).toHaveProperty('team')

      // Verify dates are in ISO8601 format
      const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      expect(data.team.createdAt).toMatch(iso8601Regex)
      expect(data.team.updatedAt).toMatch(iso8601Regex)
    })

    it('should return 404 for invalid join code', async () => {
      const response = await fetch(`${API_BASE_URL}/api/teams/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          joinCode: 'invalid-code-12345'
        })
      })

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('Invalid join code')
    })
  })
})
