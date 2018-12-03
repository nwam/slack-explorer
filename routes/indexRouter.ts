import express from "express";
import Rtm from "../lib/rtm";
import { serverSocket } from "../app";
import { COOKIE_TOKEN, COOKIE_TEAMNAME } from "./authRouter";

const indexRouter = express.Router();

/* GET home page. */
indexRouter.get("/", async function(req: express.Request, res: express.Response, next: express.NextFunction) {
  // These should either be both set, or both not set.
  const token = req.cookies[COOKIE_TOKEN];
  const teamName = req.cookies[COOKIE_TEAMNAME];

  if (token == null) {
    return res.send(`You have to give Slack-Explorer access to your workspace; ` +
      `<a href="/auth/install">click here to go to Slack to authenticate</a>`);
  }

  Rtm.startRTM(serverSocket, token)
    .then( () => console.log("RTM initialized in " + __filename))
    .catch((err) => console.error("RTM failed to initialize and won't work", err));

  return res.render("index", { title: teamName });
});

indexRouter.get("/overview", async function(req: express.Request, res: express.Response, next: express.NextFunction){
  return res.render("user", {title: "Overview", nodeID: 0});
});

export const NODE_ID_KEY = "nodeID";
indexRouter.get(`/u/:${NODE_ID_KEY}`, function(req: express.Request, res: express.Response, next: express.NextFunction) {
  const nodeID = req.params[NODE_ID_KEY];
  return res.render("user", { title: "This is the page of the node " + nodeID, nodeID: nodeID });
});

export default indexRouter;
