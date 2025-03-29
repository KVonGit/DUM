const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');
// const warned = {};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('eat')
		.setDescription('Eat something')
		.addStringOption(option =>
			option.setName('object')
				.setDescription('The object you wish to eat')
				.setRequired(true)),
	async execute(interaction) {
		const object = interaction.options.getString('object');
		if (typeof object == 'undefined') {
			await q.msg('\'object\' not defined.');
			return;
		}
		const obj = q.getObject(qgame, object);;
		if (obj == 'undefined') {
			await q.msg('No such object ("' + object + '")!');
			return;
		}
		if (!q.inScope(obj)) {
			await q.msg(q.template.cantSee(q.GetDisplayName(obj)));
			return;
		}
		if (typeof obj.eat == 'undefined') {
			const s = 'You can\'t eat ' + q.GetDisplayName(obj, true) + '.';
			await q.msg(s);
		}
		else if (obj.eat === true) {
			obj.loc = 'nowhere';
			await q.msg('You eat ' + q.GetDisplayName(obj, true) + '.');
		}
		else if (typeof obj.eat == 'string') {
			await q.msg(obj.eat);
		}
		else if (typeof obj.eat.type !== 'undefined' && obj.eat.type == 'script') {
			// eslint-disable-next-line prefer-const
			let replyString = '';
			await eval (obj.eat.attr);
			await q.msg(replyString || 'You can\'t eat ' + q.GetDisplayName(obj, true) + '.');
		}
		else {
			const s = 'You can\'t eat ' + q.GetDisplayName(obj, true) + '.';
			await q.msg(s);
		}
		await q.saveGame('./game.json', qgame);
	},
};