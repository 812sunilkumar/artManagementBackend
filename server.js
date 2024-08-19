const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const userRoutes = require('./routes/users');
const artRoutes = require('./routes/art');
const adminRoutes = require('./routes/admin');




const app = express();

app.use(cors());
app.use(express.json());
// routes setup
app.use('/api/users', userRoutes);
app.use('/api/art', artRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
