const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Get little help with the game.'),
	async execute(interaction) {
		const { qgame, pov } = await q.getGamePov();
		if (!pov) return;
		global.qgame = qgame;
		global.pov = pov;
		const s = 'Enter `/` to see a list of available commands.';
		await interaction.reply({ content: s, flags: 64 });
	},
};
