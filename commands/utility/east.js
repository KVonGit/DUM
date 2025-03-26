const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('east')
		.setDescription('Go east'),
	async execute(interaction) {
		const exitName = 'east';
		const { qgame, pov } = await q.getGamePov();
		if (!pov) return;
		const loc = qgame.locations[pov.loc];
		await q.doGo(qgame, pov, loc, exitName, interaction);
	},
};