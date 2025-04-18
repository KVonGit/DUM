const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('open')
		.setDescription('Open something')
		.addStringOption(option =>
			option.setName('object')
				.setDescription('The object you wish to open')
				.setRequired(true)),
	async execute(interaction) {
		const object = interaction.options.getString('object');
		if (!object) {
			await q.msg('\'object\' not defined.');
			return;
		}
		const obj = q.GetObject(object);
		// Check if the object exists
		if (!obj) {
			await q.msg(`No such object ("${object}")!`);
			return;
		}

		// Check if the object is visible to the player
		if (!q.inScope(obj)) {
			await q.msg(q.template.cantSee(q.GetDisplayName(obj, false, false, true)));
			return;
		}
		pov.lastObject[obj.objectPronoun] = obj.name;
		// Check if the object is already open
		if (obj.isOpen === true) {
			await q.msg(q.template.alreadyOpen(q.GetDisplayName(obj, true, false, true)));
			await q.saveGame('./game.json', qgame);
			return;
		}

		// Handle objects that can be opened
		if (obj.open === true || (obj.inherit && obj.inherit.indexOf('openable') >= 0 && typeof obj.open === 'undefined')) {
			obj.isOpen = true;

			// Send the appropriate open message
			if (typeof obj.openMsg === 'string') {
				await q.msg(obj.openMsg);
			}
			else {
				await q.msg(q.template.defaultOpen(q.GetDisplayName(obj, true, false, true)));
			}

			// Send any follow-up messages
			if (typeof obj.afterOpeningMsg === 'string') {
				await q.msg(obj.afterOpeningMsg);
			}

			// Execute any scripts after opening
			if (obj.afterOpening) {
				try {
					await eval(obj.afterOpening);
				}
				catch (err) {
					console.error(`Error in ${obj.name} afterOpening script:`, err);
					await q.msg('Error in afterOpening script.');
				}
			}

			// List children if applicable
			if (obj.listChildren) {
				const children = q.GetDirectChildren(obj);
				if (children.length > 0) {
					let n = obj.inherit.indexOf('surface') >= 0 ? 'On ' : 'In ';
					n += q.GetDisplayName(obj, true, false, true).replace(/^a /, 'the ') + ', you see ';
					if (typeof obj.listchildrenprefix === 'string') {
						n = obj.listchildrenprefix;
					}
					n += q.GetDirectChildrenAsString(obj);
					await q.msg(n, true, true);
				}
			}

			// Save the game state
			try {
			}
			catch (err) {
				console.error('Error saving game data:', err);
				await q.msg('Failed to save game data.');
			}
			return;
		}
		if (typeof obj.open.type != 'undefined') {
			if (obj.open.type == 'string') {
				await q.msg(obj.open.attr);
			}
			else if (obj.open.type == 'script') {
				const replyString = '';
				await eval(obj.open.attr);
				await q.msg(replyString || 'No replyString sent from open script.');
			}
			else {
				await q.msg(q.template.defaultOpen(q.GetDisplayName(obj, true, false, true)));
			}
			return;
		}

		// If the object cannot be opened
		await q.msg(q.template.cantOpenOrClose(q.GetDisplayName(obj, true, false, true)));
	},
};