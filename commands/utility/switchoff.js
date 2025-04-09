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
	aliases: ['turnoff'],
	async execute(interaction) {
		const object = interaction.options.getString('object');
		if (typeof object === 'undefined') {
			await interaction.reply('\'object\' not defined.');
			return;
		}
		const obj = q.GetObject(object);
		if (typeof obj === 'undefined') {
			await q.msg('No such object ("' + object + '")!');
			return;
		}
		pov.lastObject[obj.objectPronoun] = obj.name;
		if (!q.inScope(obj)) {
			await q.msg(q.template.cantSee(q.GetDisplayName(obj, false, false, true)));
			return;
		}
		
		if (obj.switchedOn === false) {
			await q.msg(q.template.alreadyOff(q.GetDisplayName(obj, true, false, true)));
			return;
		}
		if (obj.inherit && obj.inherit.indexOf('switchable') >= 0) {
			if (obj.canSwitchOff === true) {
				obj.switchedOn = false;
			}
			else if (obj.canSwitchOff === false) {
				await q.msg(q.template.cantSwitch(q.GetDisplayName(obj, true, false, true)));
				return;
			}
			else if (obj.switchOff.type) {
				switch (obj.switchOff.type) {
				case 'string':
					await q.msg(obj.switchOff.attr);
					break;
				case 'script':
					await eval(obj.switchOff.attr);
					break;
				case 'boolean':
					obj.switchedOn = false;
					break;
				default:
					await q.msg('There was an error in the switchOff property.');
				}

			}
			else {
				obj.switchedOn = false;
			}
			if (typeof obj.switchedOffMsg === 'string') {
				await q.msg(obj.switchedOffMsg);
			}
			else {
				await q.msg('You switch ' + q.GetDisplayName(obj, true, false, true) + ' off.');
			}
			if (typeof obj.afterSwitchingOffMsg === 'string') {
				await q.msg(obj.afterSwitchingOffMsg, true, false);
			}
			if (obj.afterSwitchingOff) {
				try {
					await eval(obj.afterSwitchingOff);
				}
				catch {
					console.error('Error in ' + obj.name + ' afterSwitchingOff script.');
					await q.msg('Error in afterSwitchingOff script.', true, false);
				}
			}
			try {
			}
			catch (err) {
				console.error('Error saving game data:', err);
				await q.msg('Failed to save game data.', true, false);
			}
			return;
		}
		await q.msg(q.template.cantSwitch(q.GetDisplayName(obj, true, false, true)));
	},
};