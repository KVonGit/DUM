const fs = require('fs');
/* eslint-disable no-useless-escape */
module.exports.log = console.log;

module.exports.template = {
	'mustStartGame':'You must `/startgame` before you can play.',
	'alreadyPlaying':'You are already playing the game.',
	'notPlaying':'You are not playing the game.',
	'defaultLook':'Nothing out of the ordinary.',
	'taken':'Taken.',
	'dropped':'Dropped.',
	'cantGo':(exit) => {return `You can't go ${exit}!`;},
	'cantSee':(object) => {return `You can't see anything called '${object}' here!`;},
	'dontHave':(object) => {return `You don't have ${object}!`;},
	'alreadyHave':(object) => {return `You already have ${object}!`;},
	'cantTake':(object) => {return `You can't take ${object}!`;},
	'cantDrop':(object) => {return `You can't drop ${object}`;},
	'defaultAttack':(object) => {return 'Luckily for ' + object + ' (or luckily for you, depending on how that would have gone), violence is against the Discord server rules.';},
	'xyzzy':'Surprisingly, nothing happens.',
	'defaultSpeakTo':(object) => {return 'You speak to ' + object + '.';},
	'oops':'There is nothing to correct.',
	'noUndo':'You can\'t use UNDO in a multiplayer game.',
	'noSave':'You can\'t save in a multiplayer game.',
	'containerClosed':(object) => {return `${object.capFirst()} is closed.`;},
	'defaultOpen':(object) => {return `You open ${object}.`;},
	'alreadyOpen':(object) => {return `${object.capFirst()} is already open.`;},
	'defaultClose':(object) => {return `You close ${object}.`;},
	'alreadyClosed':(object) => {return `${object.capFirst()} is already closed.`;},
	'cantOpenOrClose':(object) => {return `${object.capFirst()}: not openable or closeable.`;},
	'alreadyOn':(object) => {return `${object.capFirst()} is already on.`;},
	'alreadyOff':(object) => {return `${object.capFirst()} is already off.`;},
	'cantSwitch':(object) => {return `You can't switch ${object} on or off.`;},
};

module.exports.loadGame = async (filePath = './game.json') => {
	return new Promise((resolve, reject) => {
		fs.readFile(filePath, 'utf8', async function(err, data) {
			if (err) {
				await interaction.reply({ content: 'Error!', flags: 64 });
				return reject(err);
			}
			if (typeof data === 'undefined' || data.trim() === '') {
				return reject(new Error('Game data is empty or undefined.'));
			}
			try {
				const qgame = JSON.parse(data).aslj;
				global.qgame = qgame;
				resolve(qgame);
			}
			catch (parseError) {
				await interaction.reply({ content: 'Failed to parse game data.', flags: 64 });
				reject(parseError);
			}
		});
	});
};

module.exports.saveGame = async (filePath = './game.json', qgame = qgame) => {
	return new Promise((resolve, reject) => {
		fs.writeFile(filePath, JSON.stringify({ aslj: qgame }, null, 4), function(err) {
			if (err) {
				console.error('Error saving game data:', err);
				return reject(err);
			}
			console.log('Game data saved!');
			resolve();
		});
	});
};

module.exports.AllObjects = () => {
	return Object.keys(qgame.objects);
};

module.exports.AllLocations = () => {
	return Object.keys(qgame.locations);
};

module.exports.AllPlayers = () => {
	return Object.keys(qgame.players);
};

module.exports.All = () => {
	return this.ListCombine(this.ListCombine(this.AllObjects(), this.AllPlayers()), this.AllLocations());
};

module.exports.GetObject = (objName) => {
	for (const key of Object.keys(qgame.objects)) {
		// console.log('key:', key);
		const obj = qgame.objects[key];
		// console.log('obj:', obj);
		objName = objName.toLowerCase().trim();
		if (obj.name.toLowerCase() === objName || (typeof obj.alias != 'undefined' && obj.alias.toLowerCase() === objName)) {
			return obj;
		}
		if (typeof obj.alt != 'undefined') {
			for (const alt of obj.alt) {
				if (alt.toLowerCase() === objName) {
					return obj;
				}
			}
		}
	}
	// Search for players by name or alias

	for (const playerName of Object.keys(qgame.players)) {
		const player = qgame.players[playerName];
		if (player.name.toLowerCase() === objName || player.alias.toLowerCase() === objName) {
			return player;
		}
		if (player.alt) {
			for (const alt of player.alt) {
				if (alt.toLowerCase() === objName) {
					return player;
				}
			}
		}
	}

	// If not found, return undefined
	return undefined;
};

