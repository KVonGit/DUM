const { SlashCommandBuilder } = require('discord.js');
const core = require('../../engine/core');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('inventory')
		.setDescription('See what you are carrying.'),
	async execute(interaction) {
		const qgame = await core.loadGame('./game.json', interaction);
		if (qgame.players.indexOf(interaction.user.username) < 0) {
			await interaction.reply({ content: core.template.mustStartGame, flags: 64 });
			return 3;
		}
		const pov = qgame[interaction.user.username];
		const s = core.getInventoryAsString(qgame, pov);
		await interaction.reply({ content: s, flags: 64 });
	},
};
