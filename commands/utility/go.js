const { SlashCommandBuilder } = require('discord.js');
const core = require('../../engine/core');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('go')
		.setDescription('Go somewhere')
		.addStringOption(option =>
			option.setName('direction')
				.setDescription('The direction (or location to which) you wish to go')),
	async execute(interaction) {
		const exitName = interaction.options.getString('direction');
		// console.log('exitName:', exitName);
		if (typeof exitName == 'undefined') {
			await interaction.reply({ content:'\'' + exitName + '\' not defined.', flags:64 });
			return;
		}
		const qgame = await core.loadGame('./game.json', interaction);
		const povName = interaction.user.username;
		if (Object.keys(qgame.players).indexOf(povName) < 0) {
			await interaction.reply({ content: core.template.mustStartGame, flags: 64 });
			return 3;
		}
		const pov = qgame.players[povName];
		const loc = qgame.locations[pov.loc];
		if (typeof loc.exits == 'undefined') {
			await interaction.reply({ content: 'There are no exits!', flags: 64 });
			return;
		}
		if (typeof loc.exits[exitName] == 'undefined') {
			await interaction.reply({ content: core.template.cantGo(exitName), flags: 64 });
			return;
		}
		const exitTo = loc.exits[exitName].to;
		// console.log('exitTo', exitTo);
		// TODO - LOCKED? VISIBLE?
		// TODO - BEFORE LEAVING SCRIPTS?
		// TODO - BEFORE ENTERING SCRIPTS?
		pov.loc = exitTo;
		// TODO - AFTER ENTERING SCRIPTS?
		const s = core.getLocationDescription(qgame, pov);
		await interaction.reply(`${pov.alias || pov.name} goes ${exitName}.`);
		await interaction.followUp({ content: s, flags: 64 });
		try {
			await core.saveGame('./game.json', qgame);
		}
		catch (err) {
			console.error('Error saving game data:', err);
			await interaction.followUp({ content: 'Failed to save game data.', flags: 64 });
		}
	},
};