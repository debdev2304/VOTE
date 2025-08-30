const express = require('express');
const { body, validationResult } = require('express-validator');
const { adminAuth } = require('../middleware/auth');

const Event = require('../models/Event');
const Vote = require('../models/Vote');
const Voter = require('../models/Voter');

const router = express.Router();

// Create new event
router.post('/events', adminAuth, [
  body('name').trim().isLength({ min: 3 }),
  body('description').optional().trim(),
  body('teams').isArray({ min: 2 }),
  body('teams.*.name').trim().isLength({ min: 1 }),
  body('startDate').isISO8601(),
  body('endDate').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, teams, startDate, endDate } = req.body;

    // Check if end date is after start date
    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    const event = new Event({
      name,
      description,
      teams,
      startDate,
      endDate,
      createdBy: req.user.userId
    });

    await event.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('event-created', { event });

    res.status(201).json({
      event,
      message: 'Event created successfully'
    });

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all events created by admin
router.get('/events', adminAuth, async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user.userId })
      .sort({ createdAt: -1 });

    res.json({ events });

  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get event with detailed statistics
router.get('/events/:eventId', adminAuth, async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findOne({
      _id: eventId,
      createdBy: req.user.userId
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get vote statistics
    const votes = await Vote.find({ event: eventId }).populate('voter', 'name email');
    
    const voteStats = event.teams.map(team => {
      const teamVotes = votes.filter(vote => vote.team === team.name);
      return {
        name: team.name,
        votes: teamVotes.length,
        percentage: event.totalVotes > 0 ? (teamVotes.length / event.totalVotes * 100).toFixed(2) : 0,
        color: team.color
      };
    });

    const voterList = votes.map(vote => ({
      voterName: vote.voter.name,
      voterEmail: vote.voter.email,
      team: vote.team,
      votedAt: vote.votedAt
    }));

    res.json({
      event,
      voteStats,
      voterList,
      totalVotes: event.totalVotes
    });

  } catch (error) {
    console.error('Get event stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update event
router.put('/events/:eventId', adminAuth, [
  body('name').optional().trim().isLength({ min: 3 }),
  body('description').optional().trim(),
  body('teams').optional().isArray({ min: 2 }),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { eventId } = req.params;
    const updateData = req.body;

    const event = await Event.findOneAndUpdate(
      { _id: eventId, createdBy: req.user.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('event-updated', { event });

    res.json({
      event,
      message: 'Event updated successfully'
    });

  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete event
router.delete('/events/:eventId', adminAuth, async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findOneAndDelete({
      _id: eventId,
      createdBy: req.user.userId
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Delete all votes for this event
    await Vote.deleteMany({ event: eventId });

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('event-deleted', { eventId });

    res.json({
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all voters
router.get('/voters', adminAuth, async (req, res) => {
  try {
    const voters = await Voter.find()
      .sort({ createdAt: -1 })
      .select('-verificationToken');

    res.json({ voters });

  } catch (error) {
    console.error('Get voters error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update voter verification status
router.patch('/voters/:voterId/verify', adminAuth, [
  body('isVerified').isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { voterId } = req.params;
    const { isVerified } = req.body;

    const voter = await Voter.findByIdAndUpdate(
      voterId,
      { isVerified },
      { new: true }
    ).select('-verificationToken');

    if (!voter) {
      return res.status(404).json({ error: 'Voter not found' });
    }

    res.json({
      voter,
      message: `Voter ${isVerified ? 'verified' : 'unverified'} successfully`
    });

  } catch (error) {
    console.error('Update voter error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get dashboard statistics
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments({ createdBy: req.user.userId });
    const activeEvents = await Event.countDocuments({
      createdBy: req.user.userId,
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });
    const totalVoters = await Voter.countDocuments();
    const verifiedVoters = await Voter.countDocuments({ isVerified: true });
    const totalVotes = await Vote.countDocuments();

    // Get recent events
    const recentEvents = await Event.find({ createdBy: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent votes
    const recentVotes = await Vote.find()
      .populate('event', 'name')
      .populate('voter', 'name email')
      .sort({ votedAt: -1 })
      .limit(10);

    res.json({
      stats: {
        totalEvents,
        activeEvents,
        totalVoters,
        verifiedVoters,
        totalVotes
      },
      recentEvents,
      recentVotes
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
