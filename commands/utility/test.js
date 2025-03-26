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
		await interaction.reply({ content: 'PING DUMParser (127.0.0.1) 56(84) bytes of data.', flags: 64 });
		await q.msg(`64 bytes from dumserv.net (127.0.1.1): icmp_seq=${0 + 1} ttl=106 time=${Date.now()} ms`, true, true);
		await q.msg(`64 bytes from dumserv.net (127.0.1.1): icmp_seq=${0 + 2} ttl=106 time=${Date.now()} ms`, true, true);
		await q.msg(`64 bytes from dumserv.net (127.0.1.1): icmp_seq=${0 + 3} ttl=106 time=${Date.now()} ms`, true, true);
		await q.msg('RESULTS: TEST FAILED!!! :rofl:', true, true);
	},
};
