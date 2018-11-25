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

const NODE_ID_KEY = "nodeID";
router.get(`/u/:${NODE_ID_KEY}`, function(req: express.Request, res: express.Response, next: express.NextFunction) {
  const nodeID = req.params[NODE_ID_KEY];
  return res.render("user", { title: "This is the page of the node " + nodeID, nodeID: nodeID });
});

export = router;
