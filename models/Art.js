const mongoose = require('mongoose');
const artSchema = new mongoose.Schema({
  type: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timeStarted: { type: Date, required: true },
  timeCompleted: { type: Date },
});

module.exports = mongoose.model('Art', artSchema);


// models/Art.js
