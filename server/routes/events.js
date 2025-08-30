const express = require('express');
const Event = require('../models/Event');
const Vote = require('../models/Vote');

const router = express.Router();

// Get event by voting URL (public access)
router.get('/public/:votingUrl', async (req, res) => {
  try {
    const { votingUrl } = req.params;
    const now = new Date();

    const event = await Event.findOne({
      votingUrl,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found or not active' });
    }

    res.json({ event });

  } catch (error) {
    console.error('Get public event error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get event results by voting URL (public access)
router.get('/public/:votingUrl/results', async (req, res) => {
  try {
    const { votingUrl } = req.params;

    const event = await Event.findOne({ votingUrl });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get vote statistics
    const votes = await Vote.find({ event: event._id });
    
    const voteStats = event.teams.map(team => {
      const teamVotes = votes.filter(vote => vote.team === team.name);
      return {
        name: team.name,
        votes: teamVotes.length,
        percentage: event.totalVotes > 0 ? (teamVotes.length / event.totalVotes * 100).toFixed(2) : 0,
        color: team.color
      };
    });

    res.json({
      event: {
        name: event.name,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        isCurrentlyActive: event.isCurrentlyActive
      },
      voteStats,
      totalVotes: event.totalVotes
    });

  } catch (error) {
    console.error('Get public results error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all public events (for discovery)
router.get('/public', async (req, res) => {
  try {
    const now = new Date();
    
    const publicEvents = await Event.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    })
    .select('name description startDate endDate votingUrl totalVotes')
    .sort({ endDate: 1 });

    res.json({ events: publicEvents });

  } catch (error) {
    console.error('Get public events error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
