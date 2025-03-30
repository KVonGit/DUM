const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');
// const warned = {};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('useon')
		.setDescription('Use something on something')
		.addStringOption(option =>
			option.setName('object1')
				.setDescription('The object you wish to use')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('object2')
				.setDescription('(OPTIONAL) The object on which you wish to use the first object')
				.setRequired(true)),
	async execute(interaction) {
		const object1 = interaction.options.getString('object1');
		if (typeof object1 == 'undefined') {
			await q.msg('\'object1\' not defined.');
			return;
		}
		const obj = q.GetObject(object1);
		if (obj == 'undefined') {
			await q.msg('No such object ("' + object1 + '")!');
			return;
		}
		if (obj.loc != pov.name || (typeof obj.visible != 'undefined' && obj.visible == false)) {
			await q.msg(q.template.dontHave(q.GetDisplayName(obj, false, false, true)));
			return;
		}
		pov.lastObject[obj.objectPronoun] = obj.name;
		const object2 = interaction.options.getString('object2');
		if (typeof object2 == 'undefined' || object2 === null) {
			await q.msg('No such object ("' + object2 + '")!');
			return;
		}

		console.log('object2', object2);
		const obj2 = q.GetObject(object2);
		if (obj2 == 'undefined') {
			await q.msg('No such object ("' + object2 + '")!');
			return;
		}
		if (!q.inScope(obj2)) {
			await q.msg(q.template.cantSee(q.GetDisplayName(obj2, false, false, true)));
			return;
		}
		if (typeof obj2.use == 'undefined') {
			console.log('No use att for obj2');
		}
		else {
			if (typeof obj2.use[obj.name] == 'undefined') {
				console.log ('No item for obj1 in obj2 use dictionary');
			}
			const { type: obj2Type, attr: obj2Attr } = q.getAttribute(obj2.use, obj.name);
			if (obj2Type == 'boolean') {
				if (!obj2Attr) {
					await q.msg('You can\'t use ' + q.GetDisplayName(obj, true, false, true) + ' on ' + q.GetDisplayName(obj2, true, false, true) + '.');
					await q.saveGame('./game.json', qgame);
					return;
				}
			}
			else if (obj2Type == 'string') {
				await q.msg(obj2Attr);
				await q.saveGame('./game.json', qgame);
				return;
			}
			else if (obj2Type == 'script') {
				// eslint-disable-next-line prefer-const
				let replyString = '';
				// eslint-disable-next-line prefer-const
				let responded = false;
				await eval (obj2Attr);
				if (responded) {
					// do nothing
				}
				else {
					await q.msg(replyString || 'ERROR: replyString is empty!');
				}
				await q.saveGame('./game.json', qgame);
				return;
			}
			else {
				const s = 'There is an error in the second object\'s use script for the first object.';
				await q.msg(s);
				await q.saveGame('./game.json', qgame);
				return;
			}
		}


		if (typeof obj.use == 'undefined' || typeof obj.use[obj2.name] == 'undefined') {
			const s = 'You can\'t use ' + q.GetDisplayName(obj, true, false, true) + ' on ' + q.GetDisplayName(obj2, true, false, true) + '.';
			await q.msg(s);
			return;
		}
		const { type, attr } = q.getAttribute(obj.use[obj2.name]);
		if (!type) {
			const s = 'You can\'t use ' + q.GetDisplayName(obj, true, false, true) + ' on ' + q.GetDisplayName(obj2, true, false, true) + '.';
			await q.msg(s);
			return;
		}
		if (attr === false) {
			await q.msg('You can\'t use ' + q.GetDisplayName(obj, true, false, true) + ' on ' + q.GetDisplayName(obj2, true, false, true) + '.');
		}
		else if (type == 'string') {
			await q.msg(attr);
		}
		else if (type == 'script') {
			// eslint-disable-next-line prefer-const
			let replyString = '';
			await eval (attr);
			await q.msg(replyString || 'ERROR: replyString is empty!');
		}
		else {
			const s = 'You can\'t use ' + q.GetDisplayName(obj, true, false, true) + ' on ' + q.GetDisplayName(obj2, true, false, true) + '.';
			await q.msg(s);
		}
		await q.saveGame('./game.json', qgame);
	},
};