var express = require('express');
var mongoose = require('mongoose');
var config = require('config');
var jwt = require('jsonwebtoken');

function init(server) {
    var router = express.Router();
    router.route('/battleship/:id/name')
        .all( getgame )
        .get( (req, res) => {
            res.json({ success: true, name: req.game.name });
        })
        .put( requireAdmin, (req, res) => {
            req.game.name = req.body.name;
            req.game.save(err => {
                if (err) throw err;
                res.json({ success: true, name: req.game.name })
            });
        });
    router.route('/auth-url/:provider').get( (req, res) => {
        switch (req.params.provider) {
              case 'google': {
                const { login_hint, scope, redirect_uri, prompt, state } = ctx.query;
                const url = new GoogleOAuth({ redirect_uri, scope }).getAuthURL({
                  login_hint,
                  prompt,
                  state
                });
                ctx.response.status = 200;
                ctx.response.body = url;
                return;
              }
              case "azure": {
                const { login_hint, scope, redirect_uri, prompt, state } = ctx.query;
                const url = new AzureOAuth({ redirect_uri, scope }).getAuthURL({
                  login_hint,
                  prompt,
                  state
                });
                ctx.response.status = 200;
                ctx.response.body = url;
                return;
              }
            }
            ctx.response.status = 400;
          });
          
          apiRouter.get("/auth-from-code/:provider", async ctx => {
            if (ctx.params.provider === "google") {
              const { code, redirect_uri, scope } = ctx.query;
              const GoogleOAuthInstance = new GoogleOAuth({ redirect_uri, scope });
              const { response, error } = await GoogleOAuthInstance.getTokenFromCode(
                code
              );
              if (response) {
                ctx.response.status = 200;
                const parsedResponse = GoogleOAuthInstance.parseResponse(
                  response.body as string
                );
                const decodedResponse = GoogleOAuthInstance.parseJWTToken(
                  parsedResponse && parsedResponse.id_token
                );
                if (decodedResponse) {
                  const session = uuid();
                  addOrUpdateUser({
                    emailId: decodedResponse.email,
                    tokenInfo: parsedResponse,
                    session
                  });
                  ctx.cookies.set("session", session);
                  ctx.response.body = decodedResponse;
                }
              }
              if (error) {
                ctx.response.status = error.statusCode || 500;
                ctx.response.body = error.error;
              }
            }
            if (ctx.params.provider === "azure") {
              const { code, redirect_uri, scope } = ctx.query;
              const AzureOAuthInstance = new AzureOAuth({ redirect_uri, scope });
              const { response, error } = await AzureOAuthInstance.getTokenFromCode(code);
              if (response) {
                ctx.response.status = 200;
                ctx.response.body = response;
              }
              if (error) {
                ctx.response.status = error.statusCode || 500;
                ctx.response.body = error.error;
              }
            }
          });
          
          // Protected Route
          apiRouter.get("/list", async ctx => {
            if (ctx.cookies) {
              if (ctx.cookies["session"]) {
                if (!findUserWithSession(ctx.cookies["session"])) {
                  ctx.response.status = 403;
                  return;
                }
                ctx.response.status = 200;
                ctx.response.body = [];
              } else {
                ctx.response.status = 401;
                return;
              }
            }
          });
}

module.exports = init;
