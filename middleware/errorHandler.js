// Import the logEvents function from the logger module
const { logEvents } = require("./logger");

// Custom error handler middleware
const errorHandler = (err, req, res, next) => {
  // Log error details using the logEvents function
  logEvents(
    `${req.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
    "errLog.log"
  );

  // Log the full error stack trace to the console
  console.log(err.stack);

  // Determine the HTTP status code to be sent in the response
  const status = res.statusCode ? res.statusCode : 500;

  // Set the HTTP status code in the response
  res.status(status);

  // Send a JSON response with the error message
  res.json({ message: err.message, isError: true });
};

// Export the errorHandler middleware for use in other modules
module.exports = errorHandler;
