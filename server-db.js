const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

// Data file paths
const dataPath = path.join(__dirname, 'data');
const files = {
  representatives: path.join(dataPath, 'represents.json'),
  clients: path.join(dataPath, 'clients.json'),
  articles: path.join(dataPath, 'articles.json'),
  gifts: path.join(dataPath, 'gifts.json'),
  packs: path.join(dataPath, 'packs.json'),
  sales: path.join(dataPath, 'sales.json')
};

// Helper function to read JSON file
const readJsonFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
};

// Helper function to write JSON file
const writeJsonFile = async (filePath, data) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    return false;
  }
};

// API Routes

// Get all representatives
app.get('/api/representatives', async (req, res) => {
  try {
    const representatives = await readJsonFile(files.representatives);
    res.json(representatives);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch representatives' });
  }
});

// Get all clients
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await readJsonFile(files.clients);
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// Get all articles
app.get('/api/articles', async (req, res) => {
  try {
    const articles = await readJsonFile(files.articles);
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Get all gifts
app.get('/api/gifts', async (req, res) => {
  try {
    const gifts = await readJsonFile(files.gifts);
    res.json(gifts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gifts' });
  }
});

// Get all packs
app.get('/api/packs', async (req, res) => {
  try {
    const packs = await readJsonFile(files.packs);
    res.json(packs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch packs' });
  }
});

// Get all sales
app.get('/api/sales', async (req, res) => {
  try {
    const sales = await readJsonFile(files.sales);
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const representatives = await readJsonFile(files.representatives);
    
    const user = representatives.find(
      rep => rep.username === username && rep.password === password
    );
    
    if (user) {
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json({ success: true, user: userWithoutPassword });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Create new sale
app.post('/api/sales', async (req, res) => {
  try {
    const newSale = req.body;
    const sales = await readJsonFile(files.sales);
    
    // Generate new ID
    const newId = sales.length > 0 ? Math.max(...sales.map(s => s.Id)) + 1 : 1;
    newSale.Id = newId;
    newSale.CreateDate = new Date().toISOString();
    
    sales.push(newSale);
    
    const success = await writeJsonFile(files.sales, sales);
    if (success) {
      res.json({ success: true, sale: newSale });
    } else {
      res.status(500).json({ error: 'Failed to save sale' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to create sale' });
  }
});

// Add new client
app.post('/api/clients', async (req, res) => {
  try {
    const newClient = req.body;
    const clients = await readJsonFile(files.clients);
    
    // Generate new ID
    const existingIds = clients.map(c => parseInt(c.ClientID.substring(1)));
    const newIdNum = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    newClient.ClientID = `C${newIdNum.toString().padStart(3, '0')}`;
    
    clients.push(newClient);
    
    const success = await writeJsonFile(files.clients, clients);
    if (success) {
      res.json({ success: true, client: newClient });
    } else {
      res.status(500).json({ error: 'Failed to save client' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// Get all data (for initial load)
app.get('/api/data', async (req, res) => {
  try {
    const [representatives, clients, articles, gifts, packs, sales] = await Promise.all([
      readJsonFile(files.representatives),
      readJsonFile(files.clients),
      readJsonFile(files.articles),
      readJsonFile(files.gifts),
      readJsonFile(files.packs),
      readJsonFile(files.sales)
    ]);
    
    res.json({
      representatives,
      clients,
      articles,
      gifts,
      packs,
      sales
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Create data directory if it doesn't exist
const initializeDataDirectory = async () => {
  try {
    await fs.mkdir(dataPath, { recursive: true });
    console.log('Data directory created/verified');
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
};

// Start server
app.listen(PORT, async () => {
  await initializeDataDirectory();
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
