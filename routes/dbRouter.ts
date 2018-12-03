import express from "express";

import fetch from "../lib/crawler";
import * as db from "../lib/db";
import { NODE_ID_KEY } from "./indexRouter";
import { COOKIE_TOKEN } from "./authRouter";

const router = express.Router();

router.post("/fetch", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.cookies[COOKIE_TOKEN];
  if (token == null) {
    return res.status(500).render("error", { error: `No token is available; <a href="/auth/install>Install the app into your workspace</a>`});
  }
  await fetch(token);
  console.log("dbRouter done fetch");
  return res.sendStatus(204);
});

router.get("/network", async function(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const channels = db.findChannelTotals();
    const users = db.findUserTotals();
    const interactions = db.findUsersInteractions();

    return res.json({
      channels : await channels,
      users : await users,
      interactions : await interactions});

    }
  catch (err) {
    return res.status(500).render("error", { error: err });
  }
});

router.get(`/u/:${NODE_ID_KEY}`, async function(req: express.Request, res: express.Response, next: express.NextFunction) {
  const id = req.params[NODE_ID_KEY];
  let type = "user";
  const channelFind = await db.findChannel(id);
  if (channelFind) {
    type = "channel";
  }
  const messages = await db.findEntityMessages(id, type);
  const words = db.countWords(messages);
  console.log("words", words);
  const timeCounts = db.getTimeCounts(messages);

  return res.json({
    words : words,
    timeCounts : timeCounts
  });

});

const UNAME_KEY = "username";
router.get(`/getid/:${UNAME_KEY}`, async function(req: express.Request, res: express.Response, next: express.NextFunction) {
  const name = req.params[UNAME_KEY];
  if (name == null) {
    return res.status(400).send("Must provide a username to get the ID for");
  }
  const userid = await db.findUserID(name);

  if (userid != null) {
    return res.send(userid);
  }
  else {
    return res.status(400).send("No user with name " + name);
  }
});

router.get("/overview", async function(req: express.Request, res: express.Response, next: express.NextFunction) {
  const messages = await db.findMessages();
  const words = db.countWords(messages);
  const timeCounts = db.getTimeCounts(messages);

  return res.json({
    words : words,
    timeCounts : timeCounts
  });
});

export default router;
