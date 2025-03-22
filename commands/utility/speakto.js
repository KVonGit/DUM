const { SlashCommandBuilder } = require('discord.js');
const core = require('../../engine/core');
// const warned = {};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('speakto')
		.setDescription('Speakto someone (or something?)')
		.addStringOption(option =>
			option.setName('npc')
				.setDescription('The npc you wish to which you wish to speak')),
	async execute(interaction) {
		const npc = interaction.options.getString('npc');
		if (typeof npc == 'undefined') {
			await interaction.reply({ content: '\'' + npc + '\' not defined.', flags: 64 });
			return;
		}
		const qgame = await core.loadGame('./game.json', interaction);
		const povName = interaction.user.username;
		const pov = qgame.players[povName];
		if (Object.keys(qgame.players).indexOf(povName) < 0) {
			await interaction.reply({ content: core.template.mustStartGame, flags: 64 });
			return 3;
		}
		const obj = core.getObject(qgame, npc);;
		if (obj == 'undefined') {
			await interaction.reply({ content: 'No such object ("' + npc + '")!', flags: 64 });
			return;
		}
		// TODO - Check scope!
		/*
		if (typeof warned[pov.name] == 'undefined') {
			warned[pov.name] = true;
			await core.privateMessage(interaction, 'Hey, ' + pov.alias + '... Tell the admin to fix the `/look` command! It does not check scope, location, or anything else!');
		}
		*/
		if (obj.loc != pov.loc || (typeof obj.visible != 'undefined' && obj.visible == false)) {
			await interaction.reply({ content: core.template.cantSee(obj.alias || obj.name), flags: 64 });
		}
		else if (typeof obj.speakto == 'undefined') {
			const s = core.template.defaultSpeakTo(obj.alias || obj.name);
			if (typeof obj.userName != 'undefined') {
				await interaction.reply(`${pov.alias} speaks to ${obj.alias || obj.name}.`);
				await interaction.followUp({ content: s, flags: 64 });
			}
			else {
				await interaction.reply({ content: s, flags: 64 });
			}
		}
		else if (typeof obj.speakto == 'string') {
			await interaction.reply({ content:obj.speakto, flags: 64 });
		}
		else if (typeof obj.speakto.type !== 'undefined' && obj.speakto.type == 'script') {
			qgame.replyString = '';
			eval (obj.speakto.attr);
			await interaction.reply({ content: qgame.replyString, flags: 64 });
		}
		else {
			const s = core.template.defaultSpeakTo(obj.alias || obj.name);
			await interaction.reply({ content: s, flags: 64 });
		}
	},
};