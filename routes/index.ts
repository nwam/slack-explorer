import express from "express";
import request from "request-promise-native";

const router = express.Router();

/* GET home page. */
router.get("/", function(req: express.Request, res: express.Response, next: express.NextFunction) {
  res.render("index", { title: "Express" });
});

router.get("/authcode", async function(req: express.Request, res: express.Response, next: express.NextFunction) {
  const code = req.query.code;
  console.log("auth code", code);

  return res.send("ur auth code is: " + code);
});

export = router;
