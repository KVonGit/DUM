const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('aboutgame')
		.setDescription('Get information about the game.'),
	async execute(interaction) {
		const qgame = await q.loadGame('./game.json', interaction);
		if (Object.keys(qgame.players).indexOf(interaction.user.username) < 0) {
			await interaction.reply({ content: q.template.mustStartGame, flags: 64 });
			return 3;
		}
		const s = `**TITLE:** ${qgame.game.name}\n**VERSION:** ${qgame.game.version}\n**AUTHOR:** ${qgame.game.author}\n**INFO:** ${qgame.game.description}\n${qgame.game.copyright}`;
		qgame.players[interaction.user.username].lastCommand = interaction.options.getString('input');;
		qgame.players[interaction.user.username].commandHistory.push(interaction.options.getString('input'));
		q.saveGame('./game.json', qgame, interaction);
		await interaction.reply({ content: s, flags: 64 });
	},
};
