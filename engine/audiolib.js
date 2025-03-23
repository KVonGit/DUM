const { createReadStream } = require('node:fs');
const { createAudioResource, StreamType } = require('@discordjs/voice');
/*
const player = createAudioPlayer();

const resource = createAudioResource('/home/user/voice/music.mp3', {
	metadata: {
		title: 'A good song!',
	},
});

// Not recommended - listen to errors from the audio player instead for most usecases!

*/


module.exports.playAudio = (filename) => {
	const player = createAudioPlayer();
	let resource;
	if (filename.endsWith('.ogg')) {
		resource = createAudioResource(createReadStream(filename), {
			inputType: StreamType.OggOpus,
		});
	}
	else if (filename.endsWith('.webm')) {
		resource = createAudioResource(createReadStream(filename), {
			inputType: StreamType.WebmOpus,
		});
	}
	resource.playStream.on('error', error => {
		console.error('Error:', error.message, 'with track', resource.metadata.title);
	});
	player.play(resource);
};