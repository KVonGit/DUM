const { SlashCommandBuilder } = require('discord.js');
// const fs = require('fs');
const q = require('../../engine/q');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('attack')
		.setDescription('Attack something (or someone)!')
		.addStringOption(option =>
			option.setName('target')
				.setDescription('The target you wish to attack')),
	async execute(interaction) {
		const object = interaction.options.getString('target');
		if (typeof object == 'undefined') {
			await q.msg('\'' + object + '\' not defined.');
			return;
		}
		const qgame = await q.loadGame('./game.json', interaction);
		const povName = interaction.user.username;
		if (Object.keys(qgame.players).indexOf(povName) < 0) {
			await q.msg(q.template.mustStartGame);
			return 3;
		}
		const pov = qgame.players[povName];
		if (typeof q.getObject(qgame, object) == 'undefined') {
			await q.msg('No such object ("' + object + '")!');
			return;
		}
		const obj = q.getObject(qgame, object);
		// TODO - Check scope!
		if (typeof obj.attack == 'undefined') {
			await q.msg(q.template.defaultAttack(obj.alias || object));
		}
		else if (typeof obj.attack.type == 'undefined') {
			await q.msg(q.template.defaultAttack(obj.alias || object));
		}
		else if (obj.attack.type == 'string') {
			await q.msg(`${pov.alias} has attacked ${q.GetDisplayName(obj)}!`, false, false);
			await q.msg(obj.attack.attr, true, true);
		}
		else if (obj.attack.type == 'script') {
			// eslint-disable-next-line prefer-const
			let responded = false;
			eval (obj.attack.attr);
			if (!responded) {
				await q.msg(q.template.defaultAttack(obj.alias || object));
			}
		}
		else {
			const s = q.template.defaultAttack(obj.alias || object);
			await q.msg(s);
		}
	},
};
