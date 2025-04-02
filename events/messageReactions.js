

// Map of emoji to role names
let roleMap = {
	'🤼': 'Adventurer',
	'🤺': 'Guardian',
	'🧙': 'Magic wielder',
};

const TARGET_MESSAGE_ID = '1353954120402210827';

module.exports.onMessageReactionAdd = async (reaction, user) => {
	if (user.bot) return;
	if (reaction.message.id === TARGET_MESSAGE_ID) {
		const roleName = roleMap[reaction.emoji.name];
		if (!roleName) return;

		const guild = reaction.message.guild;
		const member = await guild.members.fetch(user.id);
		const role = guild.roles.cache.find(r => r.name === roleName);

		if (role && member) {
			await member.roles.add(role);
			console.log(`Added role ${roleName} to ${user.tag}`);
		}
	}
	else if (reaction.message.id === '1353949535172300892') {
	// Agreeing to terms assigns the "Player" role to the user, which unlocks the #game channel
		roleMap = {
			'✅': 'Player',
		};
		if (user.bot) return;

		const roleName = roleMap[reaction.emoji.name];
		if (!roleName) return;
		const guild = reaction.message.guild;
		const member = await guild.members.fetch(user.id);
		const role = guild.roles.cache.find(r => r.name === 'Player');
		if (role && member) {
			await member.roles.add(role);
			console.log(`Added role ${roleName} to ${user.tag}`);
		}
	}
	else {
		return;
	}
};

module.exports.onMessageReactionRemove = async (reaction, user) => {
	if (reaction.message.id === TARGET_MESSAGE_ID) {
		if (user.bot) return;

		const roleName = roleMap[reaction.emoji.name];
		if (!roleName) return;

		const guild = reaction.message.guild;
		const member = await guild.members.fetch(user.id);
		const role = guild.roles.cache.find(r => r.name === roleName);

		if (role && member) {
			await member.roles.remove(role);
			console.log(`Removed role ${roleName} from ${user.tag}`);
		}
	}
	else if (reaction.message.id === '1353949535172300892') {
	// Agreeing to terms assigns the "Player" role to the user, which unlocks the #game channel
		roleMap = {
			'✅': 'Player',
		};
		if (user.bot) return;

		const roleName = roleMap[reaction.emoji.name];
		if (!roleName) return;
		const guild = reaction.message.guild;
		const member = await guild.members.fetch(user.id);
		const role = guild.roles.cache.find(r => r.name === 'Player');
		if (role && member) {
			await member.roles.remove(role);
			console.log(`Removed role ${roleName} from ${user.tag}`);
		}
	}
	else {
		return;
	}
};