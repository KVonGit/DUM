const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('east')
		.setDescription('Go east'),
		aliases: ['e'],
	async execute(interaction) {
		const exitName = 'east';
		const loc = qgame.locations[pov.loc];
		await q.doGo(qgame, pov, loc, exitName, interaction);
	},
};