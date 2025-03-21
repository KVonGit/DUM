// const { SlashCommandBuilder } = require('discord.js');
// const fs = require('fs');

module.exports.getInventoryAsString = (qgame, pov) => {
	const inv = [];
	Object.keys(qgame).forEach(element => {
		const obj = qgame[element];
		if (typeof obj.type != 'undefined' && obj.type == 'object') {
			if (obj.parent == pov.name) {
				inv.push(obj.name);
			}
		}
	});
	let s = 'You are carrying';
	if (inv.length > 0) {
		// list stuff
		inv.forEach(element => {
			s += ':\r\n- ' + element;
		});
	}
	else {
		// nada
		s += ' nothing.';
	}
	return s;
};

module.exports.getLocationDescription = (qgame, pov) => {
	let s = '';
	if (typeof qgame[pov.parent].description == 'function') {
		s += qgame[pov.parent].description();
	}
	else {
		s += qgame[pov.parent].description;
	}
	const inRoomObjects = [];
	Object.keys(qgame).forEach(element => {
		const obj = qgame[element];
		if (typeof obj.type != 'undefined' && obj.type == 'object') {
			if (obj.parent == pov.parent) {
				inRoomObjects.push(obj.name);
			}
		}
	});
	let inTheRoom = '';
	if (inRoomObjects.length > 0) {
		// list stuff
		inTheRoom += 'You can see';
		inRoomObjects.forEach(element => {
			inTheRoom += ':\r\n- ' + element;
		});
	}
	s = s + '\r\n' + inTheRoom;
	return s;
};

module.exports.template = {
	'mustStartGame':'You must `/startgame` before you can play.',
	'alreadyPlaying':'You are already playing the game.',
	'notPlaying':'You are not playing the game.',
	'defaultLook':'Nothing out of the ordinary.',
	'taken':'Taken.',
	'cantGo':(exit) => {return `You can't go ${exit}!`;},
	'cantSee':(object) => {return `You can't see anything called '${object}' here!`;},
	'dontHave':(object) => {return `You don't have ${object}!`;},
	'alreadyHave':(object) => {return `You already have ${object}!`;},
	'cantTake':(object) => {return `You can't take ${object}!`;},
	'cantDrop':(object) => {return `You can't drop ${object}`;},
};