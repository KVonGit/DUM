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
	aliases: ['get'],
	async execute(interaction) {
		const objectName = interaction.options.getString('object');
		if (!objectName) {
			await q.msg('\'object\' not defined.');
			return;
		}

		const obj = q.GetObject(objectName);

		if (!obj) {
			await q.msg(`No such object ("${objectName}")!`);
			return;
		}

		pov.lastObject[obj.objectPronoun] = obj.name;
		if (obj.loc === pov.name) {
			await q.msg(q.template.alreadyHave(q.GetDisplayName(obj, true, false, true)));
			return;
		}

		if (!q.inScope(obj)) {
			// console.log('take: inScope is false', obj.loc);
			await q.msg(q.template.cantSee(q.GetDisplayName(obj, false, false, true)));
			return;
		}
		
		let wasTaken = false;

		const { type, attr } = q.getAttribute(obj, 'take');
		// console.log('type:', type);
		// console.log('attr:', attr);
		if (typeof type === 'undefined') {
			 // console.log('take: type is undefined');
			await q.msg(obj.takemsg || q.template.cantTake(q.GetDisplayName(obj, true, false, true)));
			return;
		}
		if (type === 'boolean') {
			if (attr) {
				obj.loc = pov.name;
				wasTaken = true;
			}
			else {
				await q.msg(q.template.cantTake(q.GetDisplayName(obj, true, false, true)));
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
			if (obj.loc === pov.name) {
				await q.msg(q.GetDisplayName(pov) + ' took ' + q.GetDisplayName(obj, true, false, true) + '.', false, false);
			}
			await q.msg(replyString || q.template.cantTake(q.GetDisplayName(obj, true, false, true)), true, true);
			return;
		}
		else {
			await q.msg(q.template.cantTake(q.GetDisplayName(obj, true, false, true)));
			return;
		}

		// Handle successful take
		if (wasTaken && !interaction.replied) {
			// console.log('take: wasTaken and !interaction.replied');
			await q.msg(`${q.GetDisplayName(pov)} took ${q.GetDisplayName(obj, true, false, true)}.`, false, false);
			const successMessage = obj.takemsg || q.template.taken;
			await q.msg(successMessage);
			try {
			}
			catch (err) {
				console.error('Error saving game data:', err);
				await q.msg('Failed to save game data.');
			}
		}
	},
};