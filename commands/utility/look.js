const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('look')
		.setDescription('Look at your surroundings.'),
	async execute(interaction) {
		const qgame = await q.loadGame('./game.json', interaction);
		if (Object.keys(qgame.players).indexOf(interaction.user.username) < 0) {
			await interaction.reply({ content: q.template.mustStartGame, flags: 64 });
			return 3;
		}
		const pov = qgame.players[interaction.user.username];
		const s = q.getLocationDescription(qgame, pov);
		await interaction.reply({ content: s, flags: 64 });
	},
};
