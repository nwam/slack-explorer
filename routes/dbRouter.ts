import express from "express";

import * as db from "../lib/db";

const router = express.Router();

router.post("/newMsg", function(req: express.Request, res: express.Response, next: express.NextFunction) {
  const newMsg = req.body;
  console.log("dbRouter handling message:", newMsg);
  return res.sendStatus(204);
});

router.get("/db/example", async function(req: express.Request, res: express.Response, next: express.NextFunction) {
  const example = await db.findMessages();
  return res.json(example);
});

export = router;
