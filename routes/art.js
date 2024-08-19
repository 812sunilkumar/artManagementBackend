const express = require('express');
const router = express.Router();
const Art = require('../models/Art');
const auth = require('../auth');

// Create new art piece
router.post('/', auth, async (req, res) => {
  try {
    const { type } = req.body;
    const art = new Art({
      type,
      createdBy: req.userId,
      timeStarted: new Date(),
    });
    await art.save();
    res.status(201).send(art);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Complete art piece
router.patch('/:id/complete', auth, async (req, res) => {
  try {
    const art = await Art.findOne({ _id: req.params.id, createdBy: req.userId });
    if (!art) {
      return res.status(404).send();
    }
    art.timeCompleted = new Date();
    await art.save();
    res.send(art);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get user's art pieces
router.get('/myart', auth, async (req, res) => {
  try {
    const arts = await Art.find({ createdBy: req.userId });
    res.send(arts);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;