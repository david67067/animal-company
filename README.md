# 🐾 Animal Company - JWT Token Manager

A complete JWT-based authentication system for managing player and mod tokens with a beautiful web interface, Express API server, and comprehensive test suite.

## 📋 Features

- **JWT Token Management** - Generate, verify, and refresh access tokens
- **Refresh Token System** - Secure token refresh mechanism with revocation
- **Player/Mod Authentication** - Manage authentication for player and mod combinations
- **Web Interface** - Beautiful, interactive web dashboard for token operations
- **Express API Server** - Full-featured REST API with middleware
- **Comprehensive Tests** - 30+ unit and integration tests with Jest
- **Production Ready** - Environment configuration, error handling, and logging
- **API Documentation** - Built-in API docs in the web interface

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/david67067/animal-company.git
   cd animal-company
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run the server**
   ```bash
   npm start
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

## 📚 Project Structure

```
animal-company/
├── tokenManager.js          # Core JWT token management class
├── tokenManager.test.js     # Comprehensive test suite
├── server.js                # Express server with API endpoints
├── public/
│   └── index.html          # Web interface
├── package.json             # Dependencies and scripts
├── .env.example             # Environment configuration template
└── README.md                # This file
```

## 🔧 Available Scripts

```bash
# Start the server (production)
npm start

# Start with auto-reload (development)
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🌐 API Endpoints

### Authentication

#### POST /auth/login
Issue new tokens for a player/mod combination.

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "player123",
    "modId": "mod456"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

#### POST /auth/refresh
Get a new access token using a refresh token.

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "your_refresh_token"
  }'
```

#### GET /auth/verify
Verify and get information about the current access token.

```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:3000/auth/verify
```

#### POST /auth/logout
Revoke a refresh token (logout).

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "your_refresh_token"
  }'
```

### Mods

#### GET /mods
Get mod list for authenticated player.

```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:3000/mods
```

#### POST /mods/install
Install a mod for authenticated player.

```bash
curl -X POST http://localhost:3000/mods/install \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "modName": "ExampleMod",
    "version": "1.0.0"
  }'
```

#### GET /mods/:modId
Get details for a specific mod.

```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:3000/mods/mod456
```

### Health

#### GET /health
Health check endpoint.

```bash
curl http://localhost:3000/health
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
npm test
```

The test suite includes:
- Token generation tests
- Token verification tests
- Token refresh tests
- Token revocation tests
- Error handling tests
- Integration flow tests

## 💻 TokenManager Class

```javascript
const TokenManager = require('./tokenManager');
const tokenManager = new TokenManager();

// Generate tokens
const tokens = tokenManager.generateTokenPair('player123', 'mod456');

// Verify access token
const decoded = tokenManager.verifyAccessToken(tokens.access_token);

// Refresh tokens
const newTokens = tokenManager.refreshAccessToken(tokens.refresh_token);

// Revoke refresh token
tokenManager.revokeRefreshToken(tokens.refresh_token);

// Get token info
const info = tokenManager.getTokenInfo(tokens.access_token);
```

## 🎨 Web Interface

The web dashboard at `http://localhost:3000` includes:
- Login panel for generating tokens
- Token verification and inspection
- Token refresh functionality
- Logout with token revocation
- Built-in API documentation
- Real-time server status monitoring

## 🔐 Security

- HS256 algorithm for token signing
- 1-hour access token expiration
- 7-day refresh token expiration
- Token revocation support
- Type validation for tokens

## 📦 Environment Setup

```bash
cp .env.example .env
```

Generate secret keys:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📄 License

MIT

---

**Made with ❤️ for Animal Company**
