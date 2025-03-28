const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wait')
		.setDescription('Wait one turn.'),
	aliases: ['z'],
	async execute(interaction) {
		global.interaction = interaction;
		const { qgame, pov } = await q.getGamePov();
		if (!pov) return;
		global.qgame = qgame;
		global.pov = pov;
		const s = 'Time passes.';
		await q.msg(s);
	},
};
