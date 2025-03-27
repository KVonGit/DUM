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
		const { qgame, pov } = await q.getGamePov();
		if (!pov) return;

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
			await q.msg(q.template.dontHave(q.GetDisplayName(obj1)));
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
					await q.msg(q.template.containerClosed(obj2.name));
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
					await q.msg(q.template.cantDrop(obj1.name));
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
			await q.msg(`${pov.alias} dropped ${q.GetDisplayName(obj1, true)} in ${pov.loc}.`, false, false);
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