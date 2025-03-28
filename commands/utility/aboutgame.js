const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('aboutgame')
		.setDescription('Get information about the game.'),
	aliases: ['info', 'about', 'gameinfo', 'version'],
	async execute(interaction) {
		const { qgame, pov } = await q.getGamePov();
		if (!pov) return;
		const s = `**TITLE:** ${qgame.game.name}\n**VERSION:** ${qgame.game.version}\n**AUTHOR:** ${qgame.game.author}\n**INFO:** ${qgame.game.description}\n${qgame.game.copyright}`;
		q.saveGame('./game.json', qgame, interaction);
		await q.msg(s);
	},
};
