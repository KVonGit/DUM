const { createReadStream } = require('node:fs');
const { createAudioResource, StreamType } = require('@discordjs/voice');

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