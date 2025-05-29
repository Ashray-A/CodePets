const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Pet = require('../models/Pet');

const router = express.Router();

// GitHub OAuth initiation - redirect to GitHub
router.get('/github', (req, res) => {
  const githubAuthURL = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.FRONTEND_URL}/auth/callback&scope=user:email,read:user,repo`;
  res.redirect(githubAuthURL);
});

// GitHub OAuth callback
router.post('/github', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required' });
    }    // Exchange code for access token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code: code
    }, {
      headers: {
        'Accept': 'application/json'
      }
    });

    // Check for GitHub OAuth errors
    if (tokenResponse.data.error) {
      console.error('GitHub OAuth error:', tokenResponse.data);
      return res.status(400).json({ 
        message: `GitHub OAuth error: ${tokenResponse.data.error_description || tokenResponse.data.error}`,
        githubError: tokenResponse.data.error
      });
    }

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      console.error('No access token in response:', tokenResponse.data);
      return res.status(400).json({ message: 'Failed to get access token from GitHub' });
    }

    // Get user data from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${accessToken}`
      }
    });

    const githubUser = userResponse.data;

    // Check if user exists, create if not
    let user = await User.findOne({ githubId: githubUser.id.toString() });
    
    if (!user) {
      user = new User({
        githubId: githubUser.id.toString(),
        username: githubUser.login,
        email: githubUser.email || `${githubUser.login}@github.local`,
        avatarUrl: githubUser.avatar_url,
        githubUrl: githubUser.html_url,
        accessToken: accessToken
      });
      
      await user.save();

      // Create initial pet for new user
      const pet = new Pet({
        userId: user._id,
        name: `${githubUser.login}'s Pet`
      });
      
      await pet.save();
    } else {
      // Update existing user's token and last active
      user.accessToken = accessToken;
      await user.updateActivity();
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, githubId: user.githubId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        githubUrl: user.githubUrl,
        joinedAt: user.joinedAt,
        totalCommits: user.totalCommits,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak
      }
    });

  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.status(500).json({ 
      message: 'Authentication failed', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    await user.updateActivity();

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        githubUrl: user.githubUrl,
        joinedAt: user.joinedAt,
        totalCommits: user.totalCommits,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
