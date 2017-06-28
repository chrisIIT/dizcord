const chalk = require('chalk');
const clear = require('clear');
const CLI = require('clui');
const figlet = require('figlet');
const inquirer = require('inquirer');
const Preferences = require('preferences');
const Spinner = CLI.Spinner;
var cleanup = require('./cleanup').Cleanup(dizcordCleanup);
const authService = require('./authservice');

//My error handling
function dizcordCleanup() {
  console.log("Cya later, alligator.");
}

var prefs = new Preferences('dizcord');
module.exports = {
  setup() {
    clear(); //clear terminal
    //display title
    console.log(chalk.yellow(figlet.textSync('discordCLI', {
      horizontalLayout: 'full'
    })));
    //retrieve user information
    //TODO change if user has already been authenticated
    if (typeof prefs.dizcord === "undefined" || !prefs.dizcord.authToken) {
      console.log("Welcome.");
      console.log(" ");
      console.log("This application interfaces with Discord and requires certain permisisons, such as accessing your username, posting, and reading messages. If you're okay with this, you can: type 'yes' to be taken to the Discord OAuth page type 'no' with the inability to use the application.");
      console.log(" ");
    } else {
      console.log("Welcome back, getting you setup...");
      console.log("");
    }
  },
  authorize(callback) {
    var self = this;
    var tempToken;
    //check if code exists in the preferences
    if (prefs.dizcord && prefs.dizcord.authToken) {
      //check if code is valid
      // authService.checkAuthTokenExpired().then()
      return callback(null, prefs.dizcord.authToken);
    }

    //else get the credentials || new user
    this.getApprovalForAuthorization(function(answer) {
      //user approves
      if (answer.approval == true) {
        //notify user logging in
        var status = new Spinner("Just a sec, opening authorization page.");
        status.start();

        //Discord OAuth
        authService.getUserAuthorization(function(err) {
          if (err) {
            console.log("Error: " + err);
          }
          status.stop();
          // get the access_token from the browser
          self.getAccessTokenInput(function(answer) {
            tempToken = answer.token;
            prefs.dizcord = {
              "authToken": answer.token
            }
          });
          if (err) {
            return callback(err);
          }
          console.log("returning to index");
          return callback(null, tempToken);
        });
      } else { //user rejects
        process.exit(0);
      }

    });
  },
  getApprovalForAuthorization(callback: Function) {
    var input = [{
      name: 'approval',
      type: 'confirm',
      message: "Is this okay?"
    }];

    inquirer.prompt(input).then(callback);
  },
  getAccessTokenInput(callback) {
    var input = [{
      name: 'token',
      type: 'input',
      message: "Please enter the access token from your browser's URL"
    }];

    inquirer.prompt(input).then(callback, null);
  }
}
