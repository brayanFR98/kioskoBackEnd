const express = require('express');
const dotenv = require('dotenv');
const userRoutes = require('./routes/user');
const feedRoutes = require('./routes/feed');
const db = require('./db');

const cors = require('cors');
dotenv.config();
const app = express();


// Configura CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, 
}));

app.use(express.json());

// Rutas
app.use('/api', userRoutes);
app.use('/api', feedRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
