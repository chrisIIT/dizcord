//owner
const init = require('./init');
const Discord = require('discord.js');
var userToken;
//--------------
//initialization
//--------------
init.setup();
init.authorize(function(err, token) {
  if (err) {
    console.log("There was an error retrieving your token :(");
    return;
  }
  if (token) {
    userToken = token;
    console.log('token: ' + token);
    startDizcord();
  }
});

//------------
//UserObtained
//------------
function startDizcord() {
  var client = new Discord.Client({
    fetchAllMembers: true,
    sync: true
  });
  client.login(userToken);
  // Will log discord debug information.
  client.on('debug', function(info) {
    console.log('debug', info);
  });

  // When debugging we probably want to know about errors as well.
  client.on('error', function(info) {
    console.log('error', info);
    sendGeneralNotice('Discord error.');
  });

  // Emitted when the Client tries to reconnect after being disconnected.
  client.on('reconnecting', function() {
    console.log('reconnecting');
    sendGeneralNotice('Reconnecting to Discord.');
  });

  // Emitted whenever the client websocket is disconnected.
  client.on('disconnect', function(event) {
    console.log('disconnected', event);
    //sendGeneralNotice('Discord has been disconnected.');
  });

  // Emitted for general warnings.
  client.on('warn', function(info) {
    console.log('warn', info);
  });
  client.guilds.array().forEach(function(guild) {
    guild.fetchMembers();
    guild.sync();
  });
  client.on('ready', function() {
    console.log("logged in as " + client.user.username);
  });
}
