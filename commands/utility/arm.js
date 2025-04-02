const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('arm')
        .setDescription('Arm a device like a bomb')
        .addStringOption(option =>
            option.setName('object')
                .setDescription('The object you wish to arm')
                .setRequired(true)),
    async execute(interaction) {
        const objectName = interaction.options.getString('object');
        const obj = q.GetObject(objectName);
        
        if (!obj) {
            await q.msg(`There is no ${objectName} here to arm.`);
            return;
        }
        
        if (!q.inScope(obj)) {
            await q.msg(q.template.cantSee(q.GetDisplayName(obj)));
            return;
        }
        
        if (obj.loc !== pov.name) {
            await q.msg(`You don't have ${q.GetDisplayName(obj, true, false, true)}.`);
            return;
        }
        
        if (obj.name === "bomb") {
            if (obj.armed) {
                await q.msg("The bomb is already armed!");
                return;
            }
            
            obj.armed = true;
            qgame.objects.bomb = obj; // Make sure we're updating the game object

            // Store the channel ID for later use
            global.bombTimerChannelId = interaction.channelId;
            global.bombTimerClient = interaction.client;

            global.bombTimer = setInterval(async () => {
                try {
                    const gameChannel = await global.bombTimerClient.channels.fetch(global.bombTimerChannelId);
                    if (qgame.objects.bomb.bombcount <= 0) {
						const bombloc = qgame.objects.bomb.loc;
                        if (Object.keys(qgame.players).includes(bombloc)) {
                            await gameChannel.send(`${q.GetDisplayName(qgame.players[bombloc])} is blown to Smithereens!`);
							await q.addToTranscriptChannel(`${q.GetDisplayName(qgame.players[bombloc])} is blown to Smithereens!`);
                            const items = q.getInventory(qgame, qgame.players[bombloc]) || [];
							for (const i in items) {
								// console.log('Dropping', items[i]);
                                // console.log(`qgame.objects[items[i]].loc: ${qgame.objects[items[i]].loc}`);
                                // console.log(`qgame.players[bombloc].loc: ${qgame.players[bombloc].loc}`);
								qgame.objects[items[i]].loc = qgame.players[bombloc].loc;
							}
							// delete qgame.players[qgame.players[bombloc].name];
                            qgame.players[bombloc].loc = 'Smithereens';
                        }
                        else {
                            // Don't print the game channel if no on is in the location to "see" it
                            await gameChannel.send(`The bomb explodes in ${qgame.objects.bomb.loc}!`);
						    await q.addToTranscriptChannel(`The bomb explodes in ${qgame.objects.bomb.loc}!`);
                        }
                        qgame.objects.bomb.loc = 'Arena';
                        qgame.objects.bomb.armed = false;
                        qgame.objects.bomb.bombcount = 10;
						// console.log('Bomb exploded!');
                        clearInterval(global.bombTimer);
                        await q.saveGame();
                    } else {
                        qgame.objects.bomb.bombcount--;
                        if (qgame.objects.bomb.bombcount <= 5) {
                            await gameChannel.send(`The bomb (${typeof qgame.players[qgame.objects.bomb.loc] != 'undefined' ? 'held by ' + q.GetDisplayName(q.GetObject(qgame.objects.bomb.loc)) : 'in ' + qgame.objects.bomb.loc}) ticks... ${qgame.objects.bomb.bombcount}`);
							await q.addToTranscriptChannel(`The bomb (${typeof qgame.players[qgame.objects.bomb.loc] != 'undefined' ? 'held by ' + q.GetDisplayName(q.GetObject(qgame.objects.bomb.loc)) : 'in ' + qgame.objects.bomb.loc}) ticks... ${qgame.objects.bomb.bombcount}`);
                        }
                        
                    }
                } catch (error) {
                    console.error("Bomb timer error:", error);
                }
            }, 1000);
            await q.msg("You arm the bomb. It begins ticking ominously.");
            await q.saveGame();
        } else {
            await q.msg(`You can't arm the ${q.GetDisplayName(obj, true)}.`);
        }
    },
};