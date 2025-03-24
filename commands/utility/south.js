const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('south')
		.setDescription('Go south'),
	async execute(interaction) {
		const exitName = 'south';
		// console.log('exitName:', exitName);
		const qgame = await q.loadGame('./game.json', interaction);
		const povName = interaction.user.username;
		if (Object.keys(qgame.players).indexOf(povName) < 0) {
			await interaction.reply({ content: q.template.mustStartGame, flags: 64 });
			return 3;
		}
		const pov = qgame.players[povName];
		const loc = qgame.locations[pov.loc];
		await q.doGo(qgame, pov, loc, exitName, interaction);
	},
};