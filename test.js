const inquirer    = require('inquirer');

var input = [
  {
    name:'approval',
    type: 'confirm',
    message: "Is this okay?",
  }
]

inquirer.prompt(input);
