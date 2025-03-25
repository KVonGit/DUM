const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hint')
		.setDescription('DM me!'),
	async execute(interaction) {
		const qgame = await q.loadGame('./game.json', interaction);
		if (Object.keys(qgame.players).indexOf(interaction.user.username) < 0) {
			await q.msg(q.template.mustStartGame);
			return 3;
		}
		// await q.SendDM('You asked for a hint! :rofl:');
		// await q.msg(`Hey, everybody!!! ${q.GetDisplayName(interaction.user.username)} asked for a hint!`, false, false);
		await q.msg('Try entering a `/` but not pressing ENTER. It should bring up a list of commands you can use!');
	},
};