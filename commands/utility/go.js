const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('go')
		.setDescription('Go somewhere')
		.addStringOption(option =>
			option.setName('direction')
				.setDescription('The direction (or location to which) you wish to go')),
	async execute(interaction) {
		const exitName = interaction.options.getString('direction');
		if (!exitName) {
			await interaction.reply({ content: '\'direction\' not defined.', flags: 64 });
			return;
		}

		const qgame = await q.loadGame('./game.json', interaction);
		const povName = interaction.user.username;

		if (!q.allPlayers(qgame).includes(povName)) {
			await interaction.reply({ content: q.template.mustStartGame, flags: 64 });
			return;
		}

		const pov = qgame.players[povName];
		const loc = qgame.locations[pov.loc];

		await q.doGo(qgame, pov, loc, exitName, interaction);
	},
};