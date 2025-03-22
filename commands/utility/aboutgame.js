const { SlashCommandBuilder } = require('discord.js');
const core = require('../../engine/core');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('aboutgame')
		.setDescription('Get information about the game.'),
	async execute(interaction) {
		const qgame = await core.loadGame('./game.json', interaction);
		if (Object.keys(qgame.players).indexOf(interaction.user.username) < 0) {
			await interaction.reply({ content: core.template.mustStartGame, flags: 64 });
			return 3;
		}
		const s = `**TITLE:** ${qgame.game.name}\n**VERSION:** ${qgame.game.version}\n**AUTHOR:** ${qgame.game.author}\n**INFO:** ${qgame.game.description}\n${qgame.game.copyright}`;
		await interaction.reply({ content: s, flags: 64 });
	},
};
