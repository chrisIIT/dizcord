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
    if (typeof prefs.dizcord === "undefined" || !prefs.dizcord.token) {
      console.log("Welcome.");
      console.log(" ");
      console.log("This application interfaces with Discord and requires certain permisisons, such as accessing your username, posting, and reading messages. If you're okay with this, you can: type 'yes' to be taken to the Discord OAuth page type 'no' with the inability to use the application.");
      console.log(" ");
    } else {
      console.log("Welcome back, getting you setup...");
      console.log("");
    }
  },
  authorize(callback: Function) {
    //check if code exists in the preferences
    if (prefs.dizcord && prefs.dizcord.authToken) {
      //check if code is valid
      authService.checkAuthTokenExpired().then()
      return callback(null, prefs.dizcord.token);
    }

    //else get the credentials || new user
    this.getApprovalForAuthorization(() => {
      //notify user logging in
      var status = new Spinner("Just a sec, opening authorization page.");
      status.start();

      //Discord OAuth
      authService.listen(function(err: Error) {
        status.stop();
        if (err) {
          return callback(err);
        }

        if (authService.authToken && authService.refreshToken) {
          //authentication approved
          //set preference code to code
          prefs.dizcord = {
            "authToken": authService.authToken,
            "refreshToken": authService.refreshToken
          };

          return callback(null, authService.authToken);
        }
      });
    });
  },
  getApprovalForAuthorization(callback: Function) {
    var input = [{
      name: 'approval',
      type: 'confirm',
      message: "Is this okay?"
    }]

    inquirer.prompt(input).then(callback, null);
  }
}
