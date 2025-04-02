const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('give')
		.setDescription('Give something to someone')
		.addStringOption(option =>
			option.setName('object')
				.setDescription('The object you wish to give')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('to')
				.setDescription('The person to which you wish to give the object')
				.setRequired(true)),
	async execute(interaction) {
		// console.log('Give command executed!');
		// console.log('interaction', interaction);
		const object1Name = interaction.options.getString('object');
		if (!object1Name) {
			await q.msg('\'object\' not defined.');
			return;
		}

		const obj1 = q.GetObject(object1Name);
		if (!obj1) {
			await q.msg(`No such object ("${object1Name}")!`);
			return;
		}
		pov.lastObject[obj1.objectPronoun] = obj1.name;
		const object2Name = interaction.options.getString('to');
		if (!object2Name) {
			await q.msg('\'object\' not defined.');
			return;
		}

		const obj2 = q.GetObject(object2Name);
		if (!obj2) {
			await q.msg(`No such object ("${object2Name}")!`);
			return;
		}

		if (obj1.loc !== pov.name) {
			await q.msg(q.template.dontHave(q.GetDisplayName(obj1, false, false, true)));
			return;
		}
		if (obj2.name === pov.name || obj1.name === pov.name || obj2.name === obj1.name) {
			await q.msg('You can\'t do that.');
			return;
		}
		if (!q.inScope(obj2)) {
			await q.msg(q.template.cantSee(q.GetDisplayName(obj2, false, false, true)));
			return;
		}
		pov.lastObject[obj2.objectPronoun] = obj2.name;
		if (typeof obj2.give !== 'undefined') {
			// It's a "dictionary"
			if (typeof obj2.give[obj1.name] !== 'undefined') {
				// It's a "dictionary" and we have a script for this object
				// eslint-disable-next-line prefer-const
				let replyString = '';
				await eval(obj2.give[obj1.name]);
				await q.msg(replyString || 'No replyString returned!');
				await q.saveGame();
				return;
			}
		}
		if (typeof obj1.give !== 'undefined') {
			// It's a "dictionary"
			if (typeof obj1.give[obj2.name] !== 'undefined') {
				// It's a "dictionary" and we have a script for this person
				// eslint-disable-next-line prefer-const
				let replyString = '';
				await eval(obj1.give[obj2.name]);
				await q.msg(replyString || 'No replyString returned!');
				await q.saveGame();
				return;
			}
		}
		if (typeof obj2.userName !== 'undefined') {
			// It's another player
			await q.msg(q.GetDisplayName(pov).capFirst() + ' gives ' + q.GetDisplayName(obj1, true, false, true) + ' to ' + q.GetDisplayName(obj2, true) + '.', false, false);;
			await q.msg('You give ' + q.GetDisplayName(obj1, true, false, true) + ' to ' + q.GetDisplayName(obj2, true) + '.');
			obj1.loc = obj2.name;
			await q.saveGame();
			return;
		}
		await q.msg(q.GetDisplayName(obj2).capFirst() + ' doesn\'t seem interested.');

	},
};