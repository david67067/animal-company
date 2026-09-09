# Discord Bot Quick Start

## 🚀 Quick Setup (5 minutes)

### 1. Create Discord Bot
- Go to https://discord.com/developers/applications
- Click "New Application"
- Go to "Bot" tab → "Add Bot"
- Copy the TOKEN

### 2. Get Client ID
- Go to "General Information" tab
- Copy "Application ID" (this is your Client ID)

### 3. Setup Environment
Create `.env` file in project root:

```bash
# Discord Bot
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here

# JWT Secrets (existing)
JWT_SECRET=your_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
```

### 4. Install & Run
```bash
npm install
npm run bot:register
npm run bot
```

### 5. Invite Bot to Server
Go to Discord Developer Portal → OAuth2 → URL Generator
- Select: `bot` and `applications.commands`
- Select: `Send Messages`, `Embed Links`
- Copy & paste the generated URL in browser
- Select your server and authorize

### 6. Use Commands
In Discord, try:
```
/login playerid:test modid:test
/help
```

---

## 📖 Full Setup Guide
See `DISCORD_BOT_SETUP.md` for detailed instructions

## ✅ Commands
- `/login playerid:<id> modid:<id>` - Generate tokens
- `/verify token:<token>` - Check token validity
- `/refresh refreshtoken:<token>` - Get new access token
- `/logout refreshtoken:<token>` - Revoke token
- `/tokens` - View your active tokens
- `/help` - Show all commands
