const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');
// const warned = {};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('examine')
		.setDescription('Examine something')
		.addStringOption(option =>
			option.setName('object')
				.setDescription('The object you wish to examine')),
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
		const obj = q.getObject(qgame, object);;
		if (obj == 'undefined') {
			await interaction.reply({ content: 'No such object ("' + object + '")!', flags: 64 });
			return;
		}
		// TODO - Check scope!
		/*
		if (typeof warned[pov.name] == 'undefined') {
			warned[pov.name] = true;
			await q.privateMessage(interaction, 'Hey, ' + pov.alias + '... Tell the admin to fix the `/look` command! It does not check scope, location, or anything else!');
		}
		*/
		if (obj.loc != pov.loc || (typeof obj.visible != 'undefined' && obj.visible == false)) {
			await interaction.reply({ content: q.template.cantSee(obj.alias || obj.name), flags: 64 });
		}
		else if (typeof obj.look == 'undefined') {
			const s = q.template.defaultLook;
			await interaction.reply({ content: s, flags: 64 });
		}
		else if (typeof obj.look == 'string') {
			await interaction.reply({ content:obj.look, flags: 64 });
		}
		else if (typeof obj.look.type !== 'undefined' && obj.look.type == 'script') {
			let replyString;
			await eval (obj.look.attr);
			await interaction.reply({ content: replyString || q.defaultLook, flags: 64 });
		}
		else {
			const s = q.template.defaultLook;
			await interaction.reply({ content: s, flags: 64 });
		}
	},
};