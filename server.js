// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all origins in production
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://sales-management-frontend.onrender.com', 'https://sales-app-frontend.onrender.com']
    : 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// File paths for data storage
const salesFilePath = path.join(dataDir, 'sales.json');
const clientsFilePath = path.join(__dirname, 'public', 'Data', 'clients.json');
const packsFilePath = path.join(__dirname, 'public', 'Data', 'packs.json');
const representsFilePath = path.join(__dirname, 'public', 'Data', 'represents.json');

// Initialize files if they don't exist
if (!fs.existsSync(salesFilePath)) {
  fs.writeFileSync(salesFilePath, JSON.stringify([]));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve API landing page
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'api-index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({
      message: 'Sales Management API Server',
      status: 'Running',
      endpoints: [
        'GET /api/health',
        'POST /api/auth/login',
        'GET /api/data',
        'GET /api/statistics',
        'POST /api/sales',
        'GET /api/sales'
      ]
    });
  }
});

// Authentication endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Read representatives data
    const representsData = fs.readFileSync(representsFilePath, 'utf8');
    const represents = JSON.parse(representsData);
    
    // Find user
    const user = represents.find(rep => rep.username === username);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // For demo purposes, we'll use simple password check
    // In production, use bcrypt.compare with hashed passwords
    if (password === '123456' || password === user.password) {
      const token = jwt.sign(
        { id: user.iD, username: user.username }, 
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      
      res.json({
        token,
        user: {
          id: user.iD,
          username: user.username,
          RepresentName: user.RepresentName,
          RepCode: user.RepCode,
          City: user.City,
          Wilaya: user.Wilaya
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get application data
app.get('/api/data', (req, res) => {
  try {
    const clients = JSON.parse(fs.readFileSync(clientsFilePath, 'utf8') || '[]');
    const packs = JSON.parse(fs.readFileSync(packsFilePath, 'utf8') || '[]');
    
    res.json({
      clients,
      packs
    });
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ message: 'Error reading data files' });
  }
});

// Get statistics
app.get('/api/statistics', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header' });
    }

    // Read data files
    const sales = JSON.parse(fs.readFileSync(salesFilePath, 'utf8') || '[]');
    const clients = JSON.parse(fs.readFileSync(clientsFilePath, 'utf8') || '[]');
    const packs = JSON.parse(fs.readFileSync(packsFilePath, 'utf8') || '[]');
    
    // Calculate basic statistics
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
    
    res.json({
      delegate: {
        username: 'demo_user',
        wilaya: 'Alger',
        personalStats: {
          totalSales,
          totalRevenue,
          wilayaClients: clients.length
        }
      },
      totalClients: clients.length,
      totalPacks: packs.length,
      recentSales: sales.slice(-10)
    });
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({ message: 'Error calculating statistics' });
  }
});

// POST: Save a new sale
app.post('/api/sales', (req, res) => {
  try {
    const newSale = {
      ...req.body,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };

    // Read existing sales
    let sales = [];
    try {
      const fileContent = fs.readFileSync(salesFilePath, 'utf8');
      sales = JSON.parse(fileContent);
    } catch (err) {
      console.log('Creating new sales file...');
      sales = [];
    }

    // Add new sale
    sales.push(newSale);

    // Write updated list to file
    fs.writeFileSync(salesFilePath, JSON.stringify(sales, null, 2));
    
    console.log(`✅ New sale saved: ID ${newSale.id}`);
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
    const sales = JSON.parse(fs.readFileSync(salesFilePath, 'utf8') || '[]');
    res.json(sales);
  } catch (err) {
    console.error('Error reading sales:', err);
    res.status(500).json({ message: 'Could not read sales data' });
  }
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'build')));

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Sales Management API Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 Data directory: ${dataDir}`);
  console.log(`📊 Sales file: ${salesFilePath}`);
});
