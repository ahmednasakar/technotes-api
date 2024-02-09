// Import necessary modules
const { format } = require("date-fns");
const { v4: uuid } = require("uuid");
const fs = require("fs");
const fsPromises = fs.promises;
const path = require("path");

// Function to log events
const logEvents = async (message, logFileName) => {
  // Format the current date and time
  const dateTime = format(new Date(), "yyyyMMdd\tHH:mm:ss");

  // Create a log entry with timestamp, unique ID, and message
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

  try {
    // Ensure the "logs" directory exists, create it if not
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
    }

    // Append the log entry to the specified log file
    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", logFileName),
      logItem
    );
  } catch (err) {
    // Log any errors that occur during the process
    console.log(err);
  }
};

// Middleware for logging request details
const logger = (req, res, next) => {
  // Log the request method, URL, and origin
  logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, "reqLog.log");

  // Log the request method and path to the console
  console.log(`${req.method} ${req.path}`);

  // Continue with the next middleware in the chain
  next();
};

// Export the logEvents and logger functions for use in other modules
module.exports = { logEvents, logger };
