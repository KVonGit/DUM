const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reloadgame')
    .setDescription('Admin: Reload the game data from disk'),
  
  async execute(interaction) {
    // Check if user is an admin
    const adminIds = ['YOUR_ADMIN_ID_HERE']; // Add your admin Discord user IDs
    
    if (!adminIds.includes(interaction.user.id)) {
      return interaction.reply({ content: 'You don\'t have permission to use this command.', flags: 64 });
    }
    
    try {
      global.qgame = await q.loadGameOnce('./game.yaml');
      await interaction.reply({ content: 'Game data reloaded successfully!', flags: 64 });
    } catch (error) {
      console.error('Failed to reload game:', error);
      await interaction.reply({ content: 'Error reloading game data.', flags: 64 });
    }
  },
};