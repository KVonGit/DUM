const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('DUM test'),
	async execute(interaction) {
		const qgame = await q.loadGame('./game.json', interaction);
		if (Object.keys(qgame.players).indexOf(interaction.user.username) < 0) {
			await interaction.reply({ content: q.template.mustStartGame, flags: 64 });
			return 3;
		}
		await interaction.reply({ content: 'DUM DUM DUM!!!', flags: 64 });
		await q.msg('Initiating DUM test...', true, true);
		await q.msg(`Start DateTime: ${new Date().toLocaleString()}`, true, true);
		await q.msg('This may take a while...', true, true);
		await q.msg('DUM DEE DUM DUM DUM!!!', true, true);
		await q.msg('RESULTS: TEST FAILED!!! :rofl:', true, true);
		await q.msg(`End DateTime: ${new Date().toLocaleString()}`, true, true);
	},
};
