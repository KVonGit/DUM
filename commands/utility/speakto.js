const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');
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
		const qgame = await q.loadGame('./game.json', interaction);
		const povName = interaction.user.username;
		const pov = qgame.players[povName];
		if (Object.keys(qgame.players).indexOf(povName) < 0) {
			await interaction.reply({ content: q.template.mustStartGame, flags: 64 });
			return 3;
		}
		const obj = q.getObject(qgame, npc);;
		if (obj == 'undefined') {
			await interaction.reply({ content: 'No such object ("' + npc + '")!', flags: 64 });
			return;
		}
		// TODO - Check scope!
		if (obj.loc != pov.loc || (typeof obj.visible != 'undefined' && obj.visible == false)) {
			await interaction.reply({ content: q.template.cantSee(obj.alias || obj.name), flags: 64 });
		}
		else if (typeof obj.speakto == 'undefined') {
			const s = q.template.defaultSpeakTo(obj.alias || obj.name);
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
		else if (typeof obj.speakto.type !== 'undefined') {
			if (typeof obj.speakto.type == 'string') {
				await interaction.reply({ content:obj.speakto.attr, flags: 64 });
			}
			else if (obj.speakto.type == 'script') {
				qgame.replyString = '';
				eval (obj.speakto.attr);
				await interaction.reply({ content: qgame.replyString, flags: 64 });
			}
			else {
				const s = q.template.defaultSpeakTo(obj.alias || obj.name);
				await interaction.reply({ content: s, flags: 64 });
			}
		}
		else {
			const s = q.template.defaultSpeakTo(obj.alias || obj.name);
			await interaction.reply({ content: s, flags: 64 });
		}
	},
};