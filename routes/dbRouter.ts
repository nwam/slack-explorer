import express from "express";

import * as db from "../lib/db";

const router = express.Router();

/* GET home page. */
router.get("/db/example", async function(req: express.Request, res: express.Response, next: express.NextFunction) {
  const example = await db.findMessages();
  return res.json(example);
});

export = router;
