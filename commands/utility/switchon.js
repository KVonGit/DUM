const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('switchon')
		.setDescription('Switch something on.')
		.addStringOption(option =>
			option.setName('object')
				.setDescription('The object you wish to switch on')
				.setRequired(true)),
	async execute(interaction) {
		const object = interaction.options.getString('object');
		if (typeof object === 'undefined') {
			await interaction.reply('\'' + object + '\' not defined.');
			return;
		}
		const qgame = await q.loadGame('./game.json', interaction);
		const povName = interaction.user.username;
		const pov = qgame.players[povName];
		if (Object.keys(qgame.players).indexOf(povName) < 0) {
			await interaction.reply({ content: q.template.mustStartGame, flags: 64 });
			return 3;
		}
		const obj = q.getObject(qgame, object);
		if (typeof obj === 'undefined') {
			await interaction.reply({ content: 'No such object ("' + object + '")!', flags: 64 });
			return;
		}
		if ((obj.loc !== pov.loc && obj.loc !== pov.name) || obj.visible === false) {
			await interaction.reply({ content: q.template.cantSee(q.GetDisplayName(obj)), flags: 64 });
			return;
		}
		if (obj.switchedOn === true) {
			await interaction.reply({ content: q.template.alreadyOn(q.GetDisplayName(obj)), flags: 64 });
			return;
		}
		if (obj.inherit && obj.inherit.indexOf('switchable') >= 0) {
			if (obj.canSwitchOn === true) {
				obj.switchedOn = true;
			}
			else if (obj.canSwitchOn === false) {
				await interaction.reply({ content: q.template.cantSwitch(q.GetDisplayName(obj)), flags: 64 });
				return;
			}
			else if (obj.switchOn.type) {
				switch (obj.switchOn.type) {
				case 'string':
					await interaction.reply({ content: obj.switchOn.attr, flags: 64 });
					break;
				case 'script':
					await eval(obj.switchOn.attr);
					break;
				case 'boolean':
					obj.switchedOn = true;
					break;
				default:
					await interaction.reply({ content: 'There was an error in the switchOn property.', flags: 64 });
				}

			}
			else {
				obj.switchedOn = false;
			}
			if (typeof obj.switchedOnMsg === 'string') {
				await interaction.reply({ content: obj.switchedOnMsg, flags: 64 });
			}
			else {
				await interaction.reply({ content: 'You switch ' + q.GetDisplayName(obj) + ' on.', flags: 64 });
			}
			if (typeof obj.afterSwitchingOnMsg === 'string') {
				await interaction.followUp({ content: obj.afterSwitchingOnMsg, flags: 64 });
			}
			if (obj.afterSwitchingOn) {
				try {
					await eval(obj.afterSwitchingOn);
				}
				catch {
					console.error('Error in ' + obj.name + ' afterSwitchingOn script.');
					await interaction.followUp({ content: 'Error in afterSwitchingOn script.', flags: 64 });
				}
			}
			try {
				await q.saveGame('./game.json', qgame);
			}
			catch (err) {
				console.error('Error saving game data:', err);
				await interaction.followUp({ content: 'Failed to save game data.', flags: 64 });
			}
			return;
		}
		await interaction.reply({ content: q.template.cantSwitch(q.GetDisplayName(obj)), flags: 64 });
	},
};