'use strict';
const Discord 				= require('discord.js');
const inquirer 				= require('inquirer');
const readline				= require('readline');
const config					= require('./config');
const chalk 					= require('chalk');
const log 						= (msg)=> {
													process.stdout.clearLine();
													process.stdout.cursorTo(0);
													console.log(msg);
													rl.prompt(true);
											};
const clear 					= require('clear');

// ------
// CONFIG
// ------
const userToken 			= config.userToken;

// -------
// GLOBALS
// -------
const client 					= new Discord.Client();
const user 						= client.user;
const guilds 					= client.guilds;
var userGuilds 				= []; 
var userGuildChnls 		= [];
var currentGuild			= '';
var currentChannel 		= '';
var rl;
//---------------------
startDizcord();

// Before rl is created;
// Handle SIGINT in startup
process.on('SIGINT', ()=> {
	exitDizcord();
});


// Starts the REPL
// reprompts if enter is pressed without any text, checks for commmands via ':'
function chat(channelName) {
	let channel = getChannelObject(channelName);	
	rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		crlfDelay: Infinity,
		prompt: chalk.red('> '),
	});
	//rl.prompt(true);	
	
	//TODO: Figure out how to prompt after fetching messages	

	// SIGINT Handler
	rl.on('SIGINT', ()=> {
		exitDizcord();
	});
	
	rl.on('line', (input)=> {
		//check if enter is pressed (nothing sent)
		if (isNaN(`${input}`.charCodeAt(0))) {
			rl.prompt(true);
		} 
		else {
			if (`${input}`.charAt(0) == '/') {
				rl.pause();		
				handleCommand(`${input}`,rl);
			} else {
				channel.send(`${input}`)
					.catch(console.error);
				rl.prompt(true);
			}
		}
	});	
}

// Decides what to do when a command is given via the REPL
function handleCommand(cmd) {
	let command = cmd.substr(1);
	switch (command) {
		case 'h': {
			log(chalk.blue('Here are the list of available commands:'));
			log(chalk.blue('h: Displays a list of commands'));	
			log(chalk.blue('s: Switch server and channels'));
			log(chalk.blue('exit: Quits dizcord'));
			//chat(currentChannel);
			rl.prompt(true);
			break;
		}	
		case 'exit': {
			exitDizcord();	
		}
		case 's': {
			rl.close();
			selectServer();
			break;			
		}
	}
}

// Exit routine
function exitDizcord() {
	log(chalk.blue('Exiting dizcord!'));
	if (rl)
		rl.close(0);
	process.stdin.destroy();
	process.exit();
}
// Gets user object from userGuilds array given name
function getGuildObject(guildName) {
	for (let i=0; i<userGuilds.length; i++) {
		if (userGuilds[i].name == guildName) {
			return userGuilds[i];
		}
	}
}

// Gets channel object from userGuildChnls array given name
function getChannelObject(channelName) {
	for (let i=0; i<userGuilds.length; i++) {
		if (userGuildChnls[i].name == channelName) {
			return userGuildChnls[i];
		}
	}
}

// Refreshes the guildChannel array
function refreshChannels(guildName) {
	userGuildChnls.length = 0; //clear channel array
	let guild = getGuildObject(guildName);
	return new Promise((resolve,reject)=> {
		guild.channels.forEach((channel)=> {
			userGuildChnls.push(channel);
		});
		resolve();
	});
}

// Refreshes the guild array
function refreshGuilds() {
	userGuilds.length = 0; //clear guildarray
	return new Promise((resolve, reject) => {
		guilds.forEach((guild)=> {
			userGuilds.push(guild);
		});
	resolve();
	});
}

// For clarity, sets the currentGuild
function setCurrentGuild(guild) {
	currentGuild = guild;
}

// For clarity, sets the currentChannel
function setCurrentChannel(channel) {
	currentChannel = channel;
}

// Dispays past messages from the server
// @amount can limit the amount of messages to retrieve
function displayPastMessages(channel, amount) {
	channel.fetchMessages({limit: amount}).then((messages)=> {
		messages.array().reverse().forEach((message)=> {
			console.log(chalk.red('> ')+chalk.blue(message.author.username)+': '+message.content);
		});
	});
}

// Inquires which guild to connect to
function promptGuilds(guilds) {
	return inquirer.prompt({
		type: 'list',
		name: 'guild',
		message: 'Select a server: ',
		choices: guilds
	});
}

// Inquires which channel from a guild to connect to
function promptChannels(channels) {
	return inquirer.prompt({
		type: 'list',
		name: 'channel',
		message: 'Select a channel: ',
		choices: channels
	});
}

// Connects to a guild (server) and channel and starts the REPL
function selectServer() {
	return refreshGuilds().then(()=> {
		return promptGuilds(userGuilds).then(function (answer) {
			setCurrentGuild(answer.guild);
			return refreshChannels(answer.guild).then(()=> {			
				promptChannels(userGuildChnls).then((answer)=> {
					console.log(chalk.green('Connected to ')+chalk.blue(answer.channel));
					setCurrentChannel(answer.channel);
					clear();
					displayPastMessages(getChannelObject(answer.channel), 10);
					return chat(answer.channel);	
				});
			});		
		});
	});
}

// Initiation function;
// TODO: cleanup event functions
function startDizcord() {
    client.login(userToken);
    // Will log discord debug information.
    client.on('debug', function (info) {
//        console.log('debug', info);
    });
    // When debugging we probably want to know about errors as well.
    client.on('error', function (info) {
       // console.log('error', info);
        // sendGeneralNotice('Discord error.');
    });
    // Emitted when the Client tries to reconnect after being disconnected.
    client.on('reconnecting', function () {
        log('reconnecting');
        // sendGeneralNotice('Reconnecting to Discord.');
    });
    // Emitted whenever the client websocket is disconnected.
    client.on('disconnect', function (event) {
        log('disconnected', event);
        //sendGeneralNotice('Discord has been disconnected.');
    });
    
		// Emitted for general warnings.
    client.on('warn', function (info) {
        log('warn', info);
    });
    
		client.on('message', (message)=> {
		//console.log(message.channel.name+' '+'message: '+message.content);
			if (message.channel.name == currentChannel && message.guild.name == currentGuild && message.author.username != client.user.username) {
				//console.log('currentChannel: '+currentChannel);
				log(chalk.red('> ')+chalk.blue(message.author.username)+': '+message.content);
			} 
		});
		
		client.on('ready', function () {
      console.log(chalk.yellow('Welcome back, ') + chalk.green(client.user.username)+'.');
			selectServer();	
	});
	}