module.exports.msg = async (s, isPrivate = true, isFollowUp = false) => {
	// console.log('msg:', s);
	if (!isPrivate && !isFollowUp) {
		console.log('msg: not private or follow up');
		await interaction.reply(s);
	}
	else if (!isPrivate && isFollowUp) {
		console.log('msg: not private but is follow up');
		// await interaction.user.send(s);
		await interaction.followUp(s);
	}
	else if (isPrivate && !isFollowUp) {
		console.log('msg: private but not follow up');
		await interaction.reply({ content: s, flags: 64 });
	}
	else {
		// await interaction.user.send({content: s, flags: 64});
		console.log('msg: private follow up');
		await interaction.followUp({ content: s, flags: 64 });
	}
};

module.exports.sendDM = async (s) => {
	await interaction.user.send(s);
};

module.exports.getInventory = (qgame, pov) => {
	const inv = [];
	for (const element in qgame.objects) {
		const obj = qgame.objects[element];
		if (obj.loc == pov.name) {
			inv.push(obj.name);
		}
	}
	return inv;
};

module.exports.getInventoryAsString = (qgame, pov) => {
	const inv = [];
	for (const element in qgame.objects) {
		const obj = qgame.objects[element];
		if (obj.loc == pov.name) {
			inv.push(obj.name);
		}
	}
	let s = 'You are carrying';
	if (inv.length > 0) {
		// list stuff
		inv.forEach(element => {
			s += ':\r\n\- ' + element;
		});
	}
	else {
		// nada
		s += ' nothing.';
	}
	return s;
};

module.exports.getLocationDescription = (qgame, pov) => {
	console.log('running getLocationDescription');
	const room = qgame.locations[pov.loc];
	if (typeof room == 'undefined') {
		return 'Location not found!';
	}
	let s = '### ' + this.GetDisplayName(room) + '\n';
	if (typeof room.description == 'function') {
		s += room.description();
	}
	else {
		s += room.description;
	}
	const inRoomObjects = [];
	Object.keys(qgame.objects).forEach(obj => {
		// console.log('obj:', obj);
		obj = qgame.objects[obj];
		if (obj.loc == pov.loc && !obj.scenery) {
			inRoomObjects.push(this.GetDisplayName(obj));
		}
	});
	Object.keys(qgame.players).forEach(obj => {
		// console.log('obj:', obj);
		obj = qgame.players[obj];
		if (obj.loc == pov.loc && obj.name != pov.name) {
			inRoomObjects.push('@' + this.GetDisplayName(obj));
		}
	});
	let inTheRoom = '';
	if (inRoomObjects.length > 0) {
		// list stuff
		inTheRoom += '\r\nYou can **see**:';
		inRoomObjects.forEach(element => {
			inTheRoom += '\r\n\- ' + element;
		});
	}
	s += inTheRoom;
	let exits = '';
	if (typeof room.exits != 'undefined' && Object.keys(room.exits).length > 0) {
		// list stuff
		exits += '\nYou can **go**:';
		Object.keys(room.exits).forEach(dir => {
			exits += '\n\- ' + dir;
		});
	}
	s = s + exits;
	return s;
};

module.exports.getObject = (qgame, objName) => {
	const regEx = /^(a|an|the)\s+/i;
	objName = objName.replace(regEx, '');
	for (const key of Object.keys(qgame.objects)) {
		// console.log('key:', key);
		const obj = qgame.objects[key];
		if (obj.prefix && objName.startsWith(obj.prefix.toLowerCase() + ' ')) {
			objName = objName.slice(obj.prefix.length).trim();
		}
		if (obj.suffix && objName.endsWith(' ' + obj.suffix.toLowerCase())) {
			objName = objName.slice(0, -obj.suffix.length).trim();
		}
		// console.log('obj:', obj);
		objName = objName.toLowerCase().trim();
		if (obj.name.toLowerCase() === objName || (typeof obj.alias != 'undefined' && obj.alias.toLowerCase() === objName)) {
			return obj;
		}
		if (typeof obj.alt != 'undefined') {
			for (const alt of obj.alt) {
				if (alt.toLowerCase() === objName) {
					return obj;
				}
			}
		}
	}
	// Search for players by name or alias

	for (const playerName of Object.keys(qgame.players)) {
		const player = qgame.players[playerName];
		if (player.name.toLowerCase() === objName || player.alias.toLowerCase() === objName) {
			return player;
		}
		if (player.alt) {
			for (const alt of player.alt) {
				if (alt.toLowerCase() === objName) {
					return player;
				}
			}
		}
	}

	// If not found, return undefined
	return undefined;
};

module.exports.allObjects = (qgame) => {
	return Object.keys(qgame.objects).map(key => qgame.objects[key]);
};

