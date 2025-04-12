const { SlashCommandBuilder } = require('discord.js');
const q = require('../../engine/q');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Admin-only game management commands')
    .addSubcommand(subcommand =>
      subcommand
        .setName('modify')
        .setDescription('Modify a game object property')
        .addStringOption(option => option.setName('path').setDescription('Object path (e.g. objects.bomb.armed)').setRequired(true))
        .addStringOption(option => option.setName('value').setDescription('New value (will be parsed as JSON)').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('query')
        .setDescription('View current value of a game object')
        .addStringOption(option => option.setName('path').setDescription('Object path to query').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('teleport')
        .setDescription('Teleport player or object to a location')
        .addStringOption(option => option.setName('object').setDescription('Object or player to teleport').setRequired(true))
        .addStringOption(option => option.setName('destination').setDescription('Destination location').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('spawn')
        .setDescription('Create a new item in the game')
        .addStringOption(option => option.setName('name').setDescription('Name of the new item').setRequired(true))
        .addStringOption(option => option.setName('location').setDescription('Where to place the item').setRequired(true))
        .addStringOption(option => option.setName('description').setDescription('Description of the item').setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('save')
        .setDescription('Force an immediate save of the game state'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('broadcast')
        .setDescription('Send a message to all players')
        .addStringOption(option => option.setName('message').setDescription('The message to broadcast').setRequired(true))),

  async execute(interaction) {
    // Admin check
    if (interaction.user.id !== '1279879910109872189') {
      await interaction.reply({ content: 'Nice try! Admin-only command.', flags: 64 });
      return;
    }

    // Get subcommand
    const subcommand = interaction.options.getSubcommand();
    
    if (subcommand === 'modify') {
      const path = interaction.options.getString('path');
      const valueStr = interaction.options.getString('value');
      
      try {
        const value = JSON.parse(valueStr);
        const result = setNestedProperty(global.qgame, path, value);
        await interaction.reply({ content: `✅ Updated ${path} = ${JSON.stringify(value)}`, flags: 64 });
        await q.saveGame();
      } catch (e) {
        await interaction.reply({ content: `❌ Error: ${e.message}`, flags: 64 });
      }
    } else if (subcommand === 'query') {
      const path = interaction.options.getString('path');
      
      try {
        const value = getNestedProperty(global.qgame, path);
        await interaction.reply({ 
          content: `📊 ${path} = \`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``, 
          flags: 64 
        });
      } catch (e) {
        await interaction.reply({ content: `❌ Error: ${e.message}`, flags: 64 });
      }
    } else if (subcommand === 'teleport') {
      const objectName = interaction.options.getString('object');
      const destination = interaction.options.getString('destination');
      
      try {
        // Get the object/player
        const obj = q.GetObject(objectName);
        if (!obj) {
          await interaction.reply({ content: `❌ Object "${objectName}" not found.`, flags: 64 });
          return;
        }
        
        // Check if destination exists
        const loc = q.GetObject(destination) || global.qgame.locations[destination];
        if (!loc) {
          await interaction.reply({ content: `❌ Location "${destination}" not found.`, flags: 64 });
          return;
        }
        
        const oldLoc = obj.loc;
        // Update location
        obj.loc = destination;
        
        await interaction.reply({ 
          content: `✨ Teleported ${q.GetDisplayName(obj)} from ${oldLoc} to ${destination}`, 
          flags: 64 
        });
        
        // If it's a player, send them a message
        if (obj.userName) {
          await q.msg(`You feel a strange tingling sensation, and suddenly find yourself in ${q.GetDisplayName(loc)}!`, true);
          // Also broadcast the arrival to other players
          await q.msg(`${q.GetDisplayName(obj)} appears in a puff of smoke!`, false, true);
        }
        
        await q.saveGame();
      } catch (e) {
        await interaction.reply({ content: `❌ Error: ${e.message}`, flags: 64 });
      }
    } else if (subcommand === 'spawn') {
      const name = interaction.options.getString('name');
      const location = interaction.options.getString('location');
      const description = interaction.options.getString('description') || 'Nothing special.';
      
      try {
        // Check if an object with this name already exists
        if (global.qgame.objects[name]) {
          await interaction.reply({ content: `❌ An object named "${name}" already exists.`, flags: 64 });
          return;
        }
        
        // Check if location exists
        const loc = q.GetObject(location) || global.qgame.locations[location];
        if (!loc) {
          await interaction.reply({ content: `❌ Location "${location}" not found.`, flags: 64 });
          return;
        }
        
        // Create new object
        global.qgame.objects[name] = {
          name: name,
          prefix: 'a',
          objectPronoun: 'it',
          loc: location,
          look: description,
          take: true
        };
        
        await interaction.reply({ 
          content: `🔮 Created new object "${name}" in ${location}`, 
          flags: 64 
        });
        
        // Broadcast to players in that location
        await q.msg(`A ${name} magically appears out of thin air!`, false, true);
        
        await q.saveGame();
      } catch (e) {
        await interaction.reply({ content: `❌ Error: ${e.message}`, flags: 64 });
      }
    } else if (subcommand === 'save') {
      try {
        await q.saveGame();
        await interaction.reply({ content: `💾 Game state saved successfully!`, flags: 64 });
      } catch (e) {
        await interaction.reply({ content: `❌ Error saving game: ${e.message}`, flags: 64 });
      }
    } else if (subcommand === 'broadcast') {
      const message = interaction.options.getString('message');
      
      try {
        // Get all players
        const players = Object.values(global.qgame.players).filter(p => p.userName);
        
        // Send message to all players via direct messages
        let sentCount = 0;
        for (const player of players) {
          try {
            const user = await interaction.client.users.fetch(player.id);
            if (user) {
              await user.send(`**ADMIN BROADCAST**: ${message}`);
              sentCount++;
            }
          } catch (err) {
            console.error(`Failed to send broadcast to ${player.name}: ${err}`);
          }
        }
        
        // Also post in game channel
        await q.msg(`**ADMIN ANNOUNCEMENT**: ${message}`, false, true);
        
        await interaction.reply({ 
          content: `📢 Broadcast sent to ${sentCount} player(s) and posted in-game.`, 
          flags: 64 
        });
      } catch (e) {
        await interaction.reply({ content: `❌ Error: ${e.message}`, flags: 64 });
      }
    }
  }
};

// Helper function to get nested property using path notation
function getNestedProperty(obj, path) {
  return path.split('.').reduce((o, p) => o[p], obj);
}

// Helper function to set nested property using path notation
function setNestedProperty(obj, path, value) {
  const parts = path.split('.');
  const last = parts.pop();
  const target = parts.reduce((o, p) => o[p] = o[p] || {}, obj);
  target[last] = value;
  return value;
}