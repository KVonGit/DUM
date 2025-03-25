const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('switchoff')
		.setDescription('Switch something off.')
		.addStringOption(option =>
			option.setName('object')
				.setDescription('The object you wish to switch off')
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
		if (obj.switchedOn === false) {
			await interaction.reply({ content: q.template.alreadyOff(q.GetDisplayName(obj)), flags: 64 });
			return;
		}
		if (obj.inherit && obj.inherit.indexOf('switchable') >= 0) {
			if (obj.canSwitchOff === true) {
				obj.switchedOn = false;
			}
			else if (obj.canSwitchOff === false) {
				await interaction.reply({ content: q.template.cantSwitch(q.GetDisplayName(obj)), flags: 64 });
				return;
			}
			else if (obj.switchOff.type) {
				switch (obj.switchOff.type) {
				case 'string':
					await interaction.reply({ content: obj.switchOff.attr, flags: 64 });
					break;
				case 'script':
					await eval(obj.switchOff.attr);
					break;
				case 'boolean':
					obj.switchedOn = false;
					break;
				default:
					await interaction.reply({ content: 'There was an error in the switchOff property.', flags: 64 });
				}

			}
			else {
				obj.switchedOn = false;
			}
			if (typeof obj.switchedOffMsg === 'string') {
				await interaction.reply({ content: obj.switchedOffMsg, flags: 64 });
			}
			else {
				await interaction.reply({ content: q.template.defaultSwitchedOff(q.GetDisplayName(obj)), flags: 64 });
			}
			if (typeof obj.afterSwitchingOffMsg === 'string') {
				await interaction.followUp({ content: obj.afterSwitchingOffMsg, flags: 64 });
			}
			if (obj.afterSwitchingOff) {
				try {
					await eval(obj.afterSwitchingOff);
				}
				catch {
					console.error('Error in ' + obj.name + ' afterSwitchingOff script.');
					await interaction.followUp({ content: 'Error in afterSwitchingOff script.', flags: 64 });
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