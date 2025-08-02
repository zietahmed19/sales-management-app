const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://sales-management-app-2ysa.onrender.com'] 
    : ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, 'sales_management.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
const initializeDatabase = () => {
  // Representatives table
  db.run(`CREATE TABLE IF NOT EXISTS representatives (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rep_code TEXT UNIQUE NOT NULL,
    rep_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone TEXT,
    city TEXT,
    wilaya TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Clients table
  db.run(`CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    city TEXT NOT NULL,
    wilaya TEXT,
    phone TEXT NOT NULL,
    location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Articles table
  db.run(`CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Gifts table
  db.run(`CREATE TABLE IF NOT EXISTS gifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gift_name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Packs table
  db.run(`CREATE TABLE IF NOT EXISTS packs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pack_name TEXT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    gift_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gift_id) REFERENCES gifts (id)
  )`);

  // Pack Articles junction table
  db.run(`CREATE TABLE IF NOT EXISTS pack_articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pack_id INTEGER NOT NULL,
    article_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pack_id) REFERENCES packs (id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles (id) ON DELETE CASCADE,
    UNIQUE(pack_id, article_id)
  )`);

  // Sales table
  db.run(`CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    representative_id INTEGER NOT NULL,
    pack_id INTEGER NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients (id),
    FOREIGN KEY (representative_id) REFERENCES representatives (id),
    FOREIGN KEY (pack_id) REFERENCES packs (id)
  )`);

  console.log('✅ Database tables initialized');
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, async (err, user) => {
    if (err) return res.sendStatus(403);
    
    // Check if user is admin (you can modify this logic based on your admin identification)
    // For now, checking if username is 'admin' or rep_code is 'ADMIN'
    try {
      const adminUser = await promiseQuery(
        'SELECT * FROM representatives WHERE id = ? AND (username = ? OR rep_code = ?)',
        [user.id, 'admin', 'ADMIN']
      );
      
      if (adminUser.length === 0) {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      req.user = user;
      next();
    } catch (error) {
      return res.sendStatus(500);
    }
  });
};

// Helper functions
const promiseQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const promiseRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// AUTH ROUTES
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await promiseQuery(
      'SELECT * FROM representatives WHERE username = ?',
      [username]
    );

    if (user.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user[0].password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        id: user[0].id, 
        username: user[0].username,
        rep_code: user[0].rep_code,
        wilaya: user[0].wilaya
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password_hash, ...userWithoutPassword } = user[0];
    res.json({ 
      token, 
      user: {
        id: userWithoutPassword.id,
        rep_name: userWithoutPassword.rep_name,
        rep_code: userWithoutPassword.rep_code,
        RepCode: userWithoutPassword.rep_code,
        username: userWithoutPassword.username,
        Phone: userWithoutPassword.phone,
        City: userWithoutPassword.city,
        wilaya: userWithoutPassword.wilaya,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// REPRESENTATIVES ROUTES
app.get('/api/representatives', async (req, res) => {
  try {
    const representatives = await promiseQuery(`
      SELECT id as iD, rep_name as RepresentName, rep_code as RepCode, 
             username, phone as Phone, city as City, wilaya as Wilaya
      FROM representatives
    `);
    res.json(representatives);
  } catch (error) {
    console.error('Error fetching representatives:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/representatives/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { RepresentName, Phone, City, Wilaya } = req.body;

    await promiseRun(`
      UPDATE representatives 
      SET rep_name = ?, phone = ?, city = ?, wilaya = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [RepresentName, Phone, City, Wilaya, id]);

    res.json({ message: 'Representative updated successfully' });
  } catch (error) {
    console.error('Error updating representative:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// CLIENTS ROUTES - Territory filtered
app.get('/api/clients', authenticateToken, async (req, res) => {
  try {
    // Get the current user's wilaya
    const currentUser = await promiseQuery(
      'SELECT wilaya FROM representatives WHERE id = ?',
      [req.user.id]
    );
    
    if (currentUser.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userWilaya = currentUser[0].wilaya;
    
    // Filter clients by delegate's wilaya
    const clients = await promiseQuery(`
      SELECT id, client_id as ClientID, full_name as FullName, city as City, 
             wilaya as Wilaya, phone as AllPhones, location as Location
      FROM clients
      WHERE wilaya = ?
      ORDER BY full_name
    `, [userWilaya]);
    
    console.log(`📍 Delegate ${req.user.username} (${userWilaya}) accessed ${clients.length} clients`);
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/clients', authenticateToken, async (req, res) => {
  try {
    const { FullName, City, Wilaya, AllPhones, Location } = req.body;
    
    // Get the current user's wilaya to validate territory
    const currentUser = await promiseQuery(
      'SELECT wilaya FROM representatives WHERE id = ?',
      [req.user.id]
    );
    
    if (currentUser.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userWilaya = currentUser[0].wilaya;
    
    // Validate that the client's wilaya matches delegate's territory
    if (Wilaya && Wilaya !== userWilaya) {
      return res.status(403).json({ 
        message: `You can only add clients in your assigned territory: ${userWilaya}` 
      });
    }
    
    // Generate client ID
    const lastClient = await promiseQuery('SELECT MAX(id) as max_id FROM clients');
    const nextId = (lastClient[0].max_id || 0) + 1;
    const clientId = `C${nextId.toString().padStart(3, '0')}`;

    await promiseRun(`
      INSERT INTO clients (client_id, full_name, city, wilaya, phone, location)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [clientId, FullName, City, Wilaya || userWilaya, AllPhones, Location || '']);

    console.log(`➕ Delegate ${req.user.username} added client ${FullName} in ${userWilaya}`);
    res.status(201).json({ message: 'Client created successfully', clientId });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/clients/:clientId', authenticateToken, async (req, res) => {
  try {
    const { clientId } = req.params;
    const { FullName, City, Wilaya, AllPhones, Location } = req.body;

    await promiseRun(`
      UPDATE clients 
      SET full_name = ?, city = ?, wilaya = ?, phone = ?, location = ?, updated_at = CURRENT_TIMESTAMP
      WHERE client_id = ?
    `, [FullName, City, Wilaya || '', AllPhones, Location || '', clientId]);

    res.json({ message: 'Client updated successfully' });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ARTICLES ROUTES
app.get('/api/articles', async (req, res) => {
  try {
    const articles = await promiseQuery(`
      SELECT id, name, price, description
      FROM articles
      ORDER BY name
    `);
    
    // Return articles with both naming conventions for compatibility
    const formattedArticles = articles.map(article => ({
      id: article.id,
      Id: article.id,
      name: article.name,
      Name: article.name,
      price: article.price,
      Price: article.price,
      description: article.description
    }));
    
    res.json(formattedArticles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GIFTS ROUTES
app.get('/api/gifts', async (req, res) => {
  try {
    const gifts = await promiseQuery(`
      SELECT id, gift_name, description
      FROM gifts
      ORDER BY gift_name
    `);
    
    // Return gifts with both naming conventions for compatibility
    const formattedGifts = gifts.map(gift => ({
      id: gift.id,
      Id: gift.id,
      gift_name: gift.gift_name,
      GiftName: gift.gift_name,
      description: gift.description,
      Description: gift.description
    }));
    
    res.json(formattedGifts);
  } catch (error) {
    console.error('Error fetching gifts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PACKS ROUTES
app.get('/api/packs', async (req, res) => {
  try {
    // Get packs with their articles and gifts
    const packs = await promiseQuery(`
      SELECT p.id, p.pack_name, p.total_price,
             g.id as gift_id, g.gift_name, g.description as gift_description
      FROM packs p
      LEFT JOIN gifts g ON p.gift_id = g.id
      ORDER BY p.pack_name
    `);

    // Get articles for each pack
    const packsWithArticles = await Promise.all(
      packs.map(async (pack) => {
        const articles = await promiseQuery(`
          SELECT a.id, a.name, a.price
          FROM articles a
          JOIN pack_articles pa ON a.id = pa.article_id
          WHERE pa.pack_id = ?
        `, [pack.id]);

        return {
          id: pack.id,
          Id: pack.id,
          pack_name: pack.pack_name,
          PackName: pack.pack_name,
          total_price: pack.total_price,
          TotalPackPrice: pack.total_price,
          articles,
          gift: pack.gift_id ? {
            id: pack.gift_id,
            gift_name: pack.gift_name,
            description: pack.gift_description
          } : null,
          Gift: pack.gift_id ? {
            Id: pack.gift_id,
            GiftName: pack.gift_name,
            Description: pack.gift_description
          } : null
        };
      })
    );

    res.json(packsWithArticles);
  } catch (error) {
    console.error('Error fetching packs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/packs', authenticateToken, async (req, res) => {
  try {
    const { PackName, TotalPackPrice, articles, Gift } = req.body;

    // Insert pack
    const result = await promiseRun(`
      INSERT INTO packs (pack_name, total_price, gift_id)
      VALUES (?, ?, ?)
    `, [PackName, TotalPackPrice, Gift ? Gift.Id : null]);

    const packId = result.id;

    // Insert pack articles
    for (const article of articles) {
      await promiseRun(`
        INSERT INTO pack_articles (pack_id, article_id)
        VALUES (?, ?)
      `, [packId, article.Id]);
    }

    res.status(201).json({ message: 'Pack created successfully', packId });
  } catch (error) {
    console.error('Error creating pack:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/packs/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { PackName, TotalPackPrice, articles, Gift } = req.body;

    // Update pack
    await promiseRun(`
      UPDATE packs 
      SET pack_name = ?, total_price = ?, gift_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [PackName, TotalPackPrice, Gift ? Gift.Id : null, id]);

    // Delete existing pack articles
    await promiseRun('DELETE FROM pack_articles WHERE pack_id = ?', [id]);

    // Insert new pack articles
    for (const article of articles) {
      await promiseRun(`
        INSERT INTO pack_articles (pack_id, article_id)
        VALUES (?, ?)
      `, [id, article.Id]);
    }

    res.json({ message: 'Pack updated successfully' });
  } catch (error) {
    console.error('Error updating pack:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// SALES ROUTES - Personal sales only
app.get('/api/sales', authenticateToken, async (req, res) => {
  try {
    // Only show sales made by the current delegate
    const sales = await promiseQuery(`
      SELECT 
        s.id,
        s.total_price as totalPrice,
        s.sale_date as createDate,
        c.client_id as clientID,
        c.full_name as client_name,
        c.city as client_city,
        c.wilaya as client_wilaya,
        c.phone as client_phone,
        c.location as client_location,
        r.id as representID,
        r.rep_name as rep_name,
        r.rep_code as rep_code,
        r.phone as rep_phone,
        r.city as rep_city,
        r.wilaya as rep_wilaya,
        p.id as packID,
        p.pack_name as pack_name,
        p.total_price as pack_price,
        g.id as gift_id,
        g.gift_name as gift_name,
        g.description as gift_description
      FROM sales s
      JOIN clients c ON s.client_id = c.id
      JOIN representatives r ON s.representative_id = r.id
      JOIN packs p ON s.pack_id = p.id
      LEFT JOIN gifts g ON p.gift_id = g.id
      WHERE s.representative_id = ?
      ORDER BY s.sale_date DESC
    `, [req.user.id]);

    // Format the response to match frontend expectations
    const formattedSales = await Promise.all(
      sales.map(async (sale) => {
        // Get pack articles
        const articles = await promiseQuery(`
          SELECT a.id as Id, a.name as Name, a.price as Price
          FROM articles a
          JOIN pack_articles pa ON a.id = pa.article_id
          WHERE pa.pack_id = ?
        `, [sale.packID]);

        return {
          id: sale.id,
          createDate: sale.createDate,
          clientID: sale.clientID,
          client: {
            ClientID: sale.clientID,
            FullName: sale.client_name,
            City: sale.client_city,
            Wilaya: sale.client_wilaya,
            AllPhones: sale.client_phone,
            Location: sale.client_location
          },
          representID: sale.representID,
          packID: sale.packID,
          pack: {
            Id: sale.packID,
            PackName: sale.pack_name,
            TotalPackPrice: sale.pack_price,
            articles,
            Gift: sale.gift_id ? {
              Id: sale.gift_id,
              GiftName: sale.gift_name,
              Description: sale.gift_description
            } : null
          },
          represent: {
            iD: sale.representID,
            RepresentName: sale.rep_name,
            RepCode: sale.rep_code,
            Phone: sale.rep_phone,
            City: sale.rep_city,
            Wilaya: sale.rep_wilaya
          },
          totalPrice: sale.totalPrice
        };
      })
    );

    console.log(`📊 Delegate ${req.user.username} accessed ${formattedSales.length} personal sales`);
    res.json(formattedSales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/sales', authenticateToken, async (req, res) => {
  try {
    const { client_id, rep_id, pack_id, total_amount } = req.body;

    // Get client internal ID and verify wilaya access
    let clientDbId = client_id;
    let clientWilaya = null;
    
    if (typeof client_id === 'string' && client_id.startsWith('C')) {
      const client = await promiseQuery('SELECT id, wilaya FROM clients WHERE client_id = ?', [client_id]);
      if (client.length === 0) {
        return res.status(400).json({ message: 'Client not found' });
      }
      clientDbId = client[0].id;
      clientWilaya = client[0].wilaya;
    } else {
      const client = await promiseQuery('SELECT wilaya FROM clients WHERE id = ?', [client_id]);
      if (client.length === 0) {
        return res.status(400).json({ message: 'Client not found' });
      }
      clientWilaya = client[0].wilaya;
    }

    // Verify client belongs to delegate's wilaya
    if (clientWilaya !== req.user.wilaya) {
      return res.status(403).json({ 
        message: `Access denied. Client is in ${clientWilaya}, you can only create sales in ${req.user.wilaya}` 
      });
    }

    const result = await promiseRun(`
      INSERT INTO sales (client_id, representative_id, pack_id, total_price)
      VALUES (?, ?, ?, ?)
    `, [clientDbId, req.user.id, pack_id, total_amount]);

    console.log(`💰 Sale created by delegate ${req.user.username} in ${req.user.wilaya}: Client ${client_id}, Pack ${pack_id}, Price ${total_amount}`);

    res.status(201).json({ 
      message: 'Sale created successfully', 
      saleId: result.id 
    });
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all sales across all delegates
app.get('/api/admin/sales', authenticateAdmin, async (req, res) => {
  try {
    const allSales = await promiseQuery(`
      SELECT 
        s.id,
        s.total_price as totalPrice,
        s.sale_date as createDate,
        c.client_id as clientID,
        c.full_name as client_name,
        c.city as client_city,
        c.wilaya as client_wilaya,
        r.id as representID,
        r.rep_name as rep_name,
        r.rep_code as rep_code,
        r.wilaya as rep_wilaya,
        p.id as packID,
        p.pack_name as pack_name,
        p.total_price as pack_price
      FROM sales s
      JOIN clients c ON s.client_id = c.id
      JOIN representatives r ON s.representative_id = r.id
      JOIN packs p ON s.pack_id = p.id
      ORDER BY s.sale_date DESC
    `);

    const formattedSales = allSales.map(sale => ({
      id: sale.id,
      createDate: sale.createDate,
      clientID: sale.clientID,
      client: {
        ClientID: sale.clientID,
        FullName: sale.client_name,
        City: sale.client_city,
        Wilaya: sale.client_wilaya
      },
      representID: sale.representID,
      represent: {
        iD: sale.representID,
        RepresentName: sale.rep_name,
        RepCode: sale.rep_code,
        Wilaya: sale.rep_wilaya
      },
      packID: sale.packID,
      pack: {
        Id: sale.packID,
        PackName: sale.pack_name,
        TotalPackPrice: sale.pack_price
      },
      totalPrice: sale.totalPrice
    }));

    console.log(`🔐 Admin accessed all sales: ${formattedSales.length} records`);
    res.json(formattedSales);
  } catch (error) {
    console.error('Error fetching admin sales:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get aggregated statistics
app.get('/api/admin/statistics', authenticateAdmin, async (req, res) => {
  try {
    // Total sales across all delegates
    const totalSales = await promiseQuery(`
      SELECT 
        COUNT(*) as totalSalesCount,
        COALESCE(SUM(total_price), 0) as totalRevenue
      FROM sales
    `);

    // Total clients and representatives
    const counts = await promiseQuery(`
      SELECT 
        (SELECT COUNT(*) FROM clients) as totalClients,
        (SELECT COUNT(*) FROM representatives) as totalRepresentatives,
        (SELECT COUNT(*) FROM packs) as totalPacks
    `);

    // Revenue per delegate
    const revenuePerDelegate = await promiseQuery(`
      SELECT 
        r.id,
        r.rep_name as name,
        r.rep_code as code,
        r.wilaya,
        COUNT(s.id) as salesCount,
        COALESCE(SUM(s.total_price), 0) as revenue
      FROM representatives r
      LEFT JOIN sales s ON r.id = s.representative_id
      GROUP BY r.id, r.rep_name, r.rep_code, r.wilaya
      ORDER BY revenue DESC
    `);

    // Monthly sales trend
    const monthlySales = await promiseQuery(`
      SELECT 
        strftime('%Y-%m', sale_date) as month,
        COUNT(*) as salesCount,
        COALESCE(SUM(total_price), 0) as revenue
      FROM sales 
      GROUP BY strftime('%Y-%m', sale_date)
      ORDER BY month DESC
      LIMIT 12
    `);

    // Top performing wilayas
    const wilayaPerformance = await promiseQuery(`
      SELECT 
        r.wilaya,
        COUNT(s.id) as salesCount,
        COALESCE(SUM(s.total_price), 0) as revenue,
        COUNT(DISTINCT r.id) as delegateCount
      FROM representatives r
      LEFT JOIN sales s ON r.id = s.representative_id
      GROUP BY r.wilaya
      ORDER BY revenue DESC
    `);

    // Top selling packs
    const topPacks = await promiseQuery(`
      SELECT 
        p.pack_name,
        COUNT(s.id) as salesCount,
        COALESCE(SUM(s.total_price), 0) as revenue
      FROM packs p
      LEFT JOIN sales s ON p.id = s.pack_id
      GROUP BY p.id, p.pack_name
      ORDER BY salesCount DESC
      LIMIT 10
    `);

    const adminStatistics = {
      overview: {
        totalSales: totalSales[0].totalSalesCount,
        totalRevenue: totalSales[0].totalRevenue,
        totalClients: counts[0].totalClients,
        totalRepresentatives: counts[0].totalRepresentatives,
        totalPacks: counts[0].totalPacks,
        averageRevenuePerDelegate: counts[0].totalRepresentatives > 0 
          ? (totalSales[0].totalRevenue / counts[0].totalRepresentatives).toFixed(2)
          : 0
      },
      revenuePerDelegate: revenuePerDelegate.map(delegate => ({
        id: delegate.id,
        name: delegate.name,
        code: delegate.code,
        wilaya: delegate.wilaya,
        salesCount: delegate.salesCount,
        revenue: delegate.revenue
      })),
      monthlySales: monthlySales.map(month => ({
        month: month.month,
        salesCount: month.salesCount,
        revenue: month.revenue
      })),
      wilayaPerformance: wilayaPerformance.map(wilaya => ({
        wilaya: wilaya.wilaya,
        salesCount: wilaya.salesCount,
        revenue: wilaya.revenue,
        delegateCount: wilaya.delegateCount
      })),
      topPacks: topPacks.map(pack => ({
        packName: pack.pack_name,
        salesCount: pack.salesCount,
        revenue: pack.revenue
      }))
    };

    console.log(`📊 Admin statistics accessed: ${totalSales[0].totalSalesCount} total sales, ${totalSales[0].totalRevenue} DA total revenue`);
    res.json(adminStatistics);
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all representatives with their performance
app.get('/api/admin/representatives', authenticateAdmin, async (req, res) => {
  try {
    const representativesWithStats = await promiseQuery(`
      SELECT 
        r.id as iD,
        r.rep_name as RepresentName,
        r.rep_code as RepCode,
        r.username,
        r.phone as Phone,
        r.city as City,
        r.wilaya as Wilaya,
        COUNT(s.id) as totalSales,
        COALESCE(SUM(s.total_price), 0) as totalRevenue,
        COUNT(DISTINCT c.id) as clientsInTerritory
      FROM representatives r
      LEFT JOIN sales s ON r.id = s.representative_id
      LEFT JOIN clients c ON r.wilaya = c.wilaya
      GROUP BY r.id, r.rep_name, r.rep_code, r.username, r.phone, r.city, r.wilaya
      ORDER BY totalRevenue DESC
    `);

    console.log(`👥 Admin accessed representatives data: ${representativesWithStats.length} delegates`);
    res.json(representativesWithStats);
  } catch (error) {
    console.error('Error fetching admin representatives:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all clients across all territories
app.get('/api/admin/clients', authenticateAdmin, async (req, res) => {
  try {
    const allClients = await promiseQuery(`
      SELECT 
        c.id,
        c.client_id as ClientID,
        c.full_name as FullName,
        c.city as City,
        c.wilaya as Wilaya,
        c.phone as AllPhones,
        c.location as Location,
        COUNT(s.id) as totalPurchases,
        COALESCE(SUM(s.total_price), 0) as totalSpent,
        r.rep_name as assignedDelegate
      FROM clients c
      LEFT JOIN sales s ON c.id = s.client_id
      LEFT JOIN representatives r ON c.wilaya = r.wilaya
      GROUP BY c.id, c.client_id, c.full_name, c.city, c.wilaya, c.phone, c.location, r.rep_name
      ORDER BY totalSpent DESC
    `);

    console.log(`👤 Admin accessed all clients: ${allClients.length} clients`);
    res.json(allClients);
  } catch (error) {
    console.error('Error fetching admin clients:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Create admin user (for initial setup)
app.post('/api/admin/create-admin', async (req, res) => {
  try {
    const { username, password, rep_name } = req.body;
    
    // Check if admin already exists
    const existingAdmin = await promiseQuery(
      'SELECT * FROM representatives WHERE username = ? OR rep_code = ?',
      [username, 'ADMIN']
    );
    
    if (existingAdmin.length > 0) {
      return res.status(400).json({ message: 'Admin user already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await promiseRun(`
      INSERT INTO representatives (rep_code, rep_name, username, password_hash, phone, city, wilaya)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['ADMIN', rep_name || 'System Administrator', username, hashedPassword, '', 'Admin', 'ADMIN']);

    console.log(`🔐 Admin user created: ${username}`);
    res.status(201).json({ message: 'Admin user created successfully' });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'COMPREHENSIVE SQLite Server is running', 
    timestamp: new Date().toISOString(),
    database: 'SQLite Connected',
    server: 'server-db.js',
    features: ['1306 clients', '27 delegates', 'SQLite database']
  });
});

// Get delegate credentials for testing (development only)
app.get('/api/delegates-list', async (req, res) => {
  try {
    const delegates = await promiseQuery(`
      SELECT username, rep_name, rep_code, city, wilaya
      FROM representatives
      ORDER BY wilaya, rep_name
    `);
    
    const delegateList = delegates.map((delegate, index) => ({
      id: index + 1,
      username: delegate.username,
      password: '123456', // All delegates have the same password
      name: delegate.rep_name,
      code: delegate.rep_code,
      city: delegate.city,
      wilaya: delegate.wilaya,
      territory: `${delegate.city}, ${delegate.wilaya}`
    }));
    
    res.json({
      message: 'Delegate credentials for testing',
      loginUrl: 'http://localhost:3000',
      totalDelegates: delegateList.length,
      delegates: delegateList,
      note: 'All delegates use password: 123456',
      instructions: [
        '1. Go to http://localhost:3000',
        '2. Login with any username below and password: 123456',
        '3. Each delegate will see ONLY their personal statistics',
        '4. Check the browser console for detailed logging',
        '5. Check the server terminal for backend logging'
      ]
    });
  } catch (error) {
    console.error('Error fetching delegates list:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test endpoint to demonstrate personal statistics for different delegates
app.get('/api/test-personal-stats', async (req, res) => {
  try {
    const delegates = await promiseQuery(`
      SELECT id, username, rep_name, wilaya
      FROM representatives
      ORDER BY id
      LIMIT 5
    `);
    
    const statsComparison = [];
    
    for (const delegate of delegates) {
      // Get personal sales for this delegate
      const personalSales = await promiseQuery(`
        SELECT COUNT(*) as salesCount, COALESCE(SUM(total_price), 0) as totalRevenue
        FROM sales WHERE representative_id = ?
      `, [delegate.id]);
      
      // Get clients in this delegate's territory
      const territoryClients = await promiseQuery(`
        SELECT COUNT(*) as clientCount
        FROM clients WHERE wilaya = ?
      `, [delegate.wilaya]);
      
      statsComparison.push({
        delegate: delegate.rep_name,
        username: delegate.username,
        territory: delegate.wilaya,
        personalSales: personalSales[0].salesCount,
        personalRevenue: personalSales[0].totalRevenue,
        territoryClients: territoryClients[0].clientCount
      });
    }
    
    res.json({
      message: 'Personal Statistics Comparison - Each delegate sees ONLY their own data',
      comparison: statsComparison,
      explanation: 'When each delegate logs in, they only see their personal sales and territory clients'
    });
  } catch (error) {
    console.error('Error generating test stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Personal delegate statistics endpoint
app.get('/api/statistics', authenticateToken, async (req, res) => {
  try {
    const delegateWilaya = req.user.wilaya;
    const delegateId = req.user.id;
    
    console.log(`🎯 PERSONAL STATISTICS REQUEST:`);
    console.log(`   Delegate: ${req.user.username}`);
    console.log(`   ID: ${delegateId}`);
    console.log(`   Territory: ${delegateWilaya}`);
    console.log(`   ================================`);
    
    // Personal sales count and total revenue
    const personalSales = await promiseQuery(`
      SELECT 
        COUNT(*) as salesCount,
        COALESCE(SUM(total_price), 0) as totalRevenue
      FROM sales 
      WHERE representative_id = ?
    `, [delegateId]);
    
    console.log(`   📊 Personal Sales: ${personalSales[0].salesCount} sales, ${personalSales[0].totalRevenue} DA`);
    
    // Clients in delegate's wilaya
    const wilayaClients = await promiseQuery(`
      SELECT COUNT(*) as clientCount
      FROM clients 
      WHERE wilaya = ?
    `, [delegateWilaya]);
    
    console.log(`   👥 Territory Clients: ${wilayaClients[0].clientCount} clients in ${delegateWilaya}`);
    
    // Monthly sales breakdown for the delegate
    const monthlySales = await promiseQuery(`
      SELECT 
        strftime('%Y-%m', sale_date) as month,
        COUNT(*) as salesCount,
        COALESCE(SUM(total_price), 0) as revenue
      FROM sales 
      WHERE representative_id = ?
      GROUP BY strftime('%Y-%m', sale_date)
      ORDER BY month DESC
      LIMIT 12
    `, [delegateId]);
    
    // Top packs sold by this delegate
    const topPacks = await promiseQuery(`
      SELECT 
        p.pack_name,
        COUNT(s.id) as salesCount,
        COALESCE(SUM(s.total_price), 0) as revenue
      FROM sales s
      JOIN packs p ON s.pack_id = p.id
      WHERE s.representative_id = ?
      GROUP BY p.id, p.pack_name
      ORDER BY salesCount DESC
      LIMIT 5
    `, [delegateId]);
    
    // Recent sales activity
    const recentSales = await promiseQuery(`
      SELECT 
        s.sale_date,
        c.full_name as client_name,
        p.pack_name,
        s.total_price
      FROM sales s
      JOIN clients c ON s.client_id = c.id
      JOIN packs p ON s.pack_id = p.id
      WHERE s.representative_id = ?
      ORDER BY s.sale_date DESC
      LIMIT 5
    `, [delegateId]);

    const statistics = {
      delegate: {
        username: req.user.username,
        wilaya: delegateWilaya,
        personalStats: {
          totalSales: personalSales[0].salesCount,
          totalRevenue: personalSales[0].totalRevenue,
          wilayaClients: wilayaClients[0].clientCount
        }
      },
      monthlySales: monthlySales.map(row => ({
        month: row.month,
        salesCount: row.salesCount,
        revenue: row.revenue
      })),
      topPacks: topPacks.map(row => ({
        packName: row.pack_name,
        salesCount: row.salesCount,
        revenue: row.revenue
      })),
      recentActivity: recentSales.map(row => ({
        date: row.sale_date,
        clientName: row.client_name,
        packName: row.pack_name,
        amount: row.total_price
      }))
    };

    console.log(`📈 Statistics accessed by delegate ${req.user.username} (${delegateWilaya}): ${personalSales[0].salesCount} sales, ${personalSales[0].totalRevenue} DA revenue`);
    res.json(statistics);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Enhanced Sales Report Endpoint
app.get('/api/sales/enhanced-report', authenticateToken, async (req, res) => {
  try {
    const delegateWilaya = req.user.wilaya;
    const timeframe = req.query.timeframe || 'month';
    
    // Calculate date range based on timeframe
    const now = new Date();
    let dateFilter = '';
    
    switch (timeframe) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = `AND s.created_at >= '${weekAgo.toISOString()}'`;
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = `AND s.created_at >= '${monthAgo.toISOString()}'`;
        break;
      case 'year':
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        dateFilter = `AND s.created_at >= '${yearAgo.toISOString()}'`;
        break;
    }

    // Enhanced summary statistics
    const summaryQuery = `
      SELECT 
        COUNT(*) as totalSales,
        SUM(s.total_amount) as totalRevenue,
        COUNT(DISTINCT s.client_id) as uniqueClients,
        AVG(s.total_amount) as averageOrderValue,
        COUNT(CASE WHEN s.created_at >= datetime('now', '-30 days') THEN 1 END) as recentSales,
        COUNT(CASE WHEN s.created_at >= datetime('now', '-60 days') AND s.created_at < datetime('now', '-30 days') THEN 1 END) as previousPeriodSales
      FROM sales s
      JOIN clients c ON s.client_id = c.ClientID
      WHERE c.Wilaya = ? ${dateFilter}
    `;

    const summary = db.prepare(summaryQuery).get(delegateWilaya);

    // Calculate growth rate
    const growthRate = summary.previousPeriodSales > 0 
      ? ((summary.recentSales - summary.previousPeriodSales) / summary.previousPeriodSales * 100).toFixed(1)
      : 100;

    // Daily statistics for charts
    const dailyStatsQuery = `
      SELECT 
        DATE(s.created_at) as date,
        COUNT(*) as sales,
        SUM(s.total_amount) as revenue
      FROM sales s
      JOIN clients c ON s.client_id = c.ClientID
      WHERE c.Wilaya = ? ${dateFilter}
      GROUP BY DATE(s.created_at)
      ORDER BY date DESC
      LIMIT 7
    `;

    const dailyStats = db.prepare(dailyStatsQuery).all(delegateWilaya);

    // Top performing packs with enhanced metrics
    const topPacksQuery = `
      SELECT 
        p.PackName as name,
        COUNT(*) as count,
        SUM(s.total_amount) as revenue,
        AVG(s.total_amount) as avgValue
      FROM sales s
      JOIN clients c ON s.client_id = c.ClientID
      JOIN packs p ON s.pack_id = p.Id
      WHERE c.Wilaya = ? ${dateFilter}
      GROUP BY p.Id, p.PackName
      ORDER BY revenue DESC
      LIMIT 5
    `;

    const topPacks = db.prepare(topPacksQuery).all(delegateWilaya);

    // Client engagement metrics
    const clientMetricsQuery = `
      SELECT 
        COUNT(DISTINCT s.client_id) as activeClients,
        COUNT(*) / COUNT(DISTINCT s.client_id) as avgOrdersPerClient,
        MAX(s.created_at) as lastSaleDate
      FROM sales s
      JOIN clients c ON s.client_id = c.ClientID
      WHERE c.Wilaya = ? ${dateFilter}
    `;

    const clientMetrics = db.prepare(clientMetricsQuery).get(delegateWilaya);

    const enhancedReport = {
      summary: {
        totalSales: summary.totalSales || 0,
        totalRevenue: summary.totalRevenue || 0,
        uniqueClients: summary.uniqueClients || 0,
        averageOrderValue: summary.averageOrderValue || 0,
        salesGrowth: parseFloat(growthRate),
        conversionRate: clientMetrics.activeClients > 0 
          ? ((summary.totalSales / clientMetrics.activeClients) * 100).toFixed(1)
          : 0
      },
      dailyStats: dailyStats.map(stat => [stat.date, {
        sales: stat.sales,
        revenue: stat.revenue
      }]),
      topPacks: topPacks.map(pack => ({
        name: pack.name,
        count: pack.count,
        revenue: pack.revenue,
        avgValue: pack.avgValue
      })),
      trends: {
        salesTrend: growthRate > 0 ? 'up' : 'down',
        revenueTrend: 'up', // Could be calculated based on revenue comparison
        clientTrend: 'up'   // Could be calculated based on client acquisition
      },
      metrics: {
        activeClients: clientMetrics.activeClients || 0,
        avgOrdersPerClient: clientMetrics.avgOrdersPerClient || 0,
        lastSaleDate: clientMetrics.lastSaleDate
      }
    };

    console.log(`📈 Enhanced report generated for ${req.user.username} (${delegateWilaya}) - Timeframe: ${timeframe}`);
    res.json(enhancedReport);
  } catch (error) {
    console.error('Error generating enhanced sales report:', error);
    res.status(500).json({ message: 'Server error generating enhanced report' });
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

// Initialize database and start server
initializeDatabase();

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${dbPath}`);
});

module.exports = app;
