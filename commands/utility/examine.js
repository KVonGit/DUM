const { SlashCommandBuilder } = require('discord.js');
const core = require('../../engine/core');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('examine')
		.setDescription('Examine something')
		.addStringOption(option =>
			option.setName('object')
				.setDescription('The object you wish to examine')),
	async execute(interaction) {
		const object = interaction.options.getString('object');
		if (typeof object == 'undefined') {
			await interaction.reply('\'object\' not defined.');
			return;
		}
		const qgame = await core.loadGame('./game.json', interaction);
		const povName = interaction.user.username;
		if (qgame.players.indexOf(povName) < 0) {
			await interaction.reply({ content: core.template.mustStartGame, flags: 64 });
			return 3;
		}
		if (typeof qgame[object] == 'undefined') {
			await interaction.reply({ content: 'No such object ("' + object + '")!', flags: 64 });
			return;
		}
		// TODO - Check scope!
		if (typeof qgame[object].look == 'string') {
			await interaction.reply({ content: qgame[object].look, flags: 64 });
		}
		else if (typeof qgame[object].look == 'function') {
			await interaction.reply({ content: qgame[object].look(), flags: 64 });
		}
		else {
			const s = core.template.defaultLook;
			await interaction.reply({ content: s, flags: 64 });
		}
	},
};