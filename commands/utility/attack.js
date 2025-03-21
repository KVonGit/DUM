const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const core = require('../../engine/core');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('attack')
		.setDescription('Attack something (or someone)!')
		.addStringOption(option =>
			option.setName('target')
				.setDescription('The target you wish to attack')),
	async execute(interaction) {
		const object = interaction.options.getString('target');
		if (typeof object == 'undefined') {
			await interaction.reply({ content: '\'' + object + '\' not defined.', flags: 64 });
			return;
		}
		fs.readFile('./game.json', 'utf8', async function(err, data) {
			if (err) {
				await interaction.user.reply('Error!');
		  		return err;
			}
			if (typeof data == 'undefined' || data.trim() == '') return;
			const qgame = JSON.parse(data).aslj;
			const povName = interaction.user.username;
			let objname = object;
			if (qgame.players.indexOf(povName) < 0) {
				await interaction.reply({ content: core.template.mustStartGame, flags: 64 });
				return 3;
			}
			if (typeof qgame[objname] == 'undefined') {
				if (qgame.players.indexOf(objname) > -1) {
					 objname = qgame.players[qgame.players.indexOf(objname)];
					 }
				else {
					await interaction.reply({ content: 'No such object ("' + objname + '")!', flags: 64 });
				    return;
				}
			}
			// TODO - Check scope!
			if (typeof qgame[objname].attack == 'string') {
				await interaction.reply(`${povName} has attacked ${object}!`);
				await interaction.followUp({ content: qgame[objname].attack, flags: 64 });
			}
			else if (typeof qgame[objname].attack == 'function') {
				await interaction.reply({ content: qgame[objname].attack(), flags: 64 });
			}
			else {
				const s = core.template.defaultAttack(objname);
				await interaction.reply({ content: s, flags: 64 });
			}
		});
	},
};
