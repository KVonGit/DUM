const { SlashCommandBuilder } = require('discord.js');
const core = require('../../engine/core');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('take')
		.setDescription('Take something')
		.addStringOption(option =>
			option.setName('object')
				.setDescription('The object you wish to take')),
	async execute(interaction) {
		// core.privateMessage(interaction, 'PING!');
		const object = interaction.options.getString('object');
		if (typeof object == 'undefined') {
			console.error('\'' + object + '\' not defined.');
			await interaction.reply({ content: '\'' + object + '\' not defined.', flags: 64 });
			return;
		}
		const qgame = await core.loadGame('./game.json', interaction);
		const pov = qgame.players[interaction.user.username];
		const obj = core.getObject(qgame, object);
		if (typeof obj == 'undefined') {
			console.error('No such object ("' + object + '")!');
			await interaction.reply({ content: 'No such object ("' + object + '")!', flags: 64 });
			return;
		}
		// console.log('obj:', obj);
		// console.log('pov:', pov);
		// TODO - Check the object loc first!
		if (obj.loc == pov.name) {
			await interaction.reply({ content: core.template.alreadyHave(obj.name), flags: 64 });
			return 0;
		}
		else if (obj.loc != pov.loc) {
			// It's not in the same location as the player
			// is it in or on something, or does a player have it?
			const holder = qgame.locations[obj.loc] || qgame.objects[obj.loc] || qgame.players[obj.loc];
			console.log('holder:', holder);
			if (typeof holder.loc != 'undefined') {
				if (holder.loc == pov.loc) {
					// another player has it, or it's in or on something
					if (typeof holder.inherit != 'undefined') {
						// it's a surface or container
						if (holder.type.indexOf('surface') >= 0) {
							// able to take, just let things roll
						}
						else if (holder.type == 'container') {
							// is it closed?
							if (holder.closed) {
								if (holder.transparent) {
									// TODO - you can't it's closed
								}
								else {
									// TODO - can't see that!
								}
							}
							// if it's not closed, just let things roll
						}
						else {
							// TODO - error!
						}
					}
					else {
						// probably another player
						const s = `${holder.alias} probably wouldn't like that.`;
						await interaction.reply({ content: s, flags: 64 });
						return 0;
					}
				}
			}
			await interaction.reply({ content: core.template.cantSee(obj.name), flags: 64 });
			return 0;
		}
		// console.log(obj.name + ' is in the same location as the player.');
		let qtook = false;
		if (typeof obj.takescript != 'undefined') {
			eval(obj.takescript);
			if (qtook) {
				obj.loc = pov.name;
			};
		}
		if (typeof obj.take == 'undefined' || typeof obj.take.type == 'undefined') {
			// definitely not
			await interaction.reply({ content: core.template.cantTake(obj.name), flags: 64 });
			return;
		}
		if (!qtook) {
			switch (obj.take.type) {
			case 'undefined':
			// definitely not
				await interaction.reply({ content: core.template.cantTake(obj.name), flags: 64 });
				break;
			case 'string':
			// nope
				await interaction.reply({ content: obj.take.attr, flags: 64 });
				break;
			case 'boolean':
				if (obj.take.attr) {
				// get it!
					qtook = true;
					obj.loc = pov.name;
				}
				else {
				// can't get it!
					await interaction.reply({ content: core.template.cantTake(obj.name), flags: 64 });
				}
				break;
			case 'script':
			// call function
				eval(obj.take.attr);
				// console.log('qtook:', qtook);
				qtook = (obj.loc == pov.name);
				// console.log('qtook:', qtook);
				break;
			}
		}
		if (qtook) {
			// tell everybody!
			await interaction.reply(`${pov.alias} took ${object}.`);
			// TODO - need to return something if take is a function, to know if it printed something!
			await interaction.followUp({ content: core.template.taken, flags: 64 });
			try {
				await core.saveGame('./game.json', qgame);
			}
			catch (err) {
				console.error('Error saving game data:', err);
				await interaction.followUp({ content: 'Failed to save game data.', flags: 64 });
			}
		}
		else {
			return 0;
		}
	},
};