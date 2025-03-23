const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('west')
		.setDescription('Go west'),
	async execute(interaction) {
		const exitName = 'west';
		// console.log('exitName:', exitName);
		const qgame = await q.loadGame('./game.json', interaction);
		const povName = interaction.user.username;
		if (Object.keys(qgame.players).indexOf(povName) < 0) {
			await interaction.reply({ content: q.template.mustStartGame, flags: 64 });
			return 3;
		}
		const pov = qgame.players[povName];
		const loc = qgame.locations[pov.loc];
		if (typeof loc.exits == 'undefined') {
			await interaction.reply({ content: 'There are no exits!', flags: 64 });
			return;
		}
		if (typeof loc.exits[exitName] == 'undefined') {
			await interaction.reply({ content: q.template.cantGo(exitName), flags: 64 });
			return;
		}
		const exitTo = loc.exits[exitName].to;
		// console.log('exitTo', exitTo);
		pov.loc = exitTo;
		const s = q.getLocationDescription(qgame, pov);
		await interaction.reply(`${pov.alias} goes ${exitName}.`);
		await interaction.followUp({ content: s, flags: 64 });
		try {
			await q.saveGame('./game.json', qgame);
		}
		catch (err) {
			console.error('Error saving game data:', err);
			await interaction.followUp({ content: 'Failed to save game data.', flags: 64 });
		}
	},
};