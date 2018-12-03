import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import io from "socket.io";
import http from "http";

import indexRouter from "./routes/indexRouter";
import dbRouter from "./routes/dbRouter";
import authRouter from "./routes/authRouter";

process.on("unhandledRejection", (error) => {
  console.error("unhandled promise rejection:\n", error);
});

const app = express();
const server = http.createServer(app);
const port = 3000;

app.set("port", port);
server.listen(port);
server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.syscall !== "listen") {
      throw error;
    }
    // handle specific listen errors with friendly messages
    switch (error.code) {
      case "EACCES":
        console.error("App Requires elevated privileges");
        process.exit(1);
        break;
      case "EADDRINUSE":
        console.error(`port ${port} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
});
server.on("listening", () => {
  console.log("Listening on port " + port);
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
app.use("/db", dbRouter);
app.use("/auth", authRouter);

export const serverSocket = io(server);

// catch 404 and forward to error handler
app.use(function(req: express.Request, res: express.Response, next: express.NextFunction) {
  return res.status(404).render("404", { title: "Page not found", path: req.path });
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
