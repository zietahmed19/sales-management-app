// server-mongodb.js - Alternative server using MongoDB
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory storage for demo (replace with MongoDB in production)
let sales = [];

// POST: Save a new sale
app.post('/api/sales', (req, res) => {
  try {
    const newSale = req.body;
    sales.push(newSale);
    
    console.log('Sale saved:', newSale);
    res.status(201).json({ 
      message: 'Sale saved successfully',
      sale: newSale 
    });
  } catch (err) {
    console.error('Error saving sale:', err);
    res.status(500).json({ message: 'Failed to save sale' });
  }
});

// GET all sales
app.get('/api/sales', (req, res) => {
  try {
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: 'Could not retrieve sales' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

module.exports = app;
