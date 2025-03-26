const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('open')
		.setDescription('Open something')
		.addStringOption(option =>
			option.setName('object')
				.setDescription('The object you wish to open')
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
		if (obj.isOpen === true) {
			await interaction.reply({ content: q.template.alreadyOpen(q.GetDisplayName(obj)), flags: 64 });
			return;
		}
		if (obj.open === true) {
			obj.isOpen = true;
			if (typeof obj.openMsg == 'string') {
				await interaction.reply({ content: obj.openMsg, flags: 64 });
			}
			else {
				await interaction.reply({ content: q.template.defaultOpen(q.GetDisplayName(obj)), flags: 64 });
			}
			if (typeof obj.afterOpeningMsg == 'string') {
				await interaction.followUp({ content: obj.afterOpeningMsg, flags: 64 });
			}
			if (obj.afterOpening) {
				try {
					await eval(obj.afterOpening);
				}
				catch {
					console.error('Error in ' + obj.name + ' afterOpening script.');
					await interaction.followUp({ content: 'Error in afterOpening script.', flags: 64 });
				}
			}
			await q.saveGame('./game.json', qgame);
			return;
		}
		if (obj.inherit && obj.inherit.indexOf('openable') >= 0) {
			if (typeof obj.open == 'undefined') {
				if (obj.isOpen === true) {
					await interaction.reply({ content: q.template.alreadyOpen(q.GetDisplayName(obj)), flags: 64 });
					return;
				}
				obj.isOpen = true;
				if (typeof obj.openMsg == 'string') {
					await interaction.reply({ content: obj.openMsg, flags: 64 });
				}
				else {
					await interaction.reply({ content: q.template.defaultOpen(q.GetDisplayName(obj)), flags: 64 });
				}
				if (typeof obj.afterOpeningMsg == 'string') {
					await interaction.followUp({ content: obj.afterOpeningMsg, flags: 64 });
				}
				if (obj.afterOpening) {
					try {
					  await eval(obj.afterOpening);
					}
					catch {
						console.error('Error in ' + obj.name + ' afterOpening script.');
						await interaction.followUp({ content: 'Error in afterOpening script.', flags: 64 });
					}
				}
				await q.saveGame('./game.json', qgame);
				return;
			}
			if (typeof obj.open === 'string') {
				await interaction.reply({ content: obj.open, flags: 64 });
				return;
			}
			if (typeof obj.open.type == 'undefined') {
				await interaction.reply({ content: q.template.cantOpen(q.GetDisplayName(obj)), flags: 64 });
				return;
			}
			if (obj.open.type == 'script') {
			    try {
				 await eval(obj.open.attr);
				}
				catch {
					console.error('Error in ' + obj.name + ' open script.');
					await interaction.reply({ content: 'Error in open script.', flags: 64 });
				}
				try {
					await q.saveGame('./game.json', qgame);
				}
				catch (err) {
					console.error('Error saving game data:', err);
					await interaction.followUp({ content: 'Failed to save game data.', flags: 64 });
				}
			}
			else if (obj.open.type == 'string') {
				await interaction.reply({ content: obj.open.attr, flags: 64 });
			}
			else if (obj.open.type === 'boolean') {
				if (obj.isOpen === true) {
					await interaction.reply({ content: q.template.alreadyOpen(q.GetDisplayName(obj)), flags: 64 });
					return;
				}
				obj.isOpen = true;
				if (typeof obj.openMsg == 'string') {
					await interaction.reply({ content: obj.openMsg, flags: 64 });
				}
				else {
					await interaction.reply({ content: q.template.defaultOpen(q.GetDisplayName(obj)), flags: 64 });
				}
				if (typeof obj.afterOpeningMsg == 'string') {
					await interaction.followUp({ content: obj.afterOpeningMsg, flags: 64 });
				}
				if (obj.afterOpening) {
					try {
						await eval(obj.afterOpening);
					}
					catch {
						console.error('Error in ' + obj.name + ' afterOpening script.');
						await interaction.followUp({ content: 'Error in afterOpening script.', flags: 64 });
					}
				}
				if (obj.listChildren === true) {
					if (obj.inherit.indexOf('container') >= 0 && obj.isOpen === false) {
						return;
					}
					const children = q.GetDirectChildren(obj);
					let n = obj.inherit.indexOf('surface') >= 0 ? 'On ' : 'In ';
					n += q.GetDisplayName(obj) + ', you see ';
					if (children.length > 0) {
						if (typeof obj.listchildrenprefix === 'string') {
							n = obj.listchildrenprefix;
						}
						n += q.GetDirectChildrenAsString(obj);
					}
					await q.msg(n, true, true);
				}
				try {
					await q.saveGame('./game.json', qgame);
				}
				catch (err) {
					console.error('Error saving game data:', err);
					await interaction.followUp({ content: 'Failed to save game data.', flags: 64 });
				}
			}
			return;
		}
		await interaction.reply({ content: q.template.cantOpenOrClose(q.GetDisplayName(obj)), flags: 64 });
	},
};