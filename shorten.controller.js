const express = require('express');
const { nanoid } = require('nanoid');
const redisClient = require('../utils/cache'); // Ensure Redis client is correctly initialized
const Url = require('../models/url.model'); // Ensure the model is properly imported
const authMiddleware = require('../middlewares/auth.middleware');
const rateLimiter = require('../middlewares/rateLimit.middleware');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { longUrl, customAlias, topic } = req.body;
    const alias = customAlias || nanoid(8);

    const shortUrl = `${req.protocol}://${req.get('host')}/${alias}`;
    const newUrl = await Url.create({
      longUrl,
      shortUrl,
      alias,
      topic,
      userId: req.user.id,
      createdAt: new Date(),
    });

    // Cache short URL
    await redisClient.set(alias, JSON.stringify(newUrl), { EX: 3600 });
    res.json(newUrl);
  } catch (error) {
    console.error('Error creating short URL:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
