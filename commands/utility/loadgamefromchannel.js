const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('loadfromchannel_adminonly')
		.setDescription('Load game progress from channel.'),
	async execute(interaction) {
      if (interaction.user.id === '1279879910109872189') {
        interaction.reply('Loading game...');
        await q.loadGameFromChannel();
        return 0;
      }
    }
};