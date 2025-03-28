const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wait')
		.setDescription('Wait one turn.'),
	aliases: ['z'],
	async execute(interaction) {
		global.interaction = interaction;
		const s = 'Time passes.';
		await q.msg(s);
	},
};
