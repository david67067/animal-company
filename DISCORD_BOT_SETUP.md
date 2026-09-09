# 🤖 Discord Bot Setup Guide

Complete guide to set up and run the Animal Company Discord bot for token management.

## 📋 Prerequisites

- Discord account
- A Discord server (or create one)
- Node.js installed on your computer
- GitHub repository cloned

## 🚀 Step-by-Step Setup

### Step 1: Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"**
3. Name it: `Animal Company Bot`
4. Click **"Create"**

### Step 2: Create a Bot User

1. In your application, go to the **"Bot"** tab on the left
2. Click **"Add Bot"**
3. Under the bot name, you'll see a **"TOKEN"** section
4. Click **"Copy"** to copy your bot token

### Step 3: Set Bot Permissions

1. In the **"Bot"** tab, scroll down to **"TOKEN PERMISSIONS"**
2. Check these permissions:
   - ✅ `applications.commands` (Slash Commands)
   - ✅ `bot`
   - ✅ `send_messages`
   - ✅ `embed_links`
   - ✅ `read_message_history`

### Step 4: Get Your Bot Invite Link

1. Go to the **"OAuth2"** tab
2. Click **"URL Generator"**
3. Check these scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
4. Check these permissions:
   - ✅ `Send Messages`
   - ✅ `Embed Links`
   - ✅ `Read Message History`
5. Copy the generated URL at the bottom

### Step 5: Invite Bot to Your Server

1. Paste the URL in your browser
2. Select your Discord server
3. Click **"Authorize"**
4. Complete the CAPTCHA

### Step 6: Setup Environment Variables

1. In your project root, open `.env` file
2. Add these lines:

```bash
# Discord Bot Configuration
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here

# JWT Configuration (existing)
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
```

**Where to find these:**
- **DISCORD_TOKEN**: Bot tab → Copy token
- **DISCORD_CLIENT_ID**: Application tab → Copy Application ID

### Step 7: Install Dependencies

On your computer, run:

```bash
npm install
```

This installs all required packages including Discord.js

### Step 8: Register Slash Commands

Run this command to register commands with Discord:

```bash
npm run bot:register
```

You should see:
```
✅ Slash commands registered successfully!
```

### Step 9: Start the Bot

Run:

```bash
npm run bot
```

You should see:
```
╔════════════════════════════════════════╗
║   Animal Company Discord Bot Ready!    ║
╚════════════════════════════════════════╝

Bot logged in as: YourBotName#1234
Ready to manage tokens!
```

## ✅ Bot is Running!

Your bot is now online in your Discord server. You can use these commands:

### Available Commands

#### `/login`
Generate new tokens for a player/mod combination.

```
/login playerid:player123 modid:mod456
```

**Response:** Access token and refresh token

#### `/verify`
Check if a token is valid.

```
/verify token:your_access_token
```

**Response:** Token details (player, mod, expiration, etc.)

#### `/refresh`
Get a new access token using refresh token.

```
/refresh refreshtoken:your_refresh_token
```

**Response:** New tokens

#### `/logout`
Revoke a refresh token.

```
/logout refreshtoken:your_refresh_token
```

**Response:** Confirmation of logout

#### `/tokens`
View all your active tokens.

```
/tokens
```

**Response:** List of all tokens you've generated

#### `/help`
Show all available commands and their usage.

```
/help
```

## 🐛 Troubleshooting

### Bot not responding to commands?

**Solution 1:** Check if bot is running
```bash
npm run bot
```

**Solution 2:** Re-register commands
```bash
npm run bot:register
```

**Solution 3:** Make sure bot has permissions in the server
- Right-click server → Server Settings → Roles
- Find your bot role
- Check `Send Messages`, `Embed Links`

### "Token is invalid or expired" error?

- Your bot token may be invalid
- Go to Discord Developer Portal
- Regenerate the bot token
- Update `.env` file
- Restart the bot

### Commands don't appear in Discord?

1. Stop the bot (Ctrl + C)
2. Regenerate token in Discord Developer Portal
3. Update `.env` file
4. Run: `npm run bot:register`
5. Run: `npm run bot`

### "Cannot find module 'discord.js'"?

```bash
npm install discord.js
```

## 📊 Bot Features

✅ **Slash Commands** - Easy command interface
✅ **Token Management** - Generate, verify, refresh, revoke
✅ **Beautiful Embeds** - Color-coded responses
✅ **Error Handling** - Clear error messages
✅ **Private Responses** - Only you see token responses
✅ **Token History** - Track your active tokens

## 🔒 Security Notes

- **Never share your bot token** - Treat it like a password
- Tokens are sent as private responses (ephemeral)
- Bot stores tokens in memory (resets on restart)
- Use strong JWT secrets in `.env`

## 📝 Running Both Web Server and Bot

You can run both the web server and bot simultaneously:

**Terminal 1 (Web Server):**
```bash
npm start
```

**Terminal 2 (Discord Bot):**
```bash
npm run bot
```

## 🆘 Need Help?

1. Check the troubleshooting section above
2. Review `.env` configuration
3. Verify bot permissions in Discord server
4. Check Discord Developer Portal settings

## 🎉 You're All Set!

Your Animal Company Discord bot is ready to manage tokens directly in Discord!

Start using `/help` in any Discord channel where the bot is present to see all commands.
