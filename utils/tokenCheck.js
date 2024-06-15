const User = require('../models/User');

async function tokenCheck(req, res, next) {
  const { apiKey } = req.query;

  if (!apiKey) {
    return res.status(400).json({ error: 'API key is required.' });
  }

  try {
    const user = await User.findOne({ apiKey });

    if (!user) {
      return res.status(404).json({ error: 'Invalid API key.' });
    }

    if (!user.unlimited) {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;

      if (now - user.tokensLastReset.getTime() >= oneDay) {
        user.tokens = 250;
        user.tokensLastReset = now;
        await user.save();
      }

      if (user.tokens <= 0) {
        return res.status(429).json({ error: 'Daily token limit reached. Please try again later.' });
      }

      user.tokens -= 1;
      await user.save();
    }

    req.user = user; // Attach user to request for further use
    next();
  } catch (error) {
    console.error('Error in token check middleware:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}

module.exports = tokenCheck;
