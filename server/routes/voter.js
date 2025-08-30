const express = require('express');
const { body, validationResult } = require('express-validator');
const { voterAuth } = require('../middleware/auth');

const Event = require('../models/Event');
const Vote = require('../models/Vote');

const router = express.Router();

// Get active events for voting
router.get('/events', voterAuth, async (req, res) => {
  try {
    const now = new Date();
    
    const activeEvents = await Event.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).sort({ endDate: 1 });

    // Check which events the voter has already voted in
    const votedEvents = await Vote.find({ voter: req.user.userId })
      .distinct('event');

    const eventsWithVoteStatus = activeEvents.map(event => ({
      ...event.toObject(),
      hasVoted: votedEvents.includes(event._id.toString())
    }));

    res.json({ events: eventsWithVoteStatus });

  } catch (error) {
    console.error('Get active events error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get event details for voting
router.get('/events/:eventId', voterAuth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const now = new Date();

    const event = await Event.findOne({
      _id: eventId,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found or not active' });
    }

    // Check if voter has already voted
    const existingVote = await Vote.findOne({
      event: eventId,
      voter: req.user.userId
    });

    if (existingVote) {
      return res.status(400).json({ 
        error: 'You have already voted in this event',
        votedFor: existingVote.team
      });
    }

    res.json({ event });

  } catch (error) {
    console.error('Get event details error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Cast a vote
router.post('/events/:eventId/vote', voterAuth, [
  body('team').trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { eventId } = req.params;
    const { team } = req.body;
    const now = new Date();

    // Check if event is active
    const event = await Event.findOne({
      _id: eventId,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    if (!event) {
      return res.status(400).json({ error: 'Event not found or not active' });
    }

    // Check if team exists in event
    const teamExists = event.teams.some(t => t.name === team);
    if (!teamExists) {
      return res.status(400).json({ error: 'Invalid team selection' });
    }

    // Check if voter has already voted
    const existingVote = await Vote.findOne({
      event: eventId,
      voter: req.user.userId
    });

    if (existingVote) {
      return res.status(400).json({ error: 'You have already voted in this event' });
    }

    // Create vote
    const vote = new Vote({
      event: eventId,
      voter: req.user.userId,
      team,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await vote.save();

    // Update event total votes
    event.totalVotes += 1;
    await event.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`event-${eventId}`).emit('vote-cast', {
      eventId,
      team,
      totalVotes: event.totalVotes
    });

    res.json({
      message: 'Vote cast successfully',
      vote: vote.getVoteDetails()
    });

  } catch (error) {
    console.error('Cast vote error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get vote results for an event (public results)
router.get('/events/:eventId/results', async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get vote statistics
    const votes = await Vote.find({ event: eventId });
    
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
    console.error('Get results error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get voter's voting history
router.get('/history', voterAuth, async (req, res) => {
  try {
    const votes = await Vote.find({ voter: req.user.userId })
      .populate('event', 'name description startDate endDate')
      .sort({ votedAt: -1 });

    const votingHistory = votes.map(vote => ({
      eventName: vote.event.name,
      eventDescription: vote.event.description,
      team: vote.team,
      votedAt: vote.votedAt,
      eventStartDate: vote.event.startDate,
      eventEndDate: vote.event.endDate
    }));

    res.json({ votingHistory });

  } catch (error) {
    console.error('Get voting history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Check if voter has voted in specific event
router.get('/events/:eventId/vote-status', voterAuth, async (req, res) => {
  try {
    const { eventId } = req.params;

    const vote = await Vote.findOne({
      event: eventId,
      voter: req.user.userId
    });

    res.json({
      hasVoted: !!vote,
      votedFor: vote ? vote.team : null,
      votedAt: vote ? vote.votedAt : null
    });

  } catch (error) {
    console.error('Get vote status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
