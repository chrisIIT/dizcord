//owner
var init        = require('./init');

//initialization
init.setup();
init.getUserToken(function(err,token) {
  if (err) {
    console.log('oh no '+err);
  }
  console.log('here with token '+token);
})
