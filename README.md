# DUM
## DUM Bot
## DUM App
## DUM Parser

For DUM Server
 
After cloning (do this from the DUM directory):
- Create config.json, with credentials
- `npm install discord.js`

To keep it running (run commands from the DUM directory):
- `sudo npm install -g pm2`
- `pm2 start /path/to/index.js --name "dum"`
- `pm2 startup`
- `pm2 save`

---
pm2 how-to:

`pm2 list`

`pm2 restart dum`

`pm2 logs dum`

`pm2 stop dum`

`pm2 start dum`


---
It will only work from the DUM server at the moment, but I plan to add code to allow an ENVIRONMENT VARIABLE to set all that stuff.

The game file is game.json.

(I believe this code can be tweaked to allow more than one game running at the same time.)