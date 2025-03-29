const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('look')
		.setDescription('Look at your surroundings.'),
	async execute(interaction) {
		global.interaction = interaction;
		const s = q.getLocationDescription(qgame, pov);
		await q.msg(s);
	},
};
