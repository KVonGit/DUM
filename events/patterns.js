module.exports.patterns = {
	"aboutgame": /^about|info|(game info)|version$/i,
	"arm": /^arm (?<object>.*)$/i,
	"attack": /^attack (?<target>.*)$/i,
	"close": /^close (?<object>.*)$/i,
	"drink": /^drink (?<object>.*)$/i,
	"drop": /^(drop|discard|(put down)|throw) (?<object>.*)$/i,
	"eat": /^eat (?<object>.*)$/i,
	"emote": /^emote (?<text>.*)$/i,
	"examine": /^(x|examine) (?<object>.*)$/i,
	"give": /^give (?<obj>.*) to (?<to>)$/i,
	"go": /^(go)?( )?(to)?( )?( the )?(?<dir>(north|n|northwest|nw|west|w|southwest|sw|south|s|southeast|se|east|e|northeast|ne|in|out|o|up|u|down|d))$/i,
	"help": /^help|commands|cmds|command$/i,
	"hint": /^(hint|hints)$/i,
	"inventory": /^(inv|i|inventory)$/i,
	"look": /^(look|l)$/i,
	"note": /(^note (?<text>.*)$)|(^\W)/i,
	"oops": /^oops (?<object>.*)$/i,
	"open": /^open (?<object>.*)$/i,
	"players": /^players|who$/i,
	"put": /^put (?<object1>.*) (?<placement>.*) (?<object2>.*)$/i,
	"quitgame": /^(quit|exit|leave) game$/i,
	"read": /^read (?<object>.*)$/i,
	"reportbug": /^(report bug|bug) (?<description>)/i,
	"revive": /^revive (?<npc>.*)$/i,
	"saveprogress": /^save$/i,
	"score": /^(score|points)$/i, // Does not exist in the game yet
	"sit": /^sit$/i, // Does not exist in the game yet
	"siton": /^sit (on|in) (?<object>.*)$/i,
	"stand": /^stand$/i, // Does not exist in the game yet
	"speakto": /^speak to (?<npc>.*)$/i,
	"startgame": /^(start|begin) game$/i,
	"switchoff": /^(switch|turn) off (?<object>.*)$/i,
	"switchon": /^(switch|turn) on (?<object>.*)$/i,
	"take": /^(take|get) (?<object>.*)$/i,
	"test": /^test$/i,
	"undo": /^undo$/i,
	"unlock": /^unlock (?<object>.*)$/i, // Does not exist in the game yet
	"unlockwith": /^unlock (?<object>.*) with (?<key>.*)$/i, // Does not exist in the game yet
	"use": /^use (?<object>.*)$/i,
	"useon": /^use (?<object1>.*) on (?<object2>.*)$/i,
	"wait": /^wait$/i,
	"watch": /^watch (?<object>.*)$/i,
	"wear": /^wear (?<object>.*)$/i, // Does not exist in the game yet
	"weigh": /^weigh (?<object>.*)$/i,
	"xyzzy": /^xyzzzy$/i
};