module.exports.allPlayers = (qgame) => {
	return Object.keys(qgame.players);
};

module.exports.AllPlayers = (qgame) => {
	return qgame.players;
};

module.exports.evalThis = (obj, scriptAttr) => {
	if (typeof obj[scriptAttr] === 'string') {
		eval(`(${obj[scriptAttr]})`).call(obj);
	}
};

module.exports.SendDM = async (s) => {
	await interaction.user.send(s);
};

module.exports.doGo = async (qgame, pov, loc, exitName, interaction) => {
	if (!loc.exits) {
		await interaction.reply({ content: 'There are no exits!', flags: 64 });
		return;
	}

	const synonyms = {
		'north': 'n',
		'south': 's',
		'east': 'e',
		'west': 'w',
		'northeast': 'ne',
		'northwest': 'nw',
		'southeast': 'se',
		'southwest': 'sw',
		'up': 'u',
		'down': 'd',
	};

	for (const key in synonyms) {
		if (synonyms[key] === exitName) {
			exitName = key;
		}
	}

	const exit = loc.exits[exitName];
	if (!exit) {
		await interaction.reply({ content: this.template.cantGo(exitName), flags: 64 });
		return;
	}

	if (exit.locked) {
		await interaction.reply({ content: this.template.lockedExit(exitName), flags: 64 });
		return;
	}
	if (typeof exit.visible != 'undefined' && exit.visible === false) {
		await interaction.reply({ content: this.template.cantGo(exitName), flags: 64 });
		return;
	}

	// Execute "before leaving" scripts
	if (loc.beforeLeavingScript) {
		eval(loc.beforeLeavingScript);
	}

	// Update the player's location
	pov.loc = exit.to;

	// Execute "before entering" scripts
	if (qgame.locations[exit.to].afterEnteringScript) {
		eval(qgame.locations[exit.to].afterEnteringScript);
	}

	// Get the location description and respond
	const locationDescription = this.getLocationDescription(qgame, pov);
	await interaction.reply(`${pov.alias || pov.name} goes ${exitName}.`);
	await interaction.followUp({ content: locationDescription, flags: 64 });

	// Save the game state
	try {
		await this.saveGame('./game.json', qgame);
	}
	catch (err) {
		console.error('Error saving game data:', err);
		await interaction.followUp({ content: 'Failed to save game data.', flags: 64 });
	}
};

module.exports.GetDisplayName = (obj) => {
	if (typeof obj === 'string') {
		obj = this.GetObject(obj);
	}
	let n = '';
	if (obj.prefix) {
		n += obj.prefix + ' ';
	}
	n += obj.alias || obj.name;
	if (obj.suffix) {
		n += ' ' + obj.suffix;
	}
	if (obj.listChildren) {
		// console.log('obj says listChildren:', obj);
		// Get the direct children of the object
		const children = this.GetDirectChildren(obj);
		// console.log('children:', children);

		// If there are children, list them
		if (obj.inherit.indexOf('container') >= 0 && (obj.isOpen === false || !obj.transparent)) {
			// do nothing
		}
		else if (children.length > 0) {
			// console.log('children:', children);
			let preString = 'in which you see';
			if (obj.inherit.indexOf('surface') >= 0) {
				preString = 'on which you see';
			}
			else if (obj.inherit.indexOf('container') >= 0) {
				preString = 'in which you see';
			}
			if (typeof obj.listChildrenPreString === 'string') {
				preString = obj.listChildrenPreString;
			}
			n += ` (${preString}: ${this.GetDirectChildrenAsString(obj)})`;
		}
	}
	return n;
};

module.exports.FilterByType = (objectlist, objecttype) => {
	return Object.values(objectlist).filter(obj => obj.inherit && obj.inherit.includes(objecttype));
};

module.exports.FilterByGetBoolean = (objectArray, property) => {
	return objectArray.filter(obj => obj[property] === true);
};

module.exports.FilterByNotGetBoolean = (objectArray, property) => {
	return objectArray.filter(obj => obj[property] !== true);
};

module.exports.FilterByHasAttribute = (objectArray, property) => {
	return objectArray.filter(obj => Object.hasOwn(obj, property));
};

module.exports.GetDirectChildren = (obj) => {
	const allObjects = this.allObjects(qgame);
	const children = [];
	for (const o of allObjects) {
		// console.log('o:', o);
		// console.log('o.loc:', o.loc);
		// console.log('obj.name:', obj.name);
		if (o.loc === obj.name) {
			children.push(o);
		}
	}
	return children;
};

