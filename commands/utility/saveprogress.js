const { SlashCommandBuilder } = require('discord.js');
const core = require('../../engine/core');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('saveprogress')
		.setDescription('Save your progress.'),
	async execute(interaction) {
		const qgame = await core.loadGame('./game.json', interaction);
		if (Object.keys(qgame.players).indexOf(interaction.user.username) < 0) {
			await interaction.reply({ content: core.template.mustStartGame, flags: 64 });
			return 3;
		}
		const s = core.template.noSave;
		await interaction.reply({ content: s, flags: 64 });
	},
};
