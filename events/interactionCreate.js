const q = require('../engine/q');

module.exports.interactionHandler = async (interaction) => {
	const { guild, member } = interaction;
	
	// For dropdown menu
	if (interaction.isStringSelectMenu() && interaction.customId === 'class-selector') {
		// Remove all class roles first
		const classRoles = ['Adventurer', 'Guardian', 'Magic wielder'];
		for (const roleName of classRoles) {
			const role = guild.roles.cache.find(r => r.name === roleName);
			if (role && member.roles.cache.has(role.id)) {
				await member.roles.remove(role);
			}
		}
		
		// Add the selected role
		if (interaction.values.length > 0) {
			const selectedRole = guild.roles.cache.find(r => r.name === interaction.values[0]);
			if (selectedRole) {
				await member.roles.add(selectedRole);
				await interaction.reply({ 
					content: `You have chosen: ${interaction.values[0]}!`, 
					flags: 64 
				});
			}
		} else {
			await interaction.reply({ 
				content: `You have removed your class role.`, 
				flags: 64 
			});
		}
	}
	
	// For buttons
	if (interaction.isButton() && interaction.customId.startsWith('role-')) {
		const roleName = interaction.customId === 'role-adventurer' ? 'Adventurer' :
						interaction.customId === 'role-guardian' ? 'Guardian' :
						interaction.customId === 'role-mage' ? 'Magic wielder' : null;
		
		if (!roleName) return;
		
		const role = guild.roles.cache.find(r => r.name === roleName);
		const hasRole = member.roles.cache.has(role.id);
		
		if (hasRole) {
			await member.roles.remove(role);
			await interaction.reply({ 
				content: `You are no longer a ${roleName}.`, 
				flags: 64 
			});
		} else {
			// Remove other class roles first
			const classRoles = ['Adventurer', 'Guardian', 'Magic wielder'];
			for (const r of classRoles) {
				const classRole = guild.roles.cache.find(role => role.name === r);
				if (classRole && member.roles.cache.has(classRole.id)) {
					await member.roles.remove(classRole);
				}
			}
			
			await member.roles.add(role);
			await interaction.reply({ 
				content: `You have chosen: ${roleName}!`, 
				flags: 64 
			});
		}
	}
	
	// For terms agreement button
	if (interaction.isButton() && interaction.customId === 'agree-terms') {
		const { guild, member } = interaction;
		const role = guild.roles.cache.find(r => r.name === 'Player');
		
		if (role && !member.roles.cache.has(role.id)) {
			await member.roles.add(role);
			await interaction.reply({ 
				content: 'Thank you for agreeing to the terms! You now have access to the game channels.', 
				flags: 64 
			});
			console.log(`Added Player role to ${member.user.tag}`);
		} else if (role && member.roles.cache.has(role.id)) {
			await interaction.reply({ 
				content: 'You have already agreed to the terms and have access to the game channels.', 
				flags: 64 
			});
		} else {
			await interaction.reply({ 
				content: 'There was an error assigning the Player role. Please contact an administrator.', 
				flags: 64 
			});
		}
	}
	
	// console.log('interaction', interaction);
	if (!interaction.isChatInputCommand()) return;
	// console.log(interaction);
	if (interaction.channelId != '1352673869013586023') {
		await interaction.reply({ content: 'Please use this command in the [#game](https://discord.com/channels/1352673867948101743/1352673869013586023) channel.', flags: 64 });
		return;
	}

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}
	try {
		global.interaction = interaction;
		global.gameResponseForTranscript = [];
		if (interaction.commandName == 'startgame') {
			await command.execute(interaction);
			return;
		}
		// This is where it loads the game data from disk
		// TODO: Changing this to loade the game once when the bot starts up
		const { qgame, pov } = await q.getGamePov();
		if (!pov) return;
		global.qgame = qgame;
		global.pov = pov;
		await command.execute(interaction);
		if (interaction.commandName != 'revive' && interaction.commandName != 'emote') await q.addThisCommandToTranscriptAsEmbed(interaction);
		// await q.addThisCommandToTranscriptAsEmbed(interaction);
		if (interaction.commandName != 'quitgame' && typeof qgame != 'undefined' && typeof pov != 'undefined' && qgame.suppressTurnScripts !== false) await require('./engine/q').runTurnScripts();
	}
	catch (error) {
		// Get user and command details for better error logging
		const username = interaction.user.username;
		const commandName = interaction.commandName;
		const options = interaction.options.data.map(opt => `${opt.name}:${opt.value}`).join(', ');

		console.error(`Error [${new Date().toLocaleString()}] for user "${username}": /${commandName} ${options}`);
		console.error(error);

		const errorMessage = 'There was an error while executing this command!';

		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: errorMessage, flags: 64 });
		}
		else {
			await interaction.reply({ content: errorMessage, flags: 64 });
		}
	}
};