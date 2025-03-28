const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('west')
		.setDescription('Go west'),
	aliases: ['w'],
	usage: '/west',
	async execute(interaction) {
		const exitName = 'west';
		// console.log('exitName:', exitName);
		const loc = qgame.locations[pov.loc];
		await q.doGo(qgame, pov, loc, exitName, interaction);
	},
};