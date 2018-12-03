import express from "express";
import fs from "fs";
import request from "request-promise-native";

const authRouter = express.Router();

const SLACK_AUTH_URL: string = `https://slack.com/oauth/authorize`;
const SLACK_ACCESS_URL: string = `https://slack.com/api/oauth.access`;

// It's OK to expose this
const CLIENT_ID = "470338559206.487071831106";

// It's not OK to expose this
const SECRET = fs.readFileSync(__dirname + "/.secret").toString("utf-8");

const scopes = [ "channels:read" ];

const OUR_AUTH_ENDPOINT = "/getToken";

const buildRedirectUri = (req: express.Request): string => {
  return `${req.protocol}://${req.get("Host")}/auth${OUR_AUTH_ENDPOINT}`;
};

authRouter.get("/install", async function(req: express.Request, res: express.Response, next: express.NextFunction) {
  const scopesStr = scopes.join(" ");

  // const slackAuthUrl = `${SLACK_AUTH_URL}?client_id=${CLIENT_ID}&scope=${scopesStr}&redirect_uri=${buildRedirectUri(req)}`;
  const slackAuthUrl = `${SLACK_AUTH_URL}?client_id=${CLIENT_ID}&scope=${scopesStr}&redirect_uri=${buildRedirectUri(req)}`;

  // return res.send(slackAuthUrl);
  return res.redirect(slackAuthUrl);
});

export const COOKIE_TOKEN = "slack-token";
export const COOKIE_TEAMNAME = "team-name";

authRouter.get(OUR_AUTH_ENDPOINT, async function(req: express.Request, res: express.Response, next: express.NextFunction) {
  // After the auth request above, slack will give us a code we can pass to the oauth access endpoint
  const slackAuthCode = req.query.code;
  console.log("auth code", slackAuthCode);

  // return res.send(slackAuthCode);

  const payload = {
    client_id: CLIENT_ID,
    client_secret: SECRET,
    redirect_uri: buildRedirectUri(req),
    code: slackAuthCode
  };

  try {
    // we have to send the parameters as urlencoded, but the response is json
    const responseRaw = await request.post(SLACK_ACCESS_URL, { form: payload });
    const response = JSON.parse(responseRaw);
    const token = response.access_token;
    // const scope = response.scope;
    const teamName = response.team_name;

    if (token == null) {
      // unexpected response
      return res.send(response);
    }

    return res
      .cookie(COOKIE_TOKEN, token)
      .cookie(COOKIE_TEAMNAME, teamName)
      .redirect("/");
  }
  catch (err) {
    return res.status(500).render("error", { error: err });
  }
});

export default authRouter;
