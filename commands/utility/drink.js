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
		const { qgame, pov } = await q.getGamePov();
		if (!pov) return;
		const object = interaction.options.getString('object');
		if (typeof object == 'undefined') {
			await interaction.reply('\'object\' not defined.');
			return;
		}
		const obj = q.getObject(qgame, object);;
		if (obj == 'undefined') {
			await interaction.reply({ content: 'No such object ("' + object + '")!', flags: 64 });
			return;
		}
		if ((obj.loc != pov.loc && obj.loc != pov.name) || (typeof obj.visible != 'undefined' && obj.visible == false)) {
			await interaction.reply({ content: q.template.cantSee(obj.alias || obj.name), flags: 64 });
			return;
		}
		if (typeof obj.drink == 'undefined') {
			const s = 'You can\'t do that.';
			await interaction.reply({ content: s, flags: 64 });
		}
		else if (obj.drink === true) {
			obj.loc = 'nowhere';
			await interaction.reply({ content: 'You drink.', flags: 64 });
		}
		else if (typeof obj.drink == 'string') {
			await interaction.reply({ content:obj.drink, flags: 64 });
		}
		else if (typeof obj.drink.type !== 'undefined' && obj.drink.type == 'script') {
			// eslint-disable-next-line prefer-const
			let replyString = '';
			await eval (obj.drink.attr);
			await interaction.reply({ content: replyString || 'You can\'t do that.', flags: 64 });
		}
		else {
			const s = 'You can\'t do that.';
			await interaction.reply({ content: s, flags: 64 });
		}
		await q.saveGame('./game.json', qgame);
	},
};