const chalk       = require('chalk');
const clear       = require('clear');
const CLI         = require('clui');
const figlet      = require('figlet');
const inquirer    = require('inquirer');
const Preferences = require('preferences');
const Spinner     = CLI.Spinner;
const _           = require('lodash');
const touch       = require('touch');
const fs          = require('fs');
const Discord     = require('discord.js');
var client = new Discord.Client();


module.exports = {
  setup() {
    clear(); //clear terminal
    //display title
    console.log(chalk.yellow(figlet.textSync('discordCLI',{
      horizontalLayout: 'full'
    })));
    //retrieve user information
    console.log("Welcome.");
    console.log("Please sign in below.")
  },
  authorize(callback) {
    this.getUserToken(function(err,token) {
      if (err) {
        return callback(err);
      }
    })
  },
  getUserToken(callback) {
    var prefs =  new Preferences('discordcli');

    //DEBUG
    //console.log("prefs discord: "+prefs.discord);
    //console.log("prefs discord token: "+prefs.discord.token);

    //check if token exists in the preferences
    if (prefs.discord && prefs.discord.token) {
      return callback(null, prefs.discord.token);
    }

    //else get the credentials
    this.getCredentials(function (credentials) {
      //notify user logging in
      console.log(credentials);
      var status = new Spinner("Just a sec, logging in.");
      status.start();

      client.login(credentials.username, credentials.password, function(error, token) {
        status.stop();
        if (error) {
          console.log('Error logging in: '+error);
          return;
        } else {
          console.log("Successfully logged in with token:");
          console.log(token);
        }
      });
    });
  },
  getCredentials(callback) {
    var input = [
      {
        name: 'username',
        type: 'input',
        message: 'Username: ',
        validate(value) {
          if (value.length) {
            return true;
          } else {
            return 'No username entered. Please enter your username.'
          }
        }
      }, {
        name: 'password',
        type: 'password',
        message: 'Password: ',
        validate(value) {
          if (value.length) {
            return true;
          } else {
            return 'No password entered. Please enter your password.'
          }
        }
      }
    ];

    inquirer.prompt(input).then(callback);
  }
}
