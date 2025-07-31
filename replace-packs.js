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

const replacePacks = async () => {
  try {
    console.log('🔄 Starting packs replacement...');

    // Clear existing packs and their relationships
    console.log('🗑️  Clearing existing packs...');
    await promiseRun('DELETE FROM pack_articles');
    await promiseRun('DELETE FROM packs');
    
    // Reset the auto-increment counter for packs
    await promiseRun('DELETE FROM sqlite_sequence WHERE name="packs"');

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

        console.log(`💰 Calculated total price: ${totalPrice.toLocaleString()} DA`);

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
              `${product.ProductName} - Quantity available: ${product.Qte} units`
            ]);
            articleId = articleResult.id;
            console.log(`📱 Created new article: ${product.ProductName} (ID: ${articleId}, Price: ${parseFloat(product.Price).toLocaleString()} DA)`);
          }

          // Add article to pack
          await promiseRun(`
            INSERT INTO pack_articles (pack_id, article_id)
            VALUES (?, ?)
          `, [packId, articleId]);

          console.log(`🔗 Linked article ${product.ProductName} (Qty: ${product.Qte}) to pack ${packData.PackName}`);
        }

        imported++;
        console.log(`✅ Successfully imported pack: ${packData.PackName}`);

      } catch (error) {
        errors++;
        console.error(`❌ Error importing pack ${packData.PackName}:`, error.message);
      }
    }

    console.log('\n✅ Pack replacement completed!');
    console.log(`📈 Summary:`);
    console.log(`   - Imported: ${imported} packs`);
    console.log(`   - Errors: ${errors} packs`);
    console.log(`   - Total processed: ${imported + errors} packs`);

    // Show final pack details
    console.log('\n📋 Final pack details:');
    const finalPacks = await promiseQuery(`
      SELECT p.pack_name, p.total_price, g.gift_name
      FROM packs p
      LEFT JOIN gifts g ON p.gift_id = g.id
      ORDER BY p.id
    `);

    for (const pack of finalPacks) {
      console.log(`   📦 ${pack.pack_name}: ${pack.total_price.toLocaleString()} DA (Gift: ${pack.gift_name || 'None'})`);
    }

  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    db.close();
  }
};

// Run the replacement
replacePacks();
