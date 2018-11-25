import express from "express";
import * as path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import io from "socket.io";
import http from "http";
import { normalizePort, onError } from "./lib/initFunctions";

import indexRouter from "./routes/index";
import dbRouter from "./routes/dbRouter";

const app = express();
const server = http.createServer(app);
const port = normalizePort(process.env.PORT || "3000");

app.set("port", port);
server.listen(port);
server.on("error", onError);
server.on("listening", () => {
  const addr = server.address();
  const bind = typeof addr === "string"
    ? "pipe " + addr
    : "port " + addr.port;
  console.log("Listening on " + bind);
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/", dbRouter);

// tslint:disable-next-line:no-string-literal
const socket = io(server);
app.post("/newMsg", (req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log("newMsg body is", req.body);

  socket.emit("newMsg", req.body);
  // pass this request onto the dbRouter
  next();
});

// catch 404 and forward to error handler
app.use(function(req: express.Request, res: express.Response, next: express.NextFunction) {
  return res.status(404).send("There is no page at " + req.path);
});

// error handler
app.use(function(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
