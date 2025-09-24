import express from 'express';
import { TwitterService } from '../services/twitterService.js';

const router = express.Router();
const twitterService = new TwitterService();

router.post('/analyze', async (req, res) => {
  try {
    const { usernames } = req.body;
    
    if (!usernames || !Array.isArray(usernames)) {
      return res.status(400).json({ error: 'Invalid usernames provided' });
    }
    
    if (usernames.length < 2 || usernames.length > 100) {
      return res.status(400).json({ 
        error: 'Please provide between 2 and 100 usernames' 
      });
    }

    const results = await twitterService.analyzeExperts(usernames);
    res.json(results);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: error.message || 'Analysis failed' 
    });
  }
});

export default router;