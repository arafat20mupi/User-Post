const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const usersRoutes = require('./routes/users');

app.use('/api', authRoutes);
app.use('/api/posts', postRoutes);
app.use("/api/users", usersRoutes)

app.get('/', async (req, res) => {
  try {
    res.send("Server is running successfully!");
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
});
app.listen(5000, () => console.log('Server running on http://localhost:5000'));
