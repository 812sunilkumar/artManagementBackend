const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Art = require('../models/Art');
const ArtType = require('../models/ArtType');
const auth = require('../auth');


// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'admin') {
      return res.status(403).send({ error: 'Access denied' });
    }
    next();
  } catch (error) {
    res.status(400).send(error);
  }
};


// Get all unapproved users
router.get('/unapproved-users', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find({ approved: false, role: 'employee' });
    res.send(users);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Approve user
router.patch('/approve-user/:id', auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    );
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Create new art type
router.post('/art-types', auth, isAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    const artType = new ArtType({ name, createdBy: req.userId });
    await artType.save();
    res.status(201).send(artType);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all art types
router.get('/art-types', auth, async (req, res) => {
  try {
    const artTypes = await ArtType.find();
    res.send(artTypes);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Admin creates a new art piece with a time limit
router.post('/art', auth, isAdmin, async (req, res) => {
  try {
    const { title, description, timeLimit } = req.body;
    const newArt = new Art({
      title,
      description,
      timeLimit,
      createdBy: req.user._id // Set the admin who created the art
    });
    await newArt.save();
    res.status(201).json(newArt);
  } catch (error) {
    res.status(500).json({ message: 'Error creating art', error: error.message });
  }
});

// Get all art pieces
router.get('/art', auth, isAdmin, async (req, res) => {
  try {
    const arts = await Art.find().populate('assignedTo', 'username');
    res.json(arts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching art', error: error.message });
  }
});

// Dashboard with detailed metrics
router.get('/dashboard', auth, isAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {
      timeStarted: { $gte: new Date(startDate), $lte: new Date(endDate) }
    };
    
    const artPieces = await Art.find(query).populate('createdBy', 'username');
    const employeeProduction = await Art.aggregate([
      { $match: query },
      { $group: {
        _id: '$createdBy',
        artCount: { $sum: 1 },
        totalTime: {
          $sum: {
            $cond: [
              { $ifNull: ['$timeCompleted', false] },
              { $subtract: ['$timeCompleted', '$timeStarted'] },
              { $subtract: [new Date(), '$timeStarted'] }
            ]
          }
        }
      }},
      { $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }},
      { $unwind: '$user' },
      { $project: {
        username: '$user.username',
        artCount: 1,
        totalTime: 1,
        averageTime: { $divide: ['$totalTime', '$artCount'] }
      }}
    ]);

    res.send({ artPieces, employeeProduction });
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;

