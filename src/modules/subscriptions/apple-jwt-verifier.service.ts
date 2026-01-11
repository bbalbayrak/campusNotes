import { Injectable, Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';
import * as crypto from 'crypto';

interface ApplePublicKey {
  kty: string;
  kid: string;
  use: string;
  alg: string;
  n?: string;
  e?: string;
  x?: string;
  y?: string;
  crv?: string;
}

@Injectable()
export class AppleJwtVerifierService {
  private readonly logger = new Logger(AppleJwtVerifierService.name);
  private publicKeys: Map<string, string> = new Map();
  private lastFetch: Date | null = null;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Verify Apple JWT signature
   */
  async verifyAppleJWT(signedPayload: string): Promise<any> {
    try {
      // Decode header to get key ID (kid)
      const decoded = jwt.decode(signedPayload, { complete: true });

      if (!decoded || !decoded.header) {
        throw new Error('Invalid JWT structure');
      }

      const kid = decoded.header.kid as string;

      if (!kid) {
        throw new Error('No kid in JWT header');
      }

      // Get or fetch public key
      await this.ensurePublicKeys();
      let publicKey = this.publicKeys.get(kid);

      if (!publicKey) {
        // Refresh keys and try again
        await this.fetchPublicKeys(true);
        publicKey = this.publicKeys.get(kid);

        if (!publicKey) {
          throw new Error(`Public key not found for kid: ${kid}`);
        }
      }

      // Verify signature
      const verified = jwt.verify(signedPayload, publicKey, {
        algorithms: ['ES256'], // Apple uses ES256 for App Store notifications
      });

      return verified;
    } catch (error) {
      this.logger.error('Failed to verify Apple JWT:', error);
      throw error;
    }
  }

  /**
   * Ensure we have fresh public keys
   */
  private async ensurePublicKeys() {
    const now = new Date();

    // Fetch if we don't have keys or they're older than 24 hours
    if (
      !this.lastFetch ||
      now.getTime() - this.lastFetch.getTime() > this.CACHE_DURATION
    ) {
      await this.fetchPublicKeys(true);
    }
  }

  /**
   * Fetch Apple's public keys from their server
   */
  private async fetchPublicKeys(force = false) {
    if (!force && this.publicKeys.size > 0) {
      return;
    }

    try {
      this.logger.log('Fetching Apple public keys...');

      const response = await axios.get('https://appleid.apple.com/auth/keys');
      const keys: ApplePublicKey[] = response.data.keys;

      this.publicKeys.clear();

      for (const key of keys) {
        // Convert JWK to PEM format
        const publicKey = this.jwkToPem(key);
        this.publicKeys.set(key.kid, publicKey);
      }

      this.lastFetch = new Date();
      this.logger.log(`Fetched ${keys.length} Apple public keys`);
    } catch (error) {
      this.logger.error('Failed to fetch Apple public keys:', error);
      throw error;
    }
  }

  /**
   * Convert JWK (JSON Web Key) to PEM format
   * This is needed because jwt.verify() expects PEM format
   */
  private jwkToPem(jwk: ApplePublicKey): string {
    // Check key type
    if (jwk.kty !== 'RSA' && jwk.kty !== 'EC') {
      throw new Error(`Unsupported key type: ${jwk.kty}`);
    }

    if (jwk.kty === 'RSA') {
      return this.rsaJwkToPem(jwk);
    } else {
      return this.ecJwkToPem(jwk);
    }
  }

  /**
   * Convert RSA JWK to PEM
   */
  private rsaJwkToPem(jwk: ApplePublicKey): string {
    // Decode base64url to buffer
    const modulus = this.base64UrlToBuffer(jwk.n);
    const exponent = this.base64UrlToBuffer(jwk.e);

    // Create public key object
    const key = crypto.createPublicKey({
      key: {
        kty: 'RSA',
        n: modulus.toString('base64'),
        e: exponent.toString('base64'),
      },
      format: 'jwk',
    });

    // Export as PEM
    return key.export({ type: 'spki', format: 'pem' }) as string;
  }

  /**
   * Convert EC (Elliptic Curve) JWK to PEM
   * Apple uses EC keys for ES256 algorithm
   */
  private ecJwkToPem(jwk: ApplePublicKey): string {
    if (!jwk.x || !jwk.y) {
      throw new Error('EC key missing x or y coordinate');
    }

    // Decode coordinates
    const x = this.base64UrlToBuffer(jwk.x);
    const y = this.base64UrlToBuffer(jwk.y);

    // Determine curve name from algorithm
    let crv = 'P-256'; // Default for ES256
    if (jwk.alg === 'ES384') crv = 'P-384';
    if (jwk.alg === 'ES512') crv = 'P-521';

    // Create public key object
    const key = crypto.createPublicKey({
      key: {
        kty: 'EC',
        crv: crv,
        x: x.toString('base64'),
        y: y.toString('base64'),
      },
      format: 'jwk',
    });

    // Export as PEM
    return key.export({ type: 'spki', format: 'pem' }) as string;
  }

  /**
   * Decode base64url string to Buffer
   * Base64url is like base64 but URL-safe (no +, /, or =)
   */
  private base64UrlToBuffer(base64url: string): Buffer {
    // Replace URL-safe characters
    let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');

    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }

    return Buffer.from(base64, 'base64');
  }

  /**
   * Manual cache clear (for testing)
   */
  clearCache() {
    this.publicKeys.clear();
    this.lastFetch = null;
    this.logger.log('Public key cache cleared');
  }
}
