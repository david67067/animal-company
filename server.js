const express = require('express');
const TokenManager = require('./tokenManager');
const path = require('path');
require('dotenv').config();

const app = express();
const tokenManager = new TokenManager();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to verify access token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid authorization header format' });
  }

  const token = parts[1];
  const decoded = tokenManager.verifyAccessToken(token);
  
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.player = decoded;
  next();
};

// ============ AUTH ENDPOINTS ============

/**
 * POST /auth/login
 * Issue new tokens for a player/mod
 */
app.post('/auth/login', (req, res) => {
  const { playerId, modId } = req.body;

  if (!playerId || !modId) {
    return res.status(400).json({ error: 'playerId and modId are required' });
  }

  try {
    const tokens = tokenManager.generateTokenPair(playerId, modId);
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: 'Token generation failed' });
  }
});

/**
 * POST /auth/refresh
 * Get a new access token using refresh token
 */
app.post('/auth/refresh', (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: 'refresh_token is required' });
  }

  try {
    const newTokens = tokenManager.refreshAccessToken(refresh_token);

    if (!newTokens) {
      return res.status(401).json({ error: 'Invalid or revoked refresh token' });
    }

    res.json(newTokens);
  } catch (error) {
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

/**
 * POST /auth/logout
 * Revoke a refresh token (logout)
 */
app.post('/auth/logout', (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: 'refresh_token is required' });
  }

  try {
    const revoked = tokenManager.revokeRefreshToken(refresh_token);

    if (!revoked) {
      return res.status(400).json({ error: 'Failed to revoke token' });
    }

    res.json({ message: 'Logged out successfully', revoked: true });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

/**
 * GET /auth/verify
 * Verify and get info about current token
 */
app.get('/auth/verify', verifyToken, (req, res) => {
  const tokenInfo = tokenManager.getTokenInfo(req.headers.authorization.split(' ')[1]);
  res.json(tokenInfo);
});

// ============ MOD ENDPOINTS ============

/**
 * GET /mods
 * Get list of mods for authenticated player
 */
app.get('/mods', verifyToken, (req, res) => {
  const { playerId, modId } = req.player;
  
  res.json({
    playerId,
    modId,
    message: 'You are authenticated!',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /mods/install
 * Install a mod for authenticated player
 */
app.post('/mods/install', verifyToken, (req, res) => {
  const { playerId, modId } = req.player;
  const { modName, version } = req.body;

  if (!modName || !version) {
    return res.status(400).json({ error: 'modName and version are required' });
  }

  res.json({
    success: true,
    playerId,
    modId,
    installedMod: {
      name: modName,
      version,
      installedAt: new Date().toISOString()
    }
  });
});

/**
 * GET /mods/:modId
 * Get details for a specific mod
 */
app.get('/mods/:modId', verifyToken, (req, res) => {
  const { playerId, modId } = req.player;
  const requestedModId = req.params.modId;

  res.json({
    playerId,
    currentModId: modId,
    requestedModId,
    details: {
      name: `Mod ${requestedModId}`,
      version: '1.0.0',
      author: 'Animal Company',
      description: 'A sample mod for Animal Company'
    }
  });
});

// ============ HEALTH CHECK ============

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============ SERVE HTML ============

/**
 * GET /
 * Serve the web interface
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============ ERROR HANDLING ============

/**
 * 404 Not Found
 */
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============ START SERVER ============

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║     Animal Company Token Server        ║
╚════════════════════════════════════════╝

🚀 Server running on port ${PORT}
🌐 Web interface: http://localhost:${PORT}
📚 API docs: http://localhost:${PORT}

Environment: ${process.env.NODE_ENV || 'development'}

Press Ctrl+C to stop the server
  `);
});
