const { SlashCommandBuilder } = require('discord.js');
// const fs = require('fs');
const q = require('../../engine/q');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('attack')
		.setDescription('Attack something (or someone)!')
		.addStringOption(option =>
			option.setName('target')
				.setDescription('The target you wish to attack')
				.setRequired(true)),
	async execute(interaction) {
		const object = interaction.options.getString('target');
		if (typeof object == 'undefined') {
			await q.msg('\'object\' not defined.');
			return;
		}
		if (typeof q.GetObject(object) == 'undefined') {
			await q.msg('No such object ("' + object + '")!');
			return;
		}
		const obj = q.GetObject(object);
		if (!q.inScope(obj)) {
			await q.msg(q.template.cantSee(q.GetDisplayName(obj, false, false, true)));
			return;
		}
		pov.lastObject[obj.objectPronoun] = obj.name;
		if (typeof obj.attack == 'undefined') {
			await q.msg(q.template.defaultAttack(q.GetDisplayName(obj, true, false, true)));
			await q.saveGame('./game.json', qgame);
			return;
		}
		const { type, attr } = q.getAttribute(obj, 'attack');
		if (!type) {
			await q.msg(q.template.defaultAttack(q.GetDisplayName(obj, true, false, true)));
			await q.saveGame('./game.json', qgame);
			return;
		}
		if (attr === false) {
			await q.msg(q.template.defaultAttack(q.GetDisplayName(obj, true, false, true)));
			await q.saveGame('./game.json', qgame);
			return;
		}
		await q.msg(`${q.GetDisplayName(pov)} has attacked ${q.GetDisplayName(obj, true, false, true)}!`, false, false);
		if (type == 'string') {
			await q.msg(attr, true, true);
		}
		else if (type == 'script') {
			// eslint-disable-next-line prefer-const
			let responded = false;
			await eval (obj.attack.attr);
			if (!responded) {
				await q.msg(q.template.defaultAttack(q.GetDisplayName(obj, true, false, true)));
			}
		}
		else {
			const s = q.template.defaultAttack(q.GetDisplayName(obj, true, false, true));
			await q.msg(s);
		}
		await q.saveGame('./game.json', qgame);
	},
};
