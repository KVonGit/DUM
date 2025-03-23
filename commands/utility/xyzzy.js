const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('xyzzy')
		.setDescription('??????'),
	async execute(interaction) {
		const qgame = await q.loadGame('./game.json', interaction);
		if (Object.keys(qgame.players).indexOf(interaction.user.username) < 0) {
			await q.msg(q.template.mustStartGame);
			return 3;
		}
		const s = q.template.xyzzy;
		//q.SendDM('You tried XYZZY! :rofl:');
		await q.msg(s);
	},
};
