const TokenManager = require('./tokenManager');

describe('TokenManager', () => {
  let tokenManager;

  beforeEach(() => {
    tokenManager = new TokenManager();
  });

  describe('generateAccessToken', () => {
    test('should generate a valid access token', () => {
      const token = tokenManager.generateAccessToken('player123', 'mod456');
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    test('should include playerId and modId in token payload', () => {
      const token = tokenManager.generateAccessToken('player123', 'mod456');
      const decoded = tokenManager.decodeToken(token);
      expect(decoded.playerId).toBe('player123');
      expect(decoded.modId).toBe('mod456');
      expect(decoded.type).toBe('access');
    });

    test('should set correct token type', () => {
      const token = tokenManager.generateAccessToken('player1', 'mod1');
      const decoded = tokenManager.decodeToken(token);
      expect(decoded.type).toBe('access');
    });
  });

  describe('generateRefreshToken', () => {
    test('should generate a valid refresh token', () => {
      const token = tokenManager.generateRefreshToken('player123', 'mod456');
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    test('should include playerId and modId in refresh token', () => {
      const token = tokenManager.generateRefreshToken('player123', 'mod456');
      const decoded = tokenManager.decodeToken(token);
      expect(decoded.playerId).toBe('player123');
      expect(decoded.modId).toBe('mod456');
      expect(decoded.type).toBe('refresh');
    });

    test('should store refresh token in token store', () => {
      const token = tokenManager.generateRefreshToken('player123', 'mod456');
      const decoded = tokenManager.decodeToken(token);
      const tokenData = tokenManager.refreshTokenStore.get(decoded.tokenId);
      expect(tokenData).toBeDefined();
      expect(tokenData.playerId).toBe('player123');
      expect(tokenData.modId).toBe('mod456');
      expect(tokenData.revokedAt).toBeNull();
    });
  });

  describe('generateTokenPair', () => {
    test('should generate both access and refresh tokens', () => {
      const tokens = tokenManager.generateTokenPair('player123', 'mod456');
      expect(tokens.access_token).toBeDefined();
      expect(tokens.refresh_token).toBeDefined();
      expect(tokens.token_type).toBe('Bearer');
      expect(tokens.expires_in).toBe(3600);
    });

    test('should have different token values', () => {
      const tokens = tokenManager.generateTokenPair('player123', 'mod456');
      expect(tokens.access_token).not.toBe(tokens.refresh_token);
    });

    test('should have correct payload in both tokens', () => {
      const tokens = tokenManager.generateTokenPair('player123', 'mod456');
      const accessDecoded = tokenManager.decodeToken(tokens.access_token);
      const refreshDecoded = tokenManager.decodeToken(tokens.refresh_token);
      expect(accessDecoded.playerId).toBe('player123');
      expect(accessDecoded.modId).toBe('mod456');
      expect(refreshDecoded.playerId).toBe('player123');
      expect(refreshDecoded.modId).toBe('mod456');
    });
  });

  describe('verifyAccessToken', () => {
    test('should verify a valid access token', () => {
      const token = tokenManager.generateAccessToken('player123', 'mod456');
      const decoded = tokenManager.verifyAccessToken(token);
      expect(decoded).toBeDefined();
      expect(decoded.playerId).toBe('player123');
      expect(decoded.modId).toBe('mod456');
    });

    test('should return null for invalid token', () => {
      const result = tokenManager.verifyAccessToken('invalid.token.here');
      expect(result).toBeNull();
    });

    test('should return null for refresh token (wrong type)', () => {
      const refreshToken = tokenManager.generateRefreshToken('player123', 'mod456');
      const result = tokenManager.verifyAccessToken(refreshToken);
      expect(result).toBeNull();
    });

    test('should return null for tampered token', () => {
      const token = tokenManager.generateAccessToken('player123', 'mod456');
      const tampered = token.slice(0, -5) + 'xxxxx';
      const result = tokenManager.verifyAccessToken(tampered);
      expect(result).toBeNull();
    });
  });

  describe('verifyRefreshToken', () => {
    test('should verify a valid refresh token', () => {
      const token = tokenManager.generateRefreshToken('player123', 'mod456');
      const decoded = tokenManager.verifyRefreshToken(token);
      expect(decoded).toBeDefined();
      expect(decoded.playerId).toBe('player123');
      expect(decoded.modId).toBe('mod456');
    });

    test('should return null for invalid token', () => {
      const result = tokenManager.verifyRefreshToken('invalid.token.here');
      expect(result).toBeNull();
    });

    test('should return null for access token (wrong type)', () => {
      const accessToken = tokenManager.generateAccessToken('player123', 'mod456');
      const result = tokenManager.verifyRefreshToken(accessToken);
      expect(result).toBeNull();
    });

    test('should return null for revoked token', () => {
      const token = tokenManager.generateRefreshToken('player123', 'mod456');
      tokenManager.revokeRefreshToken(token);
      const result = tokenManager.verifyRefreshToken(token);
      expect(result).toBeNull();
    });
  });

  describe('refreshAccessToken', () => {
    test('should generate new token pair from refresh token', () => {
      const tokens = tokenManager.generateTokenPair('player123', 'mod456');
      const newTokens = tokenManager.refreshAccessToken(tokens.refresh_token);
      expect(newTokens).toBeDefined();
      expect(newTokens.access_token).toBeDefined();
      expect(newTokens.refresh_token).toBeDefined();
    });

    test('should preserve playerId and modId after refresh', () => {
      const tokens = tokenManager.generateTokenPair('player123', 'mod456');
      const newTokens = tokenManager.refreshAccessToken(tokens.refresh_token);
      const newDecoded = tokenManager.decodeToken(newTokens.access_token);
      expect(newDecoded.playerId).toBe('player123');
      expect(newDecoded.modId).toBe('mod456');
    });

    test('should return null for invalid refresh token', () => {
      const result = tokenManager.refreshAccessToken('invalid.token.here');
      expect(result).toBeNull();
    });

    test('should return null for revoked refresh token', () => {
      const tokens = tokenManager.generateTokenPair('player123', 'mod456');
      tokenManager.revokeRefreshToken(tokens.refresh_token);
      const result = tokenManager.refreshAccessToken(tokens.refresh_token);
      expect(result).toBeNull();
    });

    test('should return null for access token (not refresh)', () => {
      const tokens = tokenManager.generateTokenPair('player123', 'mod456');
      const result = tokenManager.refreshAccessToken(tokens.access_token);
      expect(result).toBeNull();
    });
  });

  describe('revokeRefreshToken', () => {
    test('should revoke a valid refresh token', () => {
      const token = tokenManager.generateRefreshToken('player123', 'mod456');
      const result = tokenManager.revokeRefreshToken(token);
      expect(result).toBe(true);
    });

    test('should mark token as revoked in store', () => {
      const token = tokenManager.generateRefreshToken('player123', 'mod456');
      const decoded = tokenManager.decodeToken(token);
      const tokenDataBefore = tokenManager.refreshTokenStore.get(decoded.tokenId);
      expect(tokenDataBefore.revokedAt).toBeNull();

      tokenManager.revokeRefreshToken(token);
      const tokenDataAfter = tokenManager.refreshTokenStore.get(decoded.tokenId);
      expect(tokenDataAfter.revokedAt).not.toBeNull();
    });

    test('should return false for invalid token', () => {
      const result = tokenManager.revokeRefreshToken('invalid.token.here');
      expect(result).toBe(false);
    });

    test('should return false for access token', () => {
      const token = tokenManager.generateAccessToken('player123', 'mod456');
      const result = tokenManager.revokeRefreshToken(token);
      expect(result).toBe(false);
    });

    test('should prevent verification of revoked token', () => {
      const token = tokenManager.generateRefreshToken('player123', 'mod456');
      tokenManager.revokeRefreshToken(token);
      const verified = tokenManager.verifyRefreshToken(token);
      expect(verified).toBeNull();
    });
  });

  describe('decodeToken', () => {
    test('should decode a valid token', () => {
      const token = tokenManager.generateAccessToken('player123', 'mod456');
      const decoded = tokenManager.decodeToken(token);
      expect(decoded).toBeDefined();
      expect(decoded.playerId).toBe('player123');
      expect(decoded.modId).toBe('mod456');
    });

    test('should return null for invalid token', () => {
      const result = tokenManager.decodeToken('invalid.token.here');
      expect(result).toBeNull();
    });

    test('should decode without verification', () => {
      const token = tokenManager.generateAccessToken('player123', 'mod456');
      const decoded = tokenManager.decodeToken(token);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });
  });

  describe('getTokenInfo', () => {
    test('should return token information', () => {
      const token = tokenManager.generateAccessToken('player123', 'mod456');
      const info = tokenManager.getTokenInfo(token);
      expect(info.valid).toBe(true);
      expect(info.playerId).toBe('player123');
      expect(info.modId).toBe('mod456');
      expect(info.type).toBe('access');
      expect(info.isExpired).toBe(false);
    });

    test('should include timestamp information', () => {
      const token = tokenManager.generateAccessToken('player123', 'mod456');
      const info = tokenManager.getTokenInfo(token);
      expect(info.issuedAt).toBeInstanceOf(Date);
      expect(info.expiresAt).toBeInstanceOf(Date);
      expect(info.expiresAt.getTime()).toBeGreaterThan(info.issuedAt.getTime());
    });

    test('should return invalid for non-existent token', () => {
      const info = tokenManager.getTokenInfo('invalid.token.here');
      expect(info.valid).toBe(false);
    });

    test('should handle refresh tokens', () => {
      const token = tokenManager.generateRefreshToken('player123', 'mod456');
      const info = tokenManager.getTokenInfo(token);
      expect(info.valid).toBe(true);
      expect(info.type).toBe('refresh');
    });
  });

  describe('Integration Tests', () => {
    test('should handle complete login flow', () => {
      // 1. Generate tokens
      const tokens = tokenManager.generateTokenPair('player123', 'mod456');
      expect(tokens.access_token).toBeDefined();
      expect(tokens.refresh_token).toBeDefined();

      // 2. Verify access token
      const verified = tokenManager.verifyAccessToken(tokens.access_token);
      expect(verified.playerId).toBe('player123');

      // 3. Get token info
      const info = tokenManager.getTokenInfo(tokens.access_token);
      expect(info.valid).toBe(true);
    });

    test('should handle token refresh flow', () => {
      // 1. Initial login
      const tokens = tokenManager.generateTokenPair('player123', 'mod456');
      const firstAccessToken = tokens.access_token;

      // 2. Refresh tokens
      const newTokens = tokenManager.refreshAccessToken(tokens.refresh_token);
      const secondAccessToken = newTokens.access_token;

      // 3. Tokens should be different
      expect(firstAccessToken).not.toBe(secondAccessToken);

      // 4. Both should be valid
      expect(tokenManager.verifyAccessToken(firstAccessToken)).toBeDefined();
      expect(tokenManager.verifyAccessToken(secondAccessToken)).toBeDefined();
    });

    test('should handle logout flow', () => {
      // 1. Generate tokens
      const tokens = tokenManager.generateTokenPair('player123', 'mod456');

      // 2. Verify tokens work
      expect(tokenManager.verifyAccessToken(tokens.access_token)).toBeDefined();
      expect(tokenManager.verifyRefreshToken(tokens.refresh_token)).toBeDefined();

      // 3. Logout (revoke refresh token)
      const revoked = tokenManager.revokeRefreshToken(tokens.refresh_token);
      expect(revoked).toBe(true);

      // 4. Access token still valid but can't refresh
      expect(tokenManager.verifyAccessToken(tokens.access_token)).toBeDefined();
      expect(tokenManager.verifyRefreshToken(tokens.refresh_token)).toBeNull();
      expect(tokenManager.refreshAccessToken(tokens.refresh_token)).toBeNull();
    });

    test('should handle multiple players/mods', () => {
      const player1Tokens = tokenManager.generateTokenPair('player1', 'mod1');
      const player2Tokens = tokenManager.generateTokenPair('player2', 'mod2');

      const p1Info = tokenManager.verifyAccessToken(player1Tokens.access_token);
      const p2Info = tokenManager.verifyAccessToken(player2Tokens.access_token);

      expect(p1Info.playerId).toBe('player1');
      expect(p1Info.modId).toBe('mod1');
      expect(p2Info.playerId).toBe('player2');
      expect(p2Info.modId).toBe('mod2');
    });
  });
});
