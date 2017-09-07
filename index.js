'use strict';
var Discord 				= require('discord.js');
var inquirer 				= require('inquirer');
var readline				= require('readline');
var config					= require('./config');

// ------
// CONFIG
// ------
var userToken 			= config.userToken;

// -------
// GLOBALS
// -------
var client 					= new Discord.Client();
var user 						= client.user;
var guilds 					= client.guilds;
var userGuilds 			= []; 
var userGuildChnls 	= [];
var currentGuild		= '';
var currentChannel 	= '';

//---------------------
startDizcord();

function chat(channelName) {
	var channel = getChannelObject(channelName);	
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		crlfDelay: Infinity
	});
	rl.prompt();	
	rl.on('line', (input)=> {
		if (`${input}`.charAt(0) == ':') {
			handleCommand(`${input}`);
			rl.pause();		
		} else {
			channel.send(`${input}`)
				.catch(console.error);
			rl.prompt();
			}
		});
	}	


function handleCommand(cmd) {
	let command = cmd.substr(1);
	switch (command) {
		case 'h': {
			console.log('Here are the list of available commands:');
			console.log('h: Displays a list of commands');	
		}	
		case 'exit': {
			console.log('Exiting dizcord!');
			process.exit();
		}
		case 's': {
			promptGuilds(userGuilds).then();				
		}
	}
	chat(currentChannel);	
}

//gets user object from userGuilds array given name
function getGuildObject(guildName) {
	for (let i=0; i<userGuilds.length; i++) {
		if (userGuilds[i].name == guildName) {
			return userGuilds[i];
		}
	}
}

//gets channel object from userGuildChnls array given name
function getChannelObject(channelName) {
	for (let i=0; i<userGuilds.length; i++) {
		if (userGuildChnls[i].name == channelName) {
			return userGuildChnls[i];
		}
	}
}

// refreshes the guildChannel array
function refreshChannels(guildName) {
	userGuildChnls.length = 0; //clear channel array
	var guild = getGuildObject(guildName);
	return new Promise((resolve,reject)=> {
		guild.channels.forEach((channel)=> {
			userGuildChnls.push(channel);
		});
		resolve();
	});
}

// refreshes the guild array
function refreshGuilds() {
	userGuilds.length = 0; //clear guildarray
	return new Promise((resolve, reject) => {
		guilds.forEach((guild)=> {
			userGuilds.push(guild);
		});
	resolve();
	});
}
function setCurrentGuild(guild) {
	currentGuild = guild;
}

function setCurrentChannel(channel) {
	currentChannel = channel;
}

function promptGuilds(guilds) {
	return inquirer.prompt({
		type: 'list',
		name: 'guild',
		message: 'Select a server: ',
		choices: guilds
	}) ;
}

function promptChannels(channels) {
	return inquirer.prompt({
		type: 'list',
		name: 'channel',
		message: 'Select a channel: ',
		choices: channels
	});
}

function changeServers() {
	return promptGuids(userGuilds).then(promptChannels(userGuildChnls));	
}

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
        console.log('reconnecting');
        // sendGeneralNotice('Reconnecting to Discord.');
    });
    // Emitted whenever the client websocket is disconnected.
    client.on('disconnect', function (event) {
        console.log('disconnected', event);
        //sendGeneralNotice('Discord has been disconnected.');
    });
    
		// Emitted for general warnings.
    client.on('warn', function (info) {
        console.log('warn', info);
    });
    
		client.on('message', (message)=> {
		//console.log(message.channel.name+' '+'message: '+message.content);
			if (message.channel.name == currentChannel && message.guild.name == currentGuild && message.author.username != client.user.username) {
				//console.log('currentChannel: '+currentChannel);
				console.log(message.author.username+': '+message.content);
			}
		});
		
		client.on('ready', function () {
      console.log('Welcome back, ' + client.user.username+'.');
			refreshGuilds().then(()=> {
				promptGuilds(userGuilds).then(function (answer) {
				setCurrentGuild(answer.guild);
				refreshChannels(answer.guild).then(()=> {			
						promptChannels(userGuildChnls).then((answer)=> {
						console.log('Connected to '+answer.channel);
						setCurrentChannel(answer.channel);
						chat(answer.channel);	
					});
				});		
			});
		});			
	});
}
