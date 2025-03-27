const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('xyzzy')
		.setDescription('??????'),
	async execute(interaction) {
		global.interaction = interaction;
		const { qgame, pov } = await q.getGamePov();
		if (!pov) return;
		global.qgame = qgame;
		if (pov.loc === 'nowhere') {
			pov.loc = 'Lounge';
			await q.msg(q.getLocationDescription(qgame, pov));
			await q.saveGame('./game.json', qgame, interaction);
			return;
		}
		const s = q.template.xyzzy;
		// q.SendDM('You tried XYZZY! :rofl:');
		await q.msg(s);
	},
};
