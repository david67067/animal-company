const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class TokenManager {
  constructor() {
    // In production, load these from environment variables
    this.accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || crypto.randomBytes(32).toString('hex');
    this.refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || crypto.randomBytes(32).toString('hex');
    this.accessTokenExpiry = '1h';
    this.refreshTokenExpiry = '7d';
    this.refreshTokenStore = new Map(); // In production, use a database
  }

  /**
   * Generate a new access token
   * @param {string} playerId - Player ID
   * @param {string} modId - Mod ID
   * @returns {string} Access token
   */
  generateAccessToken(playerId, modId) {
    const payload = {
      playerId,
      modId,
      type: 'access',
      iat: Math.floor(Date.now() / 1000),
    };

    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
      algorithm: 'HS256',
    });
  }

  /**
   * Generate a new refresh token
   * @param {string} playerId - Player ID
   * @param {string} modId - Mod ID
   * @returns {string} Refresh token
   */
  generateRefreshToken(playerId, modId) {
    const payload = {
      playerId,
      modId,
      type: 'refresh',
      tokenId: crypto.randomUUID(),
      iat: Math.floor(Date.now() / 1000),
    };

    const refreshToken = jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiry,
      algorithm: 'HS256',
    });

    // Store refresh token for tracking (in production, use a database)
    this.refreshTokenStore.set(payload.tokenId, {
      playerId,
      modId,
      createdAt: new Date(),
      revokedAt: null,
    });

    return refreshToken;
  }

  /**
   * Generate both access and refresh tokens
   * @param {string} playerId - Player ID
   * @param {string} modId - Mod ID
   * @returns {Object} Token pair
   */
  generateTokenPair(playerId, modId) {
    return {
      access_token: this.generateAccessToken(playerId, modId),
      refresh_token: this.generateRefreshToken(playerId, modId),
      token_type: 'Bearer',
      expires_in: 3600, // 1 hour in seconds
    };
  }

  /**
   * Verify an access token
   * @param {string} token - Access token to verify
   * @returns {Object|null} Decoded token or null if invalid
   */
  verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret, {
        algorithms: ['HS256'],
      });

      if (decoded.type !== 'access') {
        return null;
      }

      return decoded;
    } catch (error) {
      console.error('Access token verification failed:', error.message);
      return null;
    }
  }

  /**
   * Verify a refresh token
   * @param {string} token - Refresh token to verify
   * @returns {Object|null} Decoded token or null if invalid
   */
  verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret, {
        algorithms: ['HS256'],
      });

      if (decoded.type !== 'refresh') {
        return null;
      }

      // Check if token has been revoked
      const tokenData = this.refreshTokenStore.get(decoded.tokenId);
      if (!tokenData || tokenData.revokedAt) {
        return null;
      }

      return decoded;
    } catch (error) {
      console.error('Refresh token verification failed:', error.message);
      return null;
    }
  }

  /**
   * Refresh an access token using a refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Object|null} New token pair or null if refresh fails
   */
  refreshAccessToken(refreshToken) {
    const decoded = this.verifyRefreshToken(refreshToken);

    if (!decoded) {
      return null;
    }

    return this.generateTokenPair(decoded.playerId, decoded.modId);
  }

  /**
   * Revoke a refresh token
   * @param {string} token - Refresh token to revoke
   * @returns {boolean} Success status
   */
  revokeRefreshToken(token) {
    try {
      const decoded = jwt.decode(token);

      if (!decoded || decoded.type !== 'refresh') {
        return false;
      }

      const tokenData = this.refreshTokenStore.get(decoded.tokenId);
      if (tokenData) {
        tokenData.revokedAt = new Date();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token revocation failed:', error.message);
      return false;
    }
  }

  /**
   * Decode token without verification (for debugging)
   * @param {string} token - Token to decode
   * @returns {Object|null} Decoded token or null
   */
  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get token info
   * @param {string} token - Token to analyze
   * @returns {Object} Token information
   */
  getTokenInfo(token) {
    const decoded = this.decodeToken(token);

    if (!decoded) {
      return { valid: false };
    }

    const now = Math.floor(Date.now() / 1000);
    const isExpired = decoded.exp < now;

    return {
      valid: !isExpired,
      playerId: decoded.playerId,
      modId: decoded.modId,
      type: decoded.type,
      issuedAt: new Date(decoded.iat * 1000),
      expiresAt: new Date(decoded.exp * 1000),
      isExpired,
    };
  }
}

module.exports = TokenManager;
