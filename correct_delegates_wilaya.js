const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('sales_management.db');

console.log('🔧 CORRECTING DELEGATE WILAYA ASSIGNMENTS');
console.log('========================================');

// Correct wilaya assignments based on user's specifications
const correctAssignments = [
  { username: 'ahmed', city: 'Setif', wilaya: 'Setif' },
  { username: 'test', city: 'Algiers', wilaya: 'Algiers' },
  { username: 'abdelkaders', city: 'Oeb', wilaya: 'Oeb' },
  { username: 'necereddineo', city: 'Bejaia', wilaya: 'Bejaia' },
  { username: 'islemc', city: 'Constantine', wilaya: 'Constantine' },
  { username: 'houdheifak', city: 'Guelma', wilaya: 'Guelma' },
  { username: 'ramzis', city: 'Batna', wilaya: 'Batna' },
  { username: 'elyesm', city: 'Tizi Ouzou', wilaya: 'Tizi Ouzou' },
  { username: 'nadjimh', city: 'Bejaia', wilaya: 'Bejaia' },
  { username: 'abdelouahabh', city: 'jijel', wilaya: 'jijel' },
  { username: 'youcefr', city: 'bouira', wilaya: 'bouira' },
  { username: 'hamzas', city: 'msila', wilaya: 'msila' },
  { username: 'abdelhamidl', city: 'skikda', wilaya: 'skikda' },
  { username: 'lokmanem', city: 'Setif', wilaya: 'Setif' },
  { username: 'khoubaibk', city: 'Oum El Bouaghi', wilaya: 'Oum El Bouaghi' },
  { username: 'adilb', city: 'Annaba', wilaya: 'Annaba' },
  { username: 'chafika', city: 'Batna', wilaya: 'Batna' },
  { username: 'nidhalk', city: 'Setif', wilaya: 'Setif' },
  { username: 'taherl', city: 'Constantine', wilaya: 'Constantine' },
  { username: 'tarekn', city: 'Setif', wilaya: 'Setif' },
  { username: 'ilyesb', city: 'Khenchela', wilaya: 'Khenchela' },
  { username: 'meda', city: 'Biskra', wilaya: 'Biskra' },
  { username: 'eddinez', city: 'Setif', wilaya: 'Setif' },
  { username: 'ademf', city: 'Setif', wilaya: 'Setif' },
  { username: 'atikl', city: 'Setif', wilaya: 'Setif' },
  { username: 'nadjia', city: 'Setif', wilaya: 'Setif' },
  { username: 'naimk', city: 'Setif', wilaya: 'Setif' }
];

let completed = 0;
const total = correctAssignments.length;

console.log(`Updating ${total} delegate assignments...\n`);

correctAssignments.forEach((assignment, index) => {
  db.run(
    'UPDATE representatives SET city = ?, wilaya = ? WHERE username = ?',
    [assignment.city, assignment.wilaya, assignment.username],
    function(err) {
      if (err) {
        console.error(`❌ Error updating ${assignment.username}:`, err);
      } else {
        console.log(`✅ ${assignment.username} → ${assignment.city}, ${assignment.wilaya}`);
      }
      
      completed++;
      if (completed === total) {
        console.log('\n🎯 VERIFICATION - Updated Assignments:');
        console.log('=====================================');
        
        // Verify the updates
        db.all('SELECT username, city, wilaya FROM representatives ORDER BY id', (err, delegates) => {
          if (err) {
            console.error('Verification error:', err);
            return;
          }
          
          console.log('Username         | City           | Wilaya');
          console.log('-----------------|----------------|----------------');
          
          delegates.forEach(delegate => {
            const username = delegate.username.padEnd(16);
            const city = (delegate.city || 'Unknown').padEnd(14);
            const wilaya = delegate.wilaya || 'Unknown';
            console.log(`${username} | ${city} | ${wilaya}`);
          });
          
          // Count delegates per wilaya
          const wilayaCounts = {};
          delegates.forEach(delegate => {
            const wilaya = delegate.wilaya || 'Unknown';
            wilayaCounts[wilaya] = (wilayaCounts[wilaya] || 0) + 1;
          });
          
          console.log('\n📊 DELEGATES PER WILAYA:');
          console.log('========================');
          Object.keys(wilayaCounts).sort().forEach(wilaya => {
            console.log(`${wilaya}: ${wilayaCounts[wilaya]} delegate(s)`);
          });
          
          console.log('\n✅ All delegate wilaya assignments have been corrected!');
          console.log('🎯 Each delegate now has their proper territory assignment.');
          
          db.close();
        });
      }
    }
  );
});
