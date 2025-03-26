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
		const object = interaction.options.getString('object');
		if (typeof object == 'undefined') {
			await interaction.reply('\'object\' not defined.');
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
		if (typeof obj == 'undefined') {
			await interaction.reply({ content: 'No such object ("' + object + '")!', flags: 64 });
			return;
		}
		if ((obj.loc != pov.loc && obj.loc != pov.name) || obj.visible === false) {
			await interaction.reply({ content: q.template.cantSee(q.GetDisplayName(obj)), flags: 64 });
			return;
		}
		if (obj.isOpen === false) {
			await interaction.reply({ content: q.template.alreadyClosed(q.GetDisplayName(obj)), flags: 64 });
			return;
		}
		if (obj.close === true) {
			obj.isOpen = false;
			if (typeof obj.closeMsg == 'string') {
				await interaction.reply({ content: obj.closeMsg, flags: 64 });
			}
			else {
				await interaction.reply({ content: q.template.defaultClose(q.GetDisplayName(obj)), flags: 64 });
			}
			if (typeof obj.afterClosingMsg == 'string') {
				await interaction.followUp({ content: obj.afterClosingMsg, flags: 64 });
			}
			if (obj.afterClosing) {
				try {
					await eval(obj.afterClosing);
				}
				catch {
					console.error('Error in ' + obj.name + ' afterClosing script.');
					await interaction.followUp({ content: 'Error in afterClosing script.', flags: 64 });
				}
			}
			await q.saveGame('./game.json', qgame);
			return;
		}
		if (obj.inherit && obj.inherit.indexOf('openable') >= 0) {
			if (typeof obj.close == 'undefined') {
				if (obj.isOpen === false) {
					await interaction.reply({ content: q.template.alreadyClosed(q.GetDisplayName(obj)), flags: 64 });
					return;
				}
				obj.isOpen = false;
				if (typeof obj.closeMsg == 'string') {
					await interaction.reply({ content: obj.closeMsg, flags: 64 });
				}
				else {
					await interaction.reply({ content: q.template.defaultClose(q.GetDisplayName(obj)), flags: 64 });
				}
				if (typeof obj.afterClosingMsg == 'string') {
					await interaction.followUp({ content: obj.afterClosingMsg, flags: 64 });
				}
				if (obj.afterClosing) {
					try {
					  await eval(obj.afterClosing);
					}
					catch {
						console.error('Error in ' + obj.name + ' afterClosing script.');
						await interaction.followUp({ content: 'Error in afterClosing script.', flags: 64 });
					}
				}
				await q.saveGame('./game.json', qgame);
				return;
			}
			if (typeof obj.close === 'string') {
				await interaction.reply({ content: obj.close, flags: 64 });
				return;
			}
			if (typeof obj.close.type == 'undefined') {
				await interaction.reply({ content: q.template.cantClose(q.GetDisplayName(obj)), flags: 64 });
				return;
			}
			if (obj.close.type == 'script') {
			    try {
				 await eval(obj.close.attr);
				}
				catch {
					console.error('Error in ' + obj.name + ' close script.');
					await interaction.reply({ content: 'Error in close script.', flags: 64 });
				}
				try {
					await q.saveGame('./game.json', qgame);
				}
				catch (err) {
					console.error('Error saving game data:', err);
					await interaction.followUp({ content: 'Failed to save game data.', flags: 64 });
				}
			}
			else if (obj.close.type == 'string') {
				await interaction.reply({ content: obj.close.attr, flags: 64 });
			}
			else if (obj.close.type === 'boolean') {
				if (obj.isOpen === true) {
					await interaction.reply({ content: q.template.alreadyClosed(q.GetDisplayName(obj)), flags: 64 });
					return;
				}
				obj.isOpen = false;
				if (typeof obj.closeMsg == 'string') {
					await interaction.reply({ content: obj.closeMsg, flags: 64 });
				}
				else {
					await interaction.reply({ content: q.template.defaultClose(q.GetDisplayName(obj)), flags: 64 });
				}
				if (typeof obj.afterClosingMsg == 'string') {
					await interaction.followUp({ content: obj.afterClosingMsg, flags: 64 });
				}
				if (obj.afterClosing) {
					try {
						await eval(obj.afterClosing);
					}
					catch {
						console.error('Error in ' + obj.name + ' afterClosing script.');
						await interaction.followUp({ content: 'Error in afterClosing script.', flags: 64 });
					}
				}
				try {
					await q.saveGame('./game.json', qgame);
				}
				catch (err) {
					console.error('Error saving game data:', err);
					await interaction.followUp({ content: 'Failed to save game data.', flags: 64 });
				}
			}
			await q.saveGame('./game.json', qgame);
			return;
		}
		await interaction.reply({ content: q.template.cantOpenOrClose(q.GetDisplayName(obj)), flags: 64 });
	},
};