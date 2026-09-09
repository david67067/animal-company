const { REST, Routes } = require('discord.js');
require('dotenv').config();

const commands = [
  {
    name: 'login',
    description: 'Generate new JWT tokens for a player/mod combination',
    options: [
      {
        name: 'playerid',
        description: 'The player ID',
        type: 3, // STRING
        required: true,
      },
      {
        name: 'modid',
        description: 'The mod ID',
        type: 3, // STRING
        required: true,
      },
    ],
  },
  {
    name: 'verify',
    description: 'Verify an access token and get its details',
    options: [
      {
        name: 'token',
        description: 'The access token to verify',
        type: 3, // STRING
        required: true,
      },
    ],
  },
  {
    name: 'refresh',
    description: 'Get new access token from a refresh token',
    options: [
      {
        name: 'refreshtoken',
        description: 'The refresh token',
        type: 3, // STRING
        required: true,
      },
    ],
  },
  {
    name: 'logout',
    description: 'Revoke a refresh token (logout)',
    options: [
      {
        name: 'refreshtoken',
        description: 'The refresh token to revoke',
        type: 3, // STRING
        required: true,
      },
    ],
  },
  {
    name: 'tokens',
    description: 'View all your active tokens',
  },
  {
    name: 'help',
    description: 'Show all available commands',
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('🔄 Registering slash commands...');

    await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), {
      body: commands,
    });

    console.log('✅ Slash commands registered successfully!');
  } catch (error) {
    console.error('❌ Error registering commands:', error);
    process.exit(1);
  }
})();
