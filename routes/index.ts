import express from "express";

const router = express.Router();

/* GET home page. */
router.get("/", function(req: express.Request, res: express.Response, next: express.NextFunction) {
  res.render("index", { title: "Express" });
});

const NODE_ID_KEY = "nodeID";
router.get(`/u/:${NODE_ID_KEY}`, function(req: express.Request, res: express.Response, next: express.NextFunction) {
  const nodeID = req.params[NODE_ID_KEY];
  res.render("user", { title: "This is the page of the node " + nodeID, nodeID: nodeID });
});

export = router;