module.exports.GetDirectChildrenAsString = (obj, joiner = 'and', useOxfordComma = true) => {
	// Get all direct children of the object
	const children = this.allObjects(qgame)
		.filter(o => o.loc === obj.name)
		.map(o => this.GetDisplayName(o));

	// If no children, return an empty string
	if (children.length === 0) {
		return '';
	}

	// If only one child, return it directly
	if (children.length === 1) {
		return children[0];
	}

	// Handle multiple children
	const lastChild = children.pop();
	const separator = useOxfordComma && children.length > 1 ? ', ' : ' ';
	return children.join(', ') + separator + joiner + ' ' + lastChild;
};

module.exports.filterByType = (qgame, type, category = 'objects') => {
	// Ensure the category is valid (either 'objects' or 'players')
	if (!['objects', 'players'].includes(category)) {
		throw new Error(`Invalid category: ${category}. Must be 'objects' or 'players'.`);
	}

	// Get the list of objects or players based on the category
	const list = qgame[category];

	// Return filtered results based on the 'inherit' property
	return Object.values(list).filter(obj => obj.inherit && obj.inherit.includes(type));
};

module.exports.GetObjectListAsString = (objectList, joiner = 'and', useOxfordComma = true) => {
	// Map the object list to their display names
	console.log('objectList:', objectList);
	const displayNames = Object.keys(objectList).map(obj => this.GetDisplayName(obj));

	// If no objects, return an empty string
	if (displayNames.length === 0) {
		return '';
	}

	// If only one object, return it directly
	if (displayNames.length === 1) {
		return displayNames[0];
	}

	// Handle multiple objects
	// // Remove the last object
	const lastObject = displayNames.pop();
	const separator = useOxfordComma && displayNames.length > 1 ? ', ' : ' ';
	return displayNames.join(', ') + separator + joiner + ' ' + lastObject;
};

module.exports.ListCombine = (list1, list2) => {
	return list1.concat(list2);
};

module.exports.ListContains = (list, item) => {
	return list.includes(item);
};

module.exports.ListRemove = (list, item) => {
	return list.filter(i => i !== item);
};

module.exports.ListAdd = (list, item) => {
	return list.concat(item);
};

module.exports.DictionaryContains = (dictionary, key) => {
	return Object.hasOwn(dictionary, key);
};

module.exports.DictionaryRemove = (dictionary, key) => {
	// eslint-disable-next-line no-unused-vars
	const { [key]: unused, ...rest } = dictionary;
	return rest;
};

module.exports.DictionaryAdd = (dictionary, key, value) => {
	// This will update if the key exists, or add it if it doesn't
	return { ...dictionary, [key]: value };
};

module.exports.DictionaryCombine = (dict1, dict2) => {
	return { ...dict1, ...dict2 };
};

module.exports.DictionaryKeys = (dictionary) => {
	return Object.keys(dictionary);
};

module.exports.DictionaryValues = (dictionary) => {
	return Object.values(dictionary);
};

module.exports.DictionaryContainsValue = (dictionary, value) => {
	return Object.values(dictionary).includes(value);
};

module.exports.DictionaryFilterByValue = (dictionary, predicate) => {
	return Object.fromEntries(
		// eslint-disable-next-line no-unused-vars
		Object.entries(dictionary).filter(([key, value]) => predicate(value)),
	);
};

module.exports.DictionaryMap = (dictionary, transform) => {
	return Object.fromEntries(
		Object.entries(dictionary).map(([key, value]) => [key, transform(value)]),
	);
};

/* example usage
const dict = { a: 1, b: 2, c: 3 };
const mappedDict = q.DictionaryMap(dict, value => value * 2);
console.log(mappedDict); // Output: { a: 2, b: 4, c: 6 }
*/

module.exports.DictionaryReduce = (dictionary, reducer, initialValue) => {
	return Object.entries(dictionary).reduce(
		(acc, [key, value]) => reducer(acc, key, value),
		initialValue,
	);
};

