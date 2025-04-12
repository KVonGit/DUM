// engine/commandHandler.js
const q = require('./q');

// Process common command patterns and provide metadata to command handlers
async function handleCommand(interaction) {
  // Initialize global variables commonly used across commands
  global.interaction = interaction;
  global.pov = q.GetObject(interaction.user.username);
  global.qgame = global.qgame || {};
  global.gameResponseForTranscript = [];
  
  // Start building metadata object for the command
  const metadata = {
    objects: {},
    validated: false,
    errors: []
  };
  
  // Check if player exists
  if (!global.pov) {
    await q.msg(q.template.mustStartGame);
    return false;
  }
  
  // Extract all options from the command
  const options = interaction.options;
  const optionsData = options.data || [];
  
  // Process common option patterns
  for (const option of optionsData) {
    // For object references (common pattern)
    if (['object', 'object1', 'object2', 'target', 'npc'].includes(option.name)) {
      const objectName = option.value;
      if (!objectName) {
        await q.msg(`'${option.name}' not defined.`);
        return false;
      }
      
      // Try to resolve object
      const obj = q.GetObject(objectName);
      if (!obj) {
        await q.msg(`No such object ("${objectName}")!`);
        return false;
      }
      
      // Store object for command handler
      metadata.objects[option.name] = obj;
      
      // Track as last object
      if (global.pov.lastObject) {
        global.pov.lastObject[obj.objectPronoun || 'it'] = obj.name;
      }
      
      // Check if object is in scope if not a player
      if (obj.loc !== undefined && !q.inScope(obj)) {
        await q.msg(q.template.cantSee(q.GetDisplayName(obj, false, false, true)));
        return false;
      }
    }
    
    // Handle text inputs
    else if (['text', 'message', 'note'].includes(option.name)) {
      metadata[option.name] = option.value;
    }
    
    // Handle directions
    else if (['direction', 'exit'].includes(option.name)) {
      metadata.direction = option.value;
    }
    
    // Handle placements (in/on)
    else if (['placement'].includes(option.name)) {
      metadata.placement = option.value;
    }
    
    // Store all other options by name
    else {
      metadata[option.name] = option.value;
    }
  }
  
  // Set validated to true if we got this far
  metadata.validated = true;
  
  // Return the metadata for the command to use
  return metadata;
}

// Export the function
module.exports = { handleCommand };