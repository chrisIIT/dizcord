const express = require('express');
const mRequest = require('request');
const app = express();
const port = 7777;
const opn = require('opn');
const config = require('./config');
var Promise = require('promise');

//---------
//CONSTANTS
//---------
const CLIENT_ID = config.client_id;
const REDIRECT_URI = config.redirect_uri;
const authCodeURI = "https://discordapp.com/oauth2/authorize?client_id=" + CLIENT_ID + "&scope=identify+rpc.api+messages.read&redirect_uri=" + REDIRECT_URI + "&response_type=token";

module.exports = {
  authToken: null,
  refreshToken: null,
  listen(callback) {
    var $this = this;
    //------------
    //LOCAL SERVER
    //------------
    var server = app.listen(port, (err) => {
      if (err) {
        return callback(err);
      }
    });
    server.on('close', () => {
      callback();
    });
    opn(authCodeURI);

    //for auth code
    app.get('/', (request, response) => {
      if (request.method == 'GET') {
        if (request.url == '/favicon.ico') {
          response.send(204);
        }
        response.end();
        //retrieve auth code from URI and split
        // response.end(function() {
        //   var access_token = request.url.substring(15, 30); //expires after 7 days
        //   console.log(request.url);
        //   console.log(access_token);
        //   $this.authToken = access_token;
        // });
      }
      server.close();
    });
  },
  checkAuthTokenExpired() {}
}
