const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('undo')
		.setDescription('Undo your last action.'),
	async execute(interaction) {
		global.interaction = interaction;
		global.qgame = qgame;
		const s = q.template.noUndo;
		await q.msg(s);
	},
};
