const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');
// const warned = {};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('drink')
		.setDescription('Drink something')
		.addStringOption(option =>
			option.setName('object')
				.setDescription('The object you wish to drink')
				.setRequired(true)),
	async execute(interaction) {
		const object = interaction.options.getString('object');
		if (typeof object == 'undefined') {
			await q.msg('\'object\' not defined.');
			return;
		}
		const obj = q.GetObject(object);;
		if (obj == 'undefined') {
			await q.msg('No such object ("' + object + '")!');
			return;
		}
		if (!q.inScope(obj)) {
			await q.msg(q.template.cantSee(q.GetDisplayName(obj, false, false, true)));
			return;
		}
		pov.lastObject[obj.objectPronoun] = obj.name;
		if (typeof obj.drink == 'undefined') {
			const s = 'You can\'t do that.';
			await q.msg(s);
		}
		else if (obj.drink === true) {
			obj.loc = 'nowhere';
			await q.msg('You drink.');
		}
		else if (typeof obj.drink == 'string') {
			await q.msg(obj.drink);
		}
		else if (typeof obj.drink.type !== 'undefined' && obj.drink.type == 'script') {
			// eslint-disable-next-line prefer-const
			let replyString = '';
			await eval (obj.drink.attr);
			await q.msg(replyString || 'You can\'t do that.');
		}
		else {
			const s = 'You can\'t do that.';
			await q.msg(s);
		}
		await q.saveGame('./game.json', qgame);
	},
};