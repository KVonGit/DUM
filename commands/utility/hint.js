const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hint')
		.setDescription('Help me!'),
	async execute(interaction) {
		global.interaction = interaction;
		const { qgame, pov } = await q.getGamePov();
		if (!pov) return;
		global.qgame = qgame;
		// await q.SendDM('You asked for a hint! :rofl:');
		// await q.msg(`Hey, everybody!!! ${q.GetDisplayName(interaction.user.username)} asked for a hint!`, false, false);
		await q.msg('Try entering a `/` but not pressing ENTER. It should bring up a list of commands you can use!');
	},
};