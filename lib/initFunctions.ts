/**
 * Event listener for HTTP server "error" event.
 */

export function onError(error, port) {
    if (error.syscall !== "listen") {
      throw error;
    }

    const bind = typeof port === "string"
      ? "Pipe " + port
      : "Port " + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case "EACCES":
        console.error(bind + " requires elevated privileges");
        process.exit(1);
        break;
      case "EADDRINUSE":
        console.error(bind + " is already in use");
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

export function normalizePort(val) {
    const port_ = parseInt(val, 10);

    if (isNaN(port_)) {
      // named pipe
      return val;
    }

    if (port_ >= 0) {
      // port number
      return port_;
    }

    return false;
  }