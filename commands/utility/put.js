const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('put')
		.setDescription('Put something on/in something')
		.addStringOption(option =>
			option.setName('object1')
				.setDescription('The object you wish to put on/in something')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('object2')
				.setDescription('The object you wish to put something on/in')
				.setRequired(true)),
	async execute(interaction) {
		const object1Name = interaction.options.getString('object1');
		if (!object1Name) {
			await q.msg('\'object\' not defined.');
			return;
		}

		const obj1 = q.getObject(qgame, object1Name);
		if (!obj1) {
			await q.msg(`No such object ("${object1Name}")!`);
			return;
		}
		pov.lastObject[obj1.objectPronoun] = obj1.name;
		const object2Name = interaction.options.getString('object2');
		if (!object2Name) {
			await q.msg('\'' + object + '\' not defined.');
			return;
		}

		const obj2 = q.getObject(qgame, object2Name);
		if (!obj2) {
			await q.msg(`No such object ("${object2Name}")!`);
			return;
		}

		if (obj1.loc !== pov.name) {
			await q.msg(q.template.dontHave(q.GetDisplayName(obj1, false, false, true)));
			return;
		}

		if (obj2.name === pov.name || obj1.name === obj1.name || obj2.name === obj1.name) {
			await q.msg('You can\'t do that.');
			return;
		}

		let wasDropped = false;
		if (!obj1.drop || !obj1.drop.type) {
			wasDropped = false;
			if (obj2.inherit.indexOf('surface') >= 0) {
				obj1.loc = obj2.name;
				wasDropped = true;
			}
			else if (obj2.inherit.indexOf('container') >= 0) {
				if (obj2.isOpen) {
					obj1.loc = obj2.name;
					wasDropped = true;
				}
				else {
					await q.msg(q.template.containerClosed(q.GetDisplayName(obj2, true, false, true)));
				}
			}
		}
		else {
			switch (obj1.drop.type) {
			case 'string':
				await q.msg(obj1.drop.attr);
				break;
			case 'boolean':
				if (obj1.drop.attr) {
					wasDropped = true;
					obj1.loc = obj2.name;
				}
				else {
					await q.msg(q.template.cantDrop(q.GetDisplayName(obj1, true, false, true)));
				}
				break;
			case 'script':
				eval(obj1.drop.attr);
				wasDropped = obj1.loc !== pov.name;
				break;
			default:
				wasDropped = true;
				obj1.loc = obj2.name;
				break;
			}
		}

		if (wasDropped) {
			await q.msg(`${q.GetDisplayName(pov)} dropped ${q.GetDisplayName(obj1, true, false, true)} in: **${pov.loc}**.`, false, false);
			await q.msg('Done.');
			try {
				await q.saveGame('./game.json', qgame);
			}
			catch (err) {
				console.error('Error saving game data:', err);
				await q.msg('Failed to save game data.');
			}
		}
	},
};