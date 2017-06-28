const express = require('express');
const mRequest = require('request');
const app = express();
const opn = require('opn');
const config = require('./config');

//---------
//CONSTANTS
//---------
const CLIENT_ID = config.client_id;
const PORT = config.port;
const REDIRECT_URI = config.redirect_uri;
const authCodeURI = "https://discordapp.com/oauth2/authorize?client_id=" + CLIENT_ID + "&scope=identify+rpc.api+messages.read&redirect_uri=" + REDIRECT_URI + "&response_type=token";

module.exports = {
  getUserAuthorization(callback) {
    //------------
    //LOCAL SERVER
    //------------
    var server = app.listen(PORT, (err) => {
      if (err) {
        console.log("error in authservice " + err);
        return callback(err);
      }
    });
    server.on('close', callback);
    opn(authCodeURI);

    //for auth code
    app.get('/', (request, response) => {
      if (request.url == '/favicon.ico') {
        response.send(204);
      }
      response.end();
      server.close();
    });
  },
  getUserAuthentication(callback) {

  }
}
