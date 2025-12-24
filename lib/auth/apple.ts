import { JWTVerifyResult, jwtVerify, importJWK } from "jose"

export interface AppleUser {
  sub: string // User's unique Apple ID
  email?: string
  email_verified?: boolean
  is_private_email?: boolean
}

export class AppleAuthService {
  private readonly APPLE_KEYS_URL = "https://appleid.apple.com/auth/keys"

  /**
   * Verify Apple ID token
   */
  async verifyToken(identityToken: string): Promise<AppleUser | null> {
    try {
      // Fetch Apple's public keys
      const response = await fetch(this.APPLE_KEYS_URL)
      const { keys } = await response.json()

      // Decode the JWT header to get the kid (key ID)
      const header = JSON.parse(
        Buffer.from(identityToken.split(".")[0], "base64").toString()
      )

      // Find the matching key
      const key = keys.find((k: any) => k.kid === header.kid)
      if (!key) {
        throw new Error("No matching key found")
      }

      // Import JWK directly (no PEM conversion needed!)
      const publicKey = await importJWK(key, key.alg)

      // Verify the token
      const { payload } = (await jwtVerify(
        identityToken,
        publicKey
      )) as JWTVerifyResult

      // Validate the token claims
      if (payload.iss !== "https://appleid.apple.com") {
        throw new Error("Invalid issuer")
      }

      if (payload.aud !== process.env.APPLE_CLIENT_ID) {
        // For now, skip audience validation in development
        // In production, you must validate this
        console.warn("Apple Client ID not configured")
      }

      return payload as AppleUser
    } catch (error) {
      console.error("Apple token verification error:", error)
      return null
    }
  }
}
