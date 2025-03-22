const { SlashCommandBuilder } = require('discord.js');
const core = require('../../engine/core');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('oops')
		.setDescription('Correct the last object mentioned (only works if \'unresolved object\' error was *just* logged)'),
	async execute(interaction) {
		const qgame = await core.loadGame('./game.json', interaction);
		if (Object.keys(qgame.players).indexOf(interaction.user.username) < 0) {
			await interaction.reply({ content: core.template.mustStartGame, flags: 64 });
			return 3;
		}
		const s = core.template.oops;
		await interaction.reply({ content: s, flags: 64 });
	},
};
