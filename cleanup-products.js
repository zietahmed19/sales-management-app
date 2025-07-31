const sqlite3 = require('sqlite3').verbose();
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

const cleanupProducts = async () => {
  try {
    console.log('🔄 Cleaning up products to keep only Spark Go items...');

    // Get current articles
    const allArticles = await promiseQuery('SELECT id, name FROM articles');
    console.log(`📋 Found ${allArticles.length} articles in database`);

    // Find Spark Go articles to keep
    const sparkGoArticles = allArticles.filter(article => 
      article.name.includes('Spark Go')
    );
    
    console.log(`📱 Found ${sparkGoArticles.length} Spark Go articles to keep:`);
    sparkGoArticles.forEach(article => {
      console.log(`   - ${article.name} (ID: ${article.id})`);
    });

    // Find other articles to remove
    const articlesToRemove = allArticles.filter(article => 
      !article.name.includes('Spark Go')
    );

    if (articlesToRemove.length > 0) {
      console.log(`🗑️  Removing ${articlesToRemove.length} non-Spark Go articles:`);
      
      for (const article of articlesToRemove) {
        console.log(`   - Removing: ${article.name} (ID: ${article.id})`);
        
        // Remove from pack_articles first (foreign key constraint)
        await promiseRun('DELETE FROM pack_articles WHERE article_id = ?', [article.id]);
        
        // Remove the article
        await promiseRun('DELETE FROM articles WHERE id = ?', [article.id]);
      }
    }

    console.log('✅ Cleanup completed!');
    
    // Show remaining articles
    const remainingArticles = await promiseQuery('SELECT id, name, price FROM articles ORDER BY name');
    console.log(`📱 Remaining articles (${remainingArticles.length}):`);
    remainingArticles.forEach(article => {
      console.log(`   - ${article.name}: ${article.price.toLocaleString()} DA`);
    });

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    db.close();
  }
};

// Run the cleanup
cleanupProducts();
