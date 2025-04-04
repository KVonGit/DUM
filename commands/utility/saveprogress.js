const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('saveprogress')
		.setDescription('Save your progress.'),
	async execute(interaction) {
		global.interaction = interaction;
		// This is a joke command. It doesn't actually save anything.
		const s = q.template.noSave;
		await q.msg(s);
	},
};
