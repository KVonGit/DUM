' QuestNet Sample Game "Arena"
' A basic demonstration of a few features of QuestNet Server 4.0

' by Alex Warren
' Version 1.01
' Copyright © 2007 Axe Software

' This ASL file has been commented throughout to explain what each bit does - I highly recommend going
' through it to get a feel for programming QuestNet Server.

!include <net.lib>

define game <Arena>
	asl-version <400>
	gametype multiplayer
	start <arena>
	game version <1.01>
	game author <Alex Warren>
	
	' This prints to the server admin screen when the game initialises:
	
	startscript {
		msg <This game has been initialised and players can now connect to this server. To try _
			this game out for yourself, load up Quest and select the "Network" tab, _
			then connect to "localhost". You might want to load up two or three instances of Quest _
			with different player names to test out possible interactions between players.|n>
		msg <You will see details of connections, and see what each player types, in this window. _
			You are also able to see player information and disconnect players from the server using the _
			list and buttons to the right.>
		msg <|nType |bHELP|xb to see a list of commands you can use in this Admin window.>
	}
	
	
	' This prints to each player's screen when they connect. Although we use the "msg" command just as
	' we do above in the "normal" startscript, the message prints automatically to the correct player's screen.
	' If we want to print a message on the server admin screen at this point, we need to use "msgto <0; Some message>"
	' instead of msg.
	
	player startscript {
		msg <Hello $name(%userid%)$. Welcome to the QuestNet Sample Game, "Arena".|n>
		msg <This very basic demonstration lets you pick up the various objects in the room, _
			give them to people, and give people money. You can give people money by typing _
			|bPAY|xb (|iplayer's name|xi) |b$$|xb(|iamount|xi). You can omit the "$$" if you like. Type |bBALANCE|xb _
			to see how much money you have.|n>
		msg <You can also have a mock "battle" with somebody if you have the hammer! Just type |bHIT|xb _
			(|iplayer's name|xi).|n>
		msg <You can also play "hot potato" with the bomb. Pick it up and look at it for instructions!>

		set numeric <money[userid]; 5>
	}
	
	
	
	' This sets up the command that allows players to pay money to each other. See how we use "msg" to print
	' to the player that is doing the paying (the one who typed in the PAY command), and we use "msgto" to
	' print to the receiving player.
	
	command <pay #@player# $$#amt#; pay #@player# #amt#> {
		if ( #amt# > 0 ) then {
			if ( %money[userid]% >= #amt# ) then {
				set numeric <id; $id(#player#)$>
				set numeric <money[id]; %money[id]% + #amt#>
				set numeric <money[userid]; %money[userid]% - #amt#>
				msgto <%id%; |b$name(%userid%)$|xb has given you $$#amt#.>
				msg <You give $name(%id%)$ $$#amt#.>
			}
			else {
				msg <You don't have enough money for that.>
			}
		}
		else {
			msg <You can't go around giving people amounts like that.>
		}
	}
	
	' This is a mini error handler that prints a helpful message to anybody who uses the PAY command without
	' specifying another player or an amount properly:
	
	command <pay #null#> {
		msg <You need to type |bPAY|xb, followed by the player name, then the _
			amount of money you want to pay.>
	}
	
	command <balance> msg <You are carrying $$%money[userid]%.>
	
	' When a player disconnects, return everything that's in their inventory to the main "arena" room.
	
	disconnect for each object in <player%userid%> move <#quest.thing#; arena>	
end define

define options
	welcome		off
	login		off
	register	off
end define

define room <arena>

	look <Welcome to the arena.>
	prefix <the>
	
	command <hit #@player#> {
		if property <#player#; netplayer> then {
			if got <hammer> then {
				msg <You hit #@player#.>
				msgto <#player#; |b$name(%userid%)$|xb hits you with a hammer.>
			}
			else msg <You don't have anything to hit #@player# with.>
		}
		else msg <You can't do that.>
	}
	
	command <arm #@thing#> {
		if ( #thing# = bomb ) then {
			if got <bomb> then {
				if property <bomb; armed> then msg <The bomb is already armed.> else {
					property <bomb; armed>
					msg <You have now armed the bomb.>
					set numeric <bombcount; 10>
					timeron <bombtimer>
				}
			}
			else msg <You'll have to pick it up first.>
		}
		else msg <You'll have a hard time arming that!>
	}
	
	command <eat #@thing#> {
		if got <#thing#> then {
			if action <#thing#; eat> then doaction <#thing#; eat> else msg <You can't eat that!>
		}
		else msg <You don't have that!>
	}
	
	define object <bomb>
		prefix <a>
		look {
			if property <bomb; armed> then {
				msg <The bomb is ticking, and a red count-down display reads '|b|cr%bombcount%|cb|xb'.>
			}
			else {
				if got <bomb> then msg <You can arm this bomb by typing |bARM BOMB|xb.>
				else msg <Why not pick it up and take a closer look?>
			}
		}
		take
		type <giveable>
	end define
	
	define object <banana>
		prefix <a>
		take
		type <giveable>
		look <It's a tasty looking banana.>
		action <eat> {
			hide <banana>
			msg <You scoff the banana and belch loudly. Everybody heard you.>
			for each object in <#quest.currentroom[userid]#> {
				if property <#quest.thing#; netplayer> and (#quest.thing# <> player%userid%) then {
					msgto <#quest.thing#; |b$name(%userid%)$|xb eats the banana and belches loudly.>
				}
			}
		}
	end define
	
	define object <hammer>
		prefix <a>
		take
		type <giveable>
		use on anything {
			if property <#quest.use.object.name#; netplayer> then {
				exec <hit #quest.use.object.name#>
			}
			else msg <There's no need for that.>
		}
			
	end define
end define

define timer <bombtimer>
	' This timer fires for every second for each "tick" of the bomb.
	' It decrements the "bombcount" numeric variable so that the
	' bomb description says how much time is left until the explosion.
	
	disabled
	interval <1>
	action {
		dec <bombcount>
		
		if ( %bombcount% <= 0 ) then {
		
			' The bomb explodes when the counter reaches zero.
			
			timeroff <bombtimer>
			hide <bomb>
			
			
			' Set #bomblocation# to tell us where the bomb is
			
			set string <bomblocation; $locationof(bomb)$>
			
			
			' If the bomb is being carried by a player, that player
			' explodes and dies. If not, the bomb is just in a room
			' and so can explode without killing anybody.
			
			if property <#bomblocation#; netplayer> then {
				msgto <#bomblocation#; The bomb you are carrying has exploded! You have died.>
			
			
				' Set #playerlocation# to the room the player
				' was in.
			
				set string <playerlocation; $locationof(#bomblocation#)$>
			
			
				' Inform everybody else in the room that the player
				' has exploded
				
				for each object in <#playerlocation#> {
					if property <#quest.thing#; netplayer> and (#quest.thing# <> #bomblocation#) then {
						msgto <#quest.thing#; The bomb has exploded! |b$name(#bomblocation#)$|xb's limbs fly everywhere.>
					}
				}
				disconnect <$id(#bomblocation#)$>
			}
			else {
				for each object in <#bomblocation#> {
					if property <#quest.thing#; netplayer> then {
						msgto <#quest.thing#; The bomb has exploded. Nobody was injured.>
					}
				}
			}
		}
	}
end define