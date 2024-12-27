const express = require('express');
const Url = require('../models/url.model');
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();

// GET /analytics/:alias
router.get('/:alias', async (req, res) => {
  const { alias } = req.params;

  const urlData = await Url.findOne({ alias });
  if (!urlData) return res.status(404).json({ message: 'URL not found' });

  // Example analytics data
  const analytics = {
    totalClicks: urlData.clicks,
    uniqueUsers: urlData.uniqueUsers,
    clicksByDate: [], // Replace with logic to calculate clicks by date
  };

  res.json(analytics);
});

router.get('/api/analytics/topic/:topic', authMiddleware, async (req, res) => {
  try {
    const { topic } = req.params;
    const userId = req.user.id;

    // Get all URLs under the specified topic for the authenticated user
    const urls = await Url.findAll({ where: { topic, userId } });

    if (!urls.length) {
      return res.status(404).json({ message: 'No URLs found for this topic' });
    }

    const urlIds = urls.map(url => url.id);

    // Fetch analytics
    const totalClicks = await Analytics.count({ where: { urlId: { [Op.in]: urlIds } } });
    const uniqueUsers = await Analytics.count({ 
      distinct: true, 
      col: 'userId', 
      where: { urlId: { [Op.in]: urlIds } } 
    });

    const clicksByDate = await Analytics.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', '*'), 'clicks']
      ],
      where: { urlId: { [Op.in]: urlIds } },
      group: ['date']
    });

    const urlsAnalytics = await Promise.all(
      urls.map(async (url) => {
        const urlClicks = await Analytics.count({ where: { urlId: url.id } });
        const urlUniqueUsers = await Analytics.count({
          distinct: true,
          col: 'userId',
          where: { urlId: url.id }
        });
        return {
          shortUrl: url.shortUrl,
          totalClicks: urlClicks,
          uniqueUsers: urlUniqueUsers,
        };
      })
    );

    res.json({
      totalClicks,
      uniqueUsers,
      clicksByDate,
      urls: urlsAnalytics,
    });
  } catch (error) {
    console.error('Error fetching topic analytics:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/api/analytics/overall', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all URLs created by the user
    const urls = await Url.findAll({ where: { userId } });

    if (!urls.length) {
      return res.status(404).json({ message: 'No URLs found for this user' });
    }

    const urlIds = urls.map(url => url.id);

    // Fetch overall analytics
    const totalUrls = urls.length;
    const totalClicks = await Analytics.count({ where: { urlId: { [Op.in]: urlIds } } });
    const uniqueUsers = await Analytics.count({ 
      distinct: true, 
      col: 'userId', 
      where: { urlId: { [Op.in]: urlIds } } 
    });

    const clicksByDate = await Analytics.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', '*'), 'clicks']
      ],
      where: { urlId: { [Op.in]: urlIds } },
      group: ['date']
    });

    const osType = await Analytics.findAll({
      attributes: [
        'osName',
        [sequelize.fn('COUNT', '*'), 'uniqueClicks'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('userId'))), 'uniqueUsers']
      ],
      where: { urlId: { [Op.in]: urlIds } },
      group: ['osName']
    });

    const deviceType = await Analytics.findAll({
      attributes: [
        'deviceName',
        [sequelize.fn('COUNT', '*'), 'uniqueClicks'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('userId'))), 'uniqueUsers']
      ],
      where: { urlId: { [Op.in]: urlIds } },
      group: ['deviceName']
    });

    res.json({
      totalUrls,
      totalClicks,
      uniqueUsers,
      clicksByDate,
      osType,
      deviceType,
    });
  } catch (error) {
    console.error('Error fetching overall analytics:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


module.exports = router;
