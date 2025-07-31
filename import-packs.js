const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'sales_management.db');
const db = new sqlite3.Database(dbPath);

const promiseRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const promiseQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const importPacks = async () => {
  try {
    console.log('🔄 Starting packs import...');

    // Read the JSON file
    const packsJson = JSON.parse(fs.readFileSync('./packs.json', 'utf8'));
    console.log(`📋 Found ${packsJson.length} packs to import`);

    let imported = 0;
    let errors = 0;

    for (const packData of packsJson) {
      try {
        console.log(`\n📦 Processing pack: ${packData.PackName}`);

        // Calculate total pack price from products
        let totalPrice = 0;
        for (const product of packData.Products) {
          const quantity = parseInt(product.Qte);
          const price = parseFloat(product.Price);
          totalPrice += quantity * price;
        }

        console.log(`💰 Calculated total price: ${totalPrice}`);

        // First, ensure the gift exists in the gifts table
        let giftId = null;
        if (packData.Gift) {
          // Check if gift already exists
          const existingGift = await promiseQuery(
            'SELECT id FROM gifts WHERE gift_name = ?',
            [packData.Gift]
          );

          if (existingGift.length > 0) {
            giftId = existingGift[0].id;
            console.log(`🎁 Found existing gift: ${packData.Gift} (ID: ${giftId})`);
          } else {
            // Create new gift
            const giftResult = await promiseRun(
              'INSERT INTO gifts (gift_name, description) VALUES (?, ?)',
              [packData.Gift, `Gift for ${packData.PackName}`]
            );
            giftId = giftResult.id;
            console.log(`🎁 Created new gift: ${packData.Gift} (ID: ${giftId})`);
          }
        }

        // Check if pack already exists
        const existingPack = await promiseQuery(
          'SELECT id FROM packs WHERE pack_name = ?',
          [packData.PackName]
        );

        if (existingPack.length > 0) {
          console.log(`⏭️  Pack already exists: ${packData.PackName}`);
          continue;
        }

        // Create the pack
        const packResult = await promiseRun(`
          INSERT INTO packs (pack_name, total_price, gift_id)
          VALUES (?, ?, ?)
        `, [packData.PackName, totalPrice, giftId]);

        const packId = packResult.id;
        console.log(`📦 Created pack: ${packData.PackName} (ID: ${packId})`);

        // Now handle the products (articles)
        for (const product of packData.Products) {
          // Check if article exists
          let articleId = null;
          const existingArticle = await promiseQuery(
            'SELECT id FROM articles WHERE name = ?',
            [product.ProductName]
          );

          if (existingArticle.length > 0) {
            articleId = existingArticle[0].id;
            console.log(`📱 Found existing article: ${product.ProductName} (ID: ${articleId})`);
          } else {
            // Create new article
            const articleResult = await promiseRun(`
              INSERT INTO articles (name, price, description)
              VALUES (?, ?, ?)
            `, [
              product.ProductName,
              parseFloat(product.Price),
              `Product: ${product.ProductName} - Quantity: ${product.Qte}`
            ]);
            articleId = articleResult.id;
            console.log(`📱 Created new article: ${product.ProductName} (ID: ${articleId})`);
          }

          // Add article to pack (we'll add it once for each unit in quantity)
          // For simplicity, we'll just add the relationship once
          await promiseRun(`
            INSERT INTO pack_articles (pack_id, article_id)
            VALUES (?, ?)
          `, [packId, articleId]);

          console.log(`🔗 Linked article ${product.ProductName} to pack ${packData.PackName}`);
        }

        imported++;
        console.log(`✅ Successfully imported pack: ${packData.PackName}`);

      } catch (error) {
        errors++;
        console.error(`❌ Error importing pack ${packData.PackName}:`, error.message);
      }
    }

    console.log('\n✅ Import completed!');
    console.log(`📈 Summary:`);
    console.log(`   - Imported: ${imported} packs`);
    console.log(`   - Errors: ${errors} packs`);
    console.log(`   - Total processed: ${imported + errors} packs`);

  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    db.close();
  }
};

// Run the import
importPacks();
