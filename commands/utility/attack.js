const { SlashCommandBuilder } = require('discord.js');
// const fs = require('fs');
const core = require('../../engine/core');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('attack')
		.setDescription('Attack something (or someone)!')
		.addStringOption(option =>
			option.setName('target')
				.setDescription('The target you wish to attack')),
	async execute(interaction) {
		const msg = async (s, isPrivate = false, isFollowUp = false) => {
			if (!isPrivate && !isFollowUp) {
				await interaction.reply(s);
			}
			else if (!isPrivate && isFollowUp) {
				// await interaction.user.send(s);
				await interaction.followUp(s);
			}
			else if (isPrivate && !isFollowUp) {
				await interaction.reply({ content: s, flags: 64 });
			}
			else {
				// await interaction.user.send({content: s, flags: 64});
				await interaction.followUp({ content: s, flags: 64 });
			}
		};
		const object = interaction.options.getString('target');
		if (typeof object == 'undefined') {
			await msg('\'' + object + '\' not defined.', true);
			return;
		}
		const qgame = await core.loadGame('./game.json', interaction);
		const povName = interaction.user.username;
		const objname = object;
		if (qgame.players.indexOf(povName) < 0) {
			await msg(core.template.mustStartGame, true);
			return 3;
		}
		if (typeof core.getObject(qgame, objname) == 'undefined') {
			await msg('No such object ("' + objname + '")!', true);
			return;
		}
		const obj = core.getObject(qgame, objname);
		// TODO - Check scope!
		if (typeof obj.attack == 'string') {
			await msg(`${povName} has attacked ${object}!`);
			await msg(obj.attack, true, true);
		}
		else if (typeof obj.attack == 'function') {
			await msg(obj.attack(), true);
		}
		else {
			const s = core.template.defaultAttack(objname);
			await msg(s, true);
		}
	},
};
