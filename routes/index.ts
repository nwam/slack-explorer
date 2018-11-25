import express from "express";
import * as db from "../lib/db";

export const indexRouter = express.Router();

/* GET home page. */
indexRouter.get("/", async function(req: express.Request, res: express.Response, next: express.NextFunction) {
  const title = "HackWestern5 Slack";
  /*
  const nodeQp = req.query.node;
  console.log("nodeqp", nodeQp);
  if (nodeQp) {
    const user = await db.findUser(nodeQp);
    console.log("finduser result", user);
    if (user != null) {
      title = user.name;
      if (user.statusEmoji != null) {
        title += " " + user.statusEmoji;
      }
      if (user.statusText != null) {
        title += " " + user.statusText;
      }
    }
  }*/
  return res.render("index", { title: title });
});

indexRouter.get("/authcode", async function(req: express.Request, res: express.Response, next: express.NextFunction) {
  const code = req.query.code;
  console.log("auth code", code);

  return res.send("ur auth code is: " + code);
});

export const NODE_ID_KEY = "nodeID";
indexRouter.get(`/u/:${NODE_ID_KEY}`, function(req: express.Request, res: express.Response, next: express.NextFunction) {
  const nodeID = req.params[NODE_ID_KEY];
  return res.render("user", { title: "This is the page of the node " + nodeID, nodeID: nodeID });
});
