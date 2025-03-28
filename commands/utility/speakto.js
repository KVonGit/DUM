const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');
// const warned = {};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('speakto')
		.setDescription('Speak to someone (or something?)')
		.addStringOption(option =>
			option.setName('npc')
				.setDescription('The npc with which you wish to speak')
				.setRequired(true)),
	async execute(interaction) {
		const npc = interaction.options.getString('npc');
		if (typeof npc == 'undefined') {
			await q.msg('\'' + npc + '\' not defined.');
			return;
		}
		if (Object.keys(qgame.players).indexOf(pov.name) < 0) {
			await q.msg(q.template.mustStartGame);
			return 3;
		}
		const obj = q.getObject(qgame, npc);;
		if (obj == 'undefined') {
			await q.msg('No such object ("' + npc + '")!');
			return;
		}
		if (obj.loc != pov.loc || (typeof obj.visible != 'undefined' && obj.visible == false)) {
			await q.msg(q.template.cantSee(obj.alias || obj.name));
		}
		else if (typeof obj.speakto == 'undefined') {
			const s = q.template.defaultSpeakTo(obj.alias || obj.name);
			if (typeof obj.userName != 'undefined') {
				await q.msg(`${pov.alias} speaks to ${obj.alias || obj.name}.`, false, false);
				await q.msg(s, true, true);
			}
			else {
				await q.msg(s);
			}
		}
		else if (typeof obj.speakto == 'string') {
			await q.msg(`${pov.alias} speaks to ${obj.alias || obj.name}.`, false, false);
			await q.msg(obj.speakto, true, true);
		}
		else if (typeof obj.speakto.type !== 'undefined') {
			if (obj.speakto.type == 'string') {
				await q.msg(`${pov.alias} speaks to ${obj.alias || obj.name}.`, false, false);
				await q.msg(obj.speakto.attr);
			}
			else if (obj.speakto.type == 'script') {
				// console.log('speakto script:', obj.speakto.attr);
				try {
					await q.msg(`${pov.alias} speaks to ${obj.alias || obj.name}.`, false, false);
					// eslint-disable-next-line prefer-const
					let replyString = '';
				    await eval (obj.speakto.attr);
					await q.msg(replyString || q.template.defaultSpeakTo(obj.alias || obj.name));
				}
				catch {
				  console.error('Error in ' + obj.name + ' speakto script.');
				  await q.msg('Error in speakto script.');
				}
			}
			else {
				await q.msg(`${pov.alias} speaks to ${obj.alias || obj.name}.`, false, false);
				const s = q.template.defaultSpeakTo(obj.alias || obj.name);
				await q.msg(s);
			}
		}
		else {
			await q.msg(`${pov.alias} speaks to ${obj.alias || obj.name}.`, false, false);
			const s = q.template.defaultSpeakTo(obj.alias || obj.name);
			await q.msg(s);
		}
		await q.saveGame('./game.json', qgame);
	},
};