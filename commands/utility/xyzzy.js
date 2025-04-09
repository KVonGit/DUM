const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('xyzzy')
		.setDescription('??????'),
	async execute(interaction) {
		global.interaction = interaction;
		global.qgame = qgame;
		if (pov.loc === 'nowhere' || pov.loc === 'Smithereens') {
			pov.loc = 'Lounge';
			await q.msg(q.getLocationDescription(qgame, pov));
			return;
		}
		const s = q.template.xyzzy;
		// q.SendDM('You tried XYZZY! :rofl:');
		await q.msg(s);
	},
};
