// Import required library and modules
const rateLimit = require("express-rate-limit");
const { logEvents } = require("./logger");

// Create a login rate limiter middleware
const loginLimiter = rateLimit({
  // Set the time window for rate limiting to 1 minute
  windowMs: 60 * 1000,

  // Limit each IP to 5 login requests per `window` per minute
  max: 5,

  // Specify the message to be sent when rate limit is exceeded
  message: {
    message:
      "Too many login attempts from this IP, please try again after a 60-second pause",
  },

  // Custom handler function executed when rate limit is exceeded
  handler: (req, res, next, options) => {
    // Log the event with details using the logEvents function
    logEvents(
      `Too Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
      "errLog.log"
    );

    // Send an HTTP response with the specified status code and message
    res.status(options.statusCode).send(options.message);
  },

  // Return rate limit info in the `RateLimit-*` headers
  standardHeaders: true,

  // Disable the `X-RateLimit-*` headers
  legacyHeaders: false,
});

// Export the login rate limiter middleware for use in other parts of the application
module.exports = loginLimiter;
