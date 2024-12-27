const { RateLimiterMemory } = require('rate-limiter-flexible');

const rateLimiter = new RateLimiterMemory({
  points: 5, // Maximum 5 requests
  duration: 60, // Per minute
});

const rateLimiterMiddleware = (req, res, next) => {
  rateLimiter.consume(req.ip)
    .then(() => next())
    .catch(() => res.status(429).json({ message: 'Too many requests' }));
};

module.exports = rateLimiterMiddleware;
