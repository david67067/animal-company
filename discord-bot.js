const { Client, GatewayIntentBits, EmbedBuilder, ChannelType } = require('discord.js');
const TokenManager = require('./tokenManager');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const tokenManager = new TokenManager();

// Store active tokens per user (in-memory, resets on bot restart)
const userTokens = new Map();

// Helper function to send embed messages
const sendEmbed = async (interaction, title, description, color = '#0099ff') => {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
  
  return interaction.reply({ embeds: [embed], ephemeral: true });
};

// Helper function to create token info embed
const createTokenEmbed = (title, tokens) => {
  return new EmbedBuilder()
    .setColor('#00ff00')
    .setTitle(title)
    .addFields(
      { name: 'Access Token', value: `\`\`\`${tokens.access_token}\`\`\``, inline: false },
      { name: 'Refresh Token', value: `\`\`\`${tokens.refresh_token}\`\`\``, inline: false },
      { name: 'Token Type', value: tokens.token_type, inline: true },
      { name: 'Expires In', value: `${tokens.expires_in} seconds`, inline: true }
    )
    .setTimestamp();
};

client.once('ready', () => {
  console.log(`
╔════════════════════════════════════════╗
║   Animal Company Discord Bot Ready!    ║
╚════════════════════════════════════════╝

Bot logged in as: ${client.user.tag}
Ready to manage tokens!
  `);
  
  client.user.setActivity('🐾 Token Management', { type: 'PLAYING' });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, user } = interaction;
  const userId = user.id;

  try {
    // ============ /login COMMAND ============
    if (commandName === 'login') {
      const playerId = interaction.options.getString('playerid');
      const modId = interaction.options.getString('modid');

      try {
        const tokens = tokenManager.generateTokenPair(playerId, modId);
        
        // Store tokens for this user
        if (!userTokens.has(userId)) {
          userTokens.set(userId, []);
        }
        userTokens.get(userId).push({
          playerId,
          modId,
          tokens,
          createdAt: new Date(),
        });

        const embed = createTokenEmbed('✅ Login Successful', tokens);
        embed.addFields(
          { name: 'Player ID', value: playerId, inline: true },
          { name: 'Mod ID', value: modId, inline: true }
        );

        await interaction.reply({ embeds: [embed], ephemeral: true });
      } catch (error) {
        await sendEmbed(interaction, '❌ Error', 'Failed to generate tokens', '#ff0000');
      }
    }

    // ============ /verify COMMAND ============
    else if (commandName === 'verify') {
      const token = interaction.options.getString('token');

      try {
        const decoded = tokenManager.verifyAccessToken(token);

        if (!decoded) {
          return await sendEmbed(
            interaction,
            '❌ Invalid Token',
            'The token is invalid or expired',
            '#ff0000'
          );
        }

        const info = tokenManager.getTokenInfo(token);
        
        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ Token Valid')
          .addFields(
            { name: 'Player ID', value: info.playerId, inline: true },
            { name: 'Mod ID', value: info.modId, inline: true },
            { name: 'Token Type', value: info.type, inline: true },
            { name: 'Issued At', value: info.issuedAt, inline: false },
            { name: 'Expires At', value: info.expiresAt, inline: false },
            { name: 'Is Expired', value: info.isExpired ? '⏰ Yes' : '✅ No', inline: true }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
      } catch (error) {
        await sendEmbed(
          interaction,
          '❌ Verification Failed',
          'Error verifying token',
          '#ff0000'
        );
      }
    }

    // ============ /refresh COMMAND ============
    else if (commandName === 'refresh') {
      const refreshToken = interaction.options.getString('refreshtoken');

      try {
        const newTokens = tokenManager.refreshAccessToken(refreshToken);

        if (!newTokens) {
          return await sendEmbed(
            interaction,
            '❌ Refresh Failed',
            'Invalid or revoked refresh token',
            '#ff0000'
          );
        }

        const embed = createTokenEmbed('✅ Tokens Refreshed', newTokens);
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
      } catch (error) {
        await sendEmbed(
          interaction,
          '❌ Refresh Failed',
          'Error refreshing tokens',
          '#ff0000'
        );
      }
    }

    // ============ /logout COMMAND ============
    else if (commandName === 'logout') {
      const refreshToken = interaction.options.getString('refreshtoken');

      try {
        const revoked = tokenManager.revokeRefreshToken(refreshToken);

        if (!revoked) {
          return await sendEmbed(
            interaction,
            '❌ Logout Failed',
            'Could not revoke token',
            '#ff0000'
          );
        }

        await sendEmbed(
          interaction,
          '✅ Logged Out',
          'Refresh token has been revoked. You are now logged out.',
          '#00ff00'
        );
      } catch (error) {
        await sendEmbed(
          interaction,
          '❌ Logout Failed',
          'Error during logout',
          '#ff0000'
        );
      }
    }

    // ============ /tokens COMMAND ============
    else if (commandName === 'tokens') {
      const userTokenList = userTokens.get(userId);

      if (!userTokenList || userTokenList.length === 0) {
        return await sendEmbed(
          interaction,
          '📋 Your Tokens',
          'You have no active tokens. Use `/login` to generate new tokens.',
          '#ffaa00'
        );
      }

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('📋 Your Active Tokens')
        .setDescription(`You have ${userTokenList.length} active token(s):\n`)
        .setTimestamp();

      userTokenList.forEach((item, index) => {
        const createdTime = item.createdAt.toLocaleString();
        embed.addFields({
          name: `Token ${index + 1}`,
          value: `**Player:** ${item.playerId}\n**Mod:** ${item.modId}\n**Created:** ${createdTime}`,
          inline: false,
        });
      });

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // ============ /help COMMAND ============
    else if (commandName === 'help') {
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🐾 Animal Company Bot - Help')
        .setDescription('All available commands for token management')
        .addFields(
          {
            name: '/login',
            value: 'Generate new tokens for a player/mod\n`/login playerid:<id> modid:<id>`',
            inline: false,
          },
          {
            name: '/verify',
            value: 'Verify an access token and get its details\n`/verify token:<token>`',
            inline: false,
          },
          {
            name: '/refresh',
            value: 'Get new access token from refresh token\n`/refresh refreshtoken:<token>`',
            inline: false,
          },
          {
            name: '/logout',
            value: 'Revoke a refresh token (logout)\n`/logout refreshtoken:<token>`',
            inline: false,
          },
          {
            name: '/tokens',
            value: 'View all your active tokens',
            inline: false,
          },
          {
            name: '/help',
            value: 'Show this help message',
            inline: false,
          }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  } catch (error) {
    console.error('Command error:', error);
    await sendEmbed(
      interaction,
      '❌ Error',
      'An error occurred while processing your command',
      '#ff0000'
    );
  }
});

client.login(process.env.DISCORD_TOKEN);
