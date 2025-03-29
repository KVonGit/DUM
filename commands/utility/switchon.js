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
			await q.msg('\'' + object + '\' not defined.');
			return;
		}
		const obj = q.getObject(qgame, object);
		if (typeof obj === 'undefined') {
			await q.msg('No such object ("' + object + '")!');
			return;
		}
		if (!q.inScope(obj)) {
			await q.msg(q.template.cantSee(q.GetDisplayName(obj)));
			return;
		}
		if (obj.switchedOn === true) {
			await q.msg(q.template.alreadyOn(q.GetDisplayName(obj)));
			return;
		}
		if (obj.inherit && obj.inherit.indexOf('switchable') >= 0) {
			if (obj.canSwitchOn === true) {
				obj.switchedOn = true;
			}
			else if (obj.canSwitchOn === false) {
				await q.msg(q.template.cantSwitch(q.GetDisplayName(obj)));
				return;
			}
			else if (obj.switchOn.type) {
				switch (obj.switchOn.type) {
				case 'string':
					await q.msg(obj.switchOn.attr);
					break;
				case 'script':
					await eval(obj.switchOn.attr);
					break;
				case 'boolean':
					obj.switchedOn = true;
					break;
				default:
					await q.msg('There was an error in the switchOn property.');
				}

			}
			else {
				obj.switchedOn = false;
			}
			if (typeof obj.switchedOnMsg === 'string') {
				await q.msg(obj.switchedOnMsg);
			}
			else {
				await q.msg('You switch ' + q.GetDisplayName(obj) + ' on.');
			}
			if (typeof obj.afterSwitchingOnMsg === 'string') {
				await q.msg(obj.afterSwitchingOnMsg, true, true);
			}
			if (obj.afterSwitchingOn) {
				try {
					await eval(obj.afterSwitchingOn);
				}
				catch {
					console.error('Error in ' + obj.name + ' afterSwitchingOn script.');
					await q.msg('Error in afterSwitchingOn script.', true, true);
				}
			}
			try {
				await q.saveGame('./game.json', qgame);
			}
			catch (err) {
				console.error('Error saving game data:', err);
				await q.msg('Failed to save game data.', true, true);
			}
			return;
		}
		await q.msg(q.template.cantSwitch(q.GetDisplayName(obj)));
	},
};