module.exports.type = {
	default: {
		subjectPronoun: 'it',
		objectPronoun: 'it',
		possessivePronoun: 'its',
	},
	npc: {
		subjectPronoun: 'they',
		objectPronoun: 'them',
		possessivePronoun: 'their',
	},
	male: {
		inherit: ['npc'],
		subjectPronoun: 'he',
		objectPronoun: 'him',
		possessivePronoun: 'his',
	},
	female: {
		inherit: ['npc'],
		subjectPronoun: 'she',
		objectPronoun: 'her',
		possessivePronoun: 'her',
	},
	malePlural: {
		inherit: ['male'],
		subjectPronoun: 'they',
		objectPronoun: 'them',
		possessivePronoun: 'their',
	},
	femalePlural: {
		inherit: ['female'],
		subjectPronoun: 'they',
		objectPronoun: 'them',
		possessivePronoun: 'their',
	},
	player: {
		subjectPronoun: 'you',
		objectPronoun: 'you',
		possessivePronoun: 'your',
	},
	animal: {
		subjectPronoun: 'it',
		objectPronoun: 'it',
		possessivePronoun: 'its',
	},
	vehicle: {
		subjectPronoun: 'it',
		objectPronoun: 'it',
		possessivePronoun: 'its',
	},
	surface: {
		subjectPronoun: 'it',
		objectPronoun: 'it',
		possessivePronoun: 'its',
	},
	container: {
		subjectPronoun: 'it',
		objectPronoun: 'it',
		possessivePronoun: 'its',
	},
};

module.exports.getTypeDefaults = (qgame, obj) => {
	const types = obj.inherit || [];
	let resolvedDefaults = { ...q.type.default };

	for (const type of types) {
		if (q.type[type]) {
			resolvedDefaults = {
				...resolvedDefaults,
				...resolveTypeInheritance(type),
			};
		}
	}

	return resolvedDefaults;
};

// Helper function to resolve inheritance for a type
function resolveTypeInheritance(type) {
	const typeDef = q.type[type] || {};
	const inheritedTypes = typeDef.inherit || [];
	let inheritedDefaults = {};

	for (const parentType of inheritedTypes) {
		inheritedDefaults = {
			...inheritedDefaults,
			...resolveTypeInheritance(parentType),
		};
	}

	return { ...inheritedDefaults, ...typeDef };
}

module.exports.runTurnScripts = () => {
	const allScripts = Object.keys(qgame.turnScripts) || [];
	if (allScripts.length === 0) {
		return;
	}
	const enabled = allScripts.filter(script => qgame.turnScripts[script].enabled);
	if (enabled.length === 0) {
		return;
	}
	for (const script of enabled) {
		const scriptObj = qgame.turnScripts[script];
		if (scriptObj.attr) {
			eval(scriptObj.attr);
		}
	}
};

module.exports.openWindowProc = async () => {
	let s = 'You open the window.';
	if (this.GetObject('bee').loc == 'nowhere') {
		s += ' A bee flies in.';
		this.GetObject('bee').loc = 'Kitchen';
	}
	this.GetObject('window').isOpen = true;
	await interaction.reply({ content: s, flags: 64 });
};

module.exports.reviveBobProc = async () => {
	const Bob = this.GetObject('Bob');
	if (pov.loc === 'Lounge') {
		if (Bob.alive !== true) {
			await this.msg ('Using everything you\'ve learned from TV dramas, you attempt to revive Bob.\nMiraculously, the defibrillator lived up to its promise, and Bob is now alive again. He says his head feels kind of fuzzy.');
			Bob.alive = true;
			await this.saveGame('./game.json', qgame);
		}
		else {
			await this.msg ('You\'ve already revived Bob!');
		}
	}
	else {
		await this.msg ('Don\'t worry. The men in white coats will arrive to help you soon!');
	}
};

module.exports.scopeVisible = () => {
	const visibleObjects = [];

	// Check if obj has a location
	if (!obj.loc) return visibleObjects;

	// Get objects in the same location
	const everything = qgame.objects + qgame.players;
	for (const key in Object.keys(everything)) {
		const item = everything[key];
		if ((item.loc === pov.loc || (item.loc === pov.name)) && (item.visible === undefined || item.visible)) {
			visibleObjects.push(item);
		}
	}

	// Include items in open containers and on surfaces
	for (const key in everything) {
		const item = everything[key];
		if (visibleObjects.includes(item.loc)) {
			if (item.isOpen === true && (item.visible === undefined || item.visible)) {
				visibleObjects.push(item);
			}
			if (item.inherit.indexOf('surface') >= 0 && (item.visible === undefined || item.visible)) {
				visibleObjects.push(item);
			}
		}
	}

	return visibleObjects;
};

module.exports.scopeVisibleNotHeld = () => {
	const visibleObjects = this.scopeVisible();
	const heldObjects = this.getInventory(qgame, pov);
	return visibleObjects.filter(obj => !heldObjects.includes(obj.name));
};

module.exports.getAttribute = async (obj, attr) => {
	const objAttr = {};
	if (obj[attr]) {
		objAttr.type = typeof obj[attr];
		if (objAttr.type === 'object') {
			objAttr.type = obj[attr].type;
			objAttr.attr = obj[attr].attr;
		}
		else {
			objAttr.attr = obj[attr];
		}
		return objAttr;
	}
	return null;
};