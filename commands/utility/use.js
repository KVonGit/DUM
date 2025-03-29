const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');
// const warned = {};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('use')
		.setDescription('Use something')
		.addStringOption(option =>
			option.setName('object')
				.setDescription('The object you wish to use')
				.setRequired(true)),
	async execute(interaction) {
		const object = interaction.options.getString('object');
		if (typeof object == 'undefined') {
			await q.msg('\'object\' not defined.');
			return;
		}
		const obj = q.GetObject(object);
		if (obj == 'undefined') {
			await q.msg('No such object ("' + object + '")!');
			return;
		}
		if (obj.loc != pov.name || (typeof obj.visible != 'undefined' && obj.visible == false)) {
			await q.msg(q.template.dontHave(q.GetDisplayName(obj)));
			return;
		}

		if (typeof obj.use == 'undefined') {
			const s = 'You can\'t use ' + q.GetDisplayName(obj, true) + ' that way.';
			await q.msg(s);
			return;
		}
		const { type, attr } = q.getAttribute(obj.use);
		if (!type) {
			const s = 'You can\'t use ' + q.GetDisplayName(obj, true) + ' that way.';
			await q.msg(s);
			return;
		}
		if (attr === true) {
			await q.msg('You use it, but nothing seems to happen.');
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
			const s = 'You can\'t use ' + q.GetDisplayName(obj, true) + ' that way.';
			await q.msg(s);
		}
		await q.saveGame('./game.json', qgame);
	},
};