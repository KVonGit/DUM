const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('players')
		.setDescription('See the current active players in the game.'),
	async execute(interaction) {
		const qgame = await q.loadGame('./game.json', interaction);
		if (Object.keys(qgame.players).indexOf(interaction.user.username) < 0) {
			await interaction.reply({ content: q.template.mustStartGame, flags: 64 });
			return 3;
		}
		const s = '### Now Playing:\n' + q.GetObjectListAsString(q.AllPlayers(qgame));
		await interaction.reply({ content: s, flags: 64 });
	},
};
