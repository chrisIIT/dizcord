const express     = require('express');
const mRequest     = require('request');
const app         = express();
const port        = 7777;
const opn         = require('opn');
const authCodeURI = "https://discordapp.com/oauth2/authorize?client_id=325432001161199617&scope=identify+rpc.api+messages.read&redirect_uri=http://127.0.0.1:7777&response_type=code"
module.exports = {
  authCode: null,
  authToken: null,
  canAccess: null,
  listen(callback) {
    var $this = this;

    //for auth token
    // const requestHandler2 = (req,res) => {
    //
    //   var remote = request(authTokenUri);
    //   req.pipe(remote);
    //   remote.pipe(res);
    //     //retrieve auth token from URI
    //     res.end(function() {
    //       console.log("res is "+res);
    //       $this.authToken = res;
    //     });
    //     server.close()
    // }
    var headers = {

    }

    //for auth code
    const requestHandler = (request, response) => {
      if (request.method == 'GET') {
        if (request.url == '/favicon.ico') {
          response.send(204);
        }
        //retrieve auth code from URI and split
        response.end(function() {
          $this.authCode = request.url.substring(7);
          var authTokenUri = "https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code="+$this.authCode+"&redirect_uri=http://127.0.0.1:7777&client_id=325432001161199617";
          var options = {
            url:authTokenUri,
            method:'POST'
          }
          //then post auth code
          //app.post('/',requestHandler2)
          mRequest(options, function(err,res,body) {
            console.log('res '+res);
            console.log('body '+body);
          })
        });
      }
    }

    var server = app.listen(port, (err) => {
      if (err) {
        return callback(err);
      }
    });

    app.get('/',requestHandler);
    opn(authCodeURI);

    server.on('close', () => {
      this.canAccess = true;
      callback();
    });
  }
}
