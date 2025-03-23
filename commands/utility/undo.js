const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('undo')
		.setDescription('Undo your last action.'),
	async execute(interaction) {
		const qgame = await q.loadGame('./game.json', interaction);
		if (Object.keys(qgame.players).indexOf(interaction.user.username) < 0) {
			await interaction.reply({ content: q.template.mustStartGame, flags: 64 });
			return 3;
		}
		const s = q.template.noUndo;
		await interaction.reply({ content: s, flags: 64 });
	},
};
