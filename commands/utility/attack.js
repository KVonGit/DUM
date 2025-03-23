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
		if (Object.keys(qgame.players).indexOf(povName) < 0) {
			await msg(core.template.mustStartGame, true);
			return 3;
		}
		const pov = qgame.players[povName];
		if (typeof core.getObject(qgame, object) == 'undefined') {
			await msg('No such object ("' + object + '")!', true);
			return;
		}
		const obj = core.getObject(qgame, object);
		// TODO - Check scope!
		if (typeof obj.attack == 'undefined') {
			await msg(core.template.defaultAttack(obj.alias || object), true);
		}
		else if (typeof obj.attack.type == 'undefined') {
			await msg(core.template.defaultAttack(obj.alias || object), true);
		}
		else if (obj.attack.type == 'string') {
			await msg(`${pov.alias} has attacked ${obj.alias || object}!`);
			await msg(obj.attack.attr, true, true);
		}
		else if (obj.attack.type == 'script') {
			// eslint-disable-next-line prefer-const
			let responded = false;
			eval (obj.attack.attr);
			if (!responded) {
				await msg(core.template.defaultAttack(obj.alias || object), true);
			}
		}
		else {
			const s = core.template.defaultAttack(obj.alias || object);
			await msg(s, true);
		}
	},
};
