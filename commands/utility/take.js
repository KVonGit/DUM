const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('take')
		.setDescription('Take something')
		.addStringOption(option =>
			option.setName('object')
				.setDescription('The object you wish to take')
				.setRequired(true)),
	async execute(interaction) {
		const { qgame, pov } = await q.getGamePov();
		if (!pov) return;
		const objectName = interaction.options.getString('object');
		if (!objectName) {
			await q.msg('\'object\' not defined.');
			return;
		}

		const obj = q.getObject(qgame, objectName);

		if (!obj) {
			await q.msg(`No such object ("${objectName}")!`);
			return;
		}

		if (obj.loc === pov.name) {
			await q.msg(q.template.alreadyHave(obj.name));
			return;
		}

		if (!q.inScope(obj)) {
			await q.msg(q.template.cantSee(obj.name));
			return;
		}

		let wasTaken = false;

		const { type, attr } = q.getAttribute(obj, 'take');
		// console.log('type:', type);
		// console.log('attr:', attr);
		if (!type) {
			// console.log('take: type is undefined');
			await q.msg(obj.takemsg || q.template.cantTake(q.GetDisplayName(obj)));
			return;
		}
		if (type === 'boolean') {
			if (attr) {
				obj.loc = pov.name;
				wasTaken = true;
			}
			else {
				await q.msg(q.template.cantTake(q.GetDisplayName(obj)));
				return;
			}
		}
		else if (type === 'string') {
			await q.msg(attr);
			return;
		}
		else if (type === 'script') {
			// eslint-disable-next-line prefer-const
			let replyString = '';
			await eval(attr);
			await q.msg(replyString || q.template.cantTake(q.GetDisplayName(obj)));
			return;
		}
		else {
			await q.msg(q.template.cantTake(q.GetDisplayName(obj)));
			return;
		}

		// Handle successful take
		if (wasTaken && !interaction.replied) {
			// console.log('take: wasTaken and !interaction.replied');
			await q.msg(`${pov.alias} took ${q.GetDisplayName(obj)}.`, false, false);
			const successMessage = obj.takemsg || q.template.taken;
			await q.msg(successMessage);

			try {
				await q.saveGame('./game.json', qgame);
			}
			catch (err) {
				console.error('Error saving game data:', err);
				await q.msg('Failed to save game data.');
			}
		}
	},
};