const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('take')
		.setDescription('Take something')
		.addStringOption(option =>
			option.setName('object')
				.setDescription('The object you wish to take')),
	async execute(interaction) {
		// q.privateMessage(interaction, 'PING!');
		const object = interaction.options.getString('object');
		if (typeof object == 'undefined') {
			console.error('\'' + object + '\' not defined.');
			await interaction.reply({ content: '\'' + object + '\' not defined.', flags: 64 });
			return;
		}
		const qgame = await q.loadGame('./game.json', interaction);
		const pov = qgame.players[interaction.user.username];
		const obj = q.getObject(qgame, object);
		if (typeof obj == 'undefined') {
			console.error('No such object ("' + object + '")!');
			await interaction.reply({ content: 'No such object ("' + object + '")!', flags: 64 });
			return;
		}
		// console.log('obj:', obj);
		// console.log('pov:', pov);
		// TODO - Check the object loc first!
		let qtook = false;
		let inScope = false;
		if (obj.loc == pov.name) {
			await interaction.reply({ content: q.template.alreadyHave(obj.name), flags: 64 });
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
						if (holder.inherit.indexOf('surface') >= 0) {
							// able to take, just let things roll
							inScope = true;
						}
						else if (holder.inherit.indexOf('container') >= 0) {
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
					else if (typeof holder.userName != 'undefined') {
						// another player
						const s = `${holder.alias || holder.name} probably wouldn't like that.`;
						await interaction.reply({ content: s, flags: 64 });
						return 0;
					}
					else {
						await interaction.reply({ content: q.template.cantSee(obj.name), flags: 64 });
						return 0;
					}
				}
			}
			else {
				await interaction.reply({ content: q.template.cantSee(obj.name), flags: 64 });
				return 0;
			}
		}
		// console.log(obj.name + ' is in the same location as the player.');

		if (typeof obj.takescript != 'undefined') {
			eval(obj.takescript);
			if (obj.loc == pov.name) {
				qtook = true;
			}
		}
		if (typeof obj.take == 'undefined') {
			// definitely not
			s = q.template.cantTake(obj.name);
			if (typeof obj.takemsg != 'undefined') {
				s = obj.takemsg;
			}
			await q.msg(s);
			return;
		}
		else if (obj.take == true) {
			obj.loc = pov.name;
			qtook = true;
		}
		if (!qtook && typeof obj.take.type == 'undefined') {
			s = q.template.cantTake(obj.name);
			if (typeof obj.takemsg != 'undefined') {
				s = obj.takemsg;
			}
			await q.msg(s);
			return;
		}
		if (!qtook && inScope) {
			switch (obj.take.type) {
			case 'undefined':
			// definitely not
				s = q.template.cantTake(obj.name);
				if (typeof obj.takemsg != 'undefined') {
					s = obj.takemsg;
				}
				await q.msg(s);
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
					let s = q.template.cantTake(obj.name);
					if (typeof obj.takemsg != 'undefined') {
						s = obj.takemsg;
					}
					await q.msg(s);
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
		if (!qtook && obj.take == true) qtook = true;
		if (qtook) {
			// tell everybody!
			await interaction.reply(`${pov.alias} took ${object}.`);
			// Use takemsg prop when it exists, to print custom response.
			let s = q.template.taken;
			if (typeof obj.takemsg != 'undefined') {
				s = obj.takemsg;
			}
			await interaction.followUp({ content: s, flags: 64 });
			try {
				await q.saveGame('./game.json', qgame);
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