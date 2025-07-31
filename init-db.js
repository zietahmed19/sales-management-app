const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.join(__dirname, 'sales_management.db');
const db = new sqlite3.Database(dbPath);

const initializeData = async () => {
  console.log('🔄 Initializing database with sample data...');

  try {
    // Insert default representative
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT OR IGNORE INTO representatives 
        (rep_code, rep_name, username, password_hash, phone, city, wilaya)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, ['REP001', 'Ahmed Benali', 'ahmed', hashedPassword, '0555123456', 'Setif', 'Setif'], 
      function(err) {
        if (err) reject(err);
        else resolve();
      });
    });

    // Insert sample clients
    const clients = [
      ['C001', 'Amina Boukerche', 'Setif', 'Setif', '0555987654', 'Cite El Hidhab, Setif'],
      ['C002', 'Mohamed Rami', 'Algiers', 'Algiers', '0555123789', 'Hydra, Algiers'],
      ['C003', 'Fatima Zahra', 'Oran', 'Oran', '0555456123', 'Centre Ville, Oran'],
      ['C004', 'Youssef Kaddour', 'Constantine', 'Constantine', '0555789456', 'Panorama, Constantine'],
      ['C005', 'Leila Messaoudi', 'Annaba', 'Annaba', '0555321654', 'Centre, Annaba']
    ];

    for (const client of clients) {
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT OR IGNORE INTO clients 
          (client_id, full_name, city, wilaya, phone, location)
          VALUES (?, ?, ?, ?, ?, ?)
        `, client, function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // Insert sample articles
    const articles = [
      ['Premium Face Cream', 25.99, 'Anti-aging face cream with natural ingredients'],
      ['Vitamin C Serum', 18.50, 'Brightening serum with vitamin C'],
      ['Moisturizing Lotion', 15.75, 'Daily moisturizer for all skin types'],
      ['Cleansing Foam', 12.25, 'Gentle foaming cleanser'],
      ['Eye Cream', 22.00, 'Anti-aging eye cream'],
      ['Sunscreen SPF 50', 19.99, 'Broad spectrum sun protection'],
      ['Night Repair Serum', 28.50, 'Overnight skin repair treatment'],
      ['Exfoliating Scrub', 16.25, 'Weekly exfoliating treatment']
    ];

    for (const article of articles) {
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT OR IGNORE INTO articles (name, price, description)
          VALUES (?, ?, ?)
        `, article, function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // Insert sample gifts
    const gifts = [
      ['Travel Kit', 'Compact travel-sized essentials'],
      ['Beauty Bag', 'Elegant cosmetic bag'],
      ['Hand Mirror', 'Portable beauty mirror'],
      ['Sample Set', 'Mini product samples'],
      ['Face Mask Set', 'Collection of facial masks']
    ];

    for (const gift of gifts) {
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT OR IGNORE INTO gifts (gift_name, description)
          VALUES (?, ?)
        `, gift, function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // Insert sample packs
    const packs = [
      ['Pack A', 45.99, 1], // with gift_id 1
      ['Pack B', 65.50, 2], // with gift_id 2
      ['Pack C', 38.75, null], // no gift
      ['Premium Pack', 89.99, 3], // with gift_id 3
      ['Starter Pack', 29.99, 4] // with gift_id 4
    ];

    const packIds = [];
    for (const pack of packs) {
      const result = await new Promise((resolve, reject) => {
        db.run(`
          INSERT OR IGNORE INTO packs (pack_name, total_price, gift_id)
          VALUES (?, ?, ?)
        `, pack, function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        });
      });
      if (result) packIds.push(result);
    }

    // Insert pack articles relationships
    const packArticles = [
      [1, 1], [1, 3], // Pack A has articles 1 and 3
      [2, 1], [2, 2], [2, 5], // Pack B has articles 1, 2, and 5
      [3, 4], [3, 6], // Pack C has articles 4 and 6
      [4, 1], [4, 2], [4, 5], [4, 7], // Premium Pack has articles 1, 2, 5, and 7
      [5, 4], [5, 8] // Starter Pack has articles 4 and 8
    ];

    for (const [packId, articleId] of packArticles) {
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT OR IGNORE INTO pack_articles (pack_id, article_id)
          VALUES (?, ?)
        `, [packId, articleId], function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    console.log('✅ Database initialized with sample data');
    console.log('📋 Sample data created:');
    console.log('   - 1 Representative (username: ahmed, password: 123456)');
    console.log('   - 5 Clients');
    console.log('   - 8 Articles');
    console.log('   - 5 Gifts');
    console.log('   - 5 Product Packs');

  } catch (error) {
    console.error('❌ Error initializing data:', error);
  } finally {
    db.close();
  }
};

// Run initialization
initializeData();
