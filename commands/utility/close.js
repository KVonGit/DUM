const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('close')
		.setDescription('Close something')
		.addStringOption(option =>
			option.setName('object')
				.setDescription('The object you wish to close')
				.setRequired(true)),
	async execute(interaction) {
		const { qgame, pov } = await q.getGamePov();
		if (!pov) return;

		const object = interaction.options.getString('object');
		if (typeof object == 'undefined') {
			await interaction.reply('\'object\' not defined.');
			return;
		}
		const obj = q.getObject(qgame, object);
		if (typeof obj == 'undefined') {
			await q.msg('No such object ("' + object + '")!');
			return;
		}

		if (!q.inScope(obj)) {
			await q.msg(q.template.cantSee(q.GetDisplayName(obj)));
			return;
		}
		if (obj.isOpen === false) {
			await q.msg(q.template.alreadyClosed(q.GetDisplayName(obj)));
			return;
		}
		if (obj.close === true) {
			obj.isOpen = false;
			if (typeof obj.closeMsg == 'string') {
				await q.msg(obj.closeMsg);
			}
			else {
				await q.msg(q.template.defaultClose(q.GetDisplayName(obj)));
			}
			if (typeof obj.afterClosingMsg == 'string') {
				await q.msg(obj.afterClosingMsg);
			}
			if (obj.afterClosing) {
				try {
					await eval(obj.afterClosing);
				}
				catch {
					console.error('Error in ' + obj.name + ' afterClosing script.');
					await q.msg('Error in afterClosing script.');
				}
			}
			await q.saveGame('./game.json', qgame);
			return;
		}
		if (obj.inherit && obj.inherit.indexOf('openable') >= 0) {
			if (typeof obj.close == 'undefined') {
				if (obj.isOpen === false) {
					await q.msg(q.template.alreadyClosed(q.GetDisplayName(obj)));
					return;
				}
				obj.isOpen = false;
				if (typeof obj.closeMsg == 'string') {
					await q.msg(obj.closeMsg);
				}
				else {
					await q.msg(q.template.defaultClose(q.GetDisplayName(obj)));
				}
				if (typeof obj.afterClosingMsg == 'string') {
					await q.msg(obj.afterClosingMsg);
				}
				if (obj.afterClosing) {
					try {
					  await eval(obj.afterClosing);
					}
					catch {
						console.error('Error in ' + obj.name + ' afterClosing script.');
						await q.msg('Error in afterClosing script.');
					}
				}
				await q.saveGame('./game.json', qgame);
				return;
			}
			if (typeof obj.close === 'string') {
				await q.msg(obj.close);
				return;
			}
			if (typeof obj.close.type == 'undefined') {
				await q.msg(q.template.cantClose(q.GetDisplayName(obj)));
				return;
			}
			if (obj.close.type == 'script') {
			    try {
				 await eval(obj.close.attr);
				}
				catch {
					console.error('Error in ' + obj.name + ' close script.');
					await q.msg('Error in close script.');
				}
				try {
					await q.saveGame('./game.json', qgame);
				}
				catch (err) {
					console.error('Error saving game data:', err);
					await q.msg('Failed to save game data.');
				}
			}
			else if (obj.close.type == 'string') {
				await q.msg(obj.close.attr);
			}
			else if (obj.close.type === 'boolean') {
				if (obj.isOpen === true) {
					await q.msg(q.template.alreadyClosed(q.GetDisplayName(obj)));
					return;
				}
				obj.isOpen = false;
				if (typeof obj.closeMsg == 'string') {
					await q.msg(obj.closeMsg);
				}
				else {
					await q.msg(q.template.defaultClose(q.GetDisplayName(obj)));
				}
				if (typeof obj.afterClosingMsg == 'string') {
					await q.msg(obj.afterClosingMsg);
				}
				if (obj.afterClosing) {
					try {
						await eval(obj.afterClosing);
					}
					catch {
						console.error('Error in ' + obj.name + ' afterClosing script.');
						await q.msg('Error in afterClosing script.');
					}
				}
				try {
					await q.saveGame('./game.json', qgame);
				}
				catch (err) {
					console.error('Error saving game data:', err);
					await q.msg('Failed to save game data.');
				}
			}
			await q.saveGame('./game.json', qgame);
			return;
		}
		let prefix = obj.prefix || '';
		if (obj.prefix && obj.prefix === 'a') prefix = 'the';
		if (prefix !== '') prefix += ' ';
		const name = obj.alias || obj.name;
		const displayName = prefix + name;
		await q.msg(q.template.cantOpenOrClose(displayName));
	},
};