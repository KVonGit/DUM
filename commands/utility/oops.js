const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('oops')
		.setDescription('Correct the last object mentioned (only works if \'unresolved object\' error was *just* logged)'),
	async execute(interaction) {
		global.interaction = interaction;
		const { qgame, pov } = await q.getGamePov();
		if (!pov) return;
		global.qgame = qgame;
		const s = q.template.oops;
		await msg(s);
	},
};
