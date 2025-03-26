const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('go')
		.setDescription('Go somewhere')
		.addStringOption(option =>
			option.setName('direction')
				.setDescription('The direction (or location to which) you wish to go')
				.setRequired(true)),
	async execute(interaction) {
		const { qgame, pov } = await q.getGamePov();
		if (!pov) return;
		const exitName = interaction.options.getString('direction');
		if (!exitName) {
			await interaction.reply({ content: '\'direction\' not defined.', flags: 64 });
			return;
		}
		const loc = qgame.locations[pov.loc];
		await q.doGo(qgame, pov, loc, exitName, interaction);
	},
};