/**
 * Script to add delegates from CSV to represents.json
 * This will parse the CSV data and add all delegates to the database
 */

const fs = require('fs');
const path = require('path');

// Path to represents.json
const representsPath = path.join(__dirname, 'public', 'Data', 'represents.json');

// CSV data from delegates (1).csv
const csvData = `11,COM 1,6,Active,SAGHIRI ABDELKADER,Mohcen Acide
12,COM 10,7,Active,OUCHEN NECEREDDINE,Mohcen Acide
13,COM 12,8,Active,CHAOUCH ISLEM,Mohcen Acide
14,COM 13,9,Active,KERBECHE HOUDHEIFA,Mohcen Acide
15,COM 14,10,Active,SEHIL RAMZI,Mohcen Acide
16,COM 15,11,Active,MERZOUK ELYES,Mohcen Acide
17,COM 16,12,Active,HIDRI NADJIM,Mohcen Acide
18,COM 17,13,Active,HAFSI ABDELOUAHAB,Mohcen Acide
19,COM 18,14,Active,REZIG YOUCEF,Mohcen Acide
20,COM 19,15,Active,SAADAOUI HAMZA,Mohcen Acide
21,COM 2,16,Active,LASMI ABDELHAMID,Mohcen Acide
22,COM 20,17,Active,MAHAR LOKMANE,Mohcen Acide
23,COM 21,18,Active,KADI KHOUBAIB,Mohcen Acide
24,COM 3,19,Active,BOUCHAMA ADIL,Mohcen Acide
25,COM 4,20,Active,ACHAB CHAFIK,Mohcen Acide
26,COM 5,21,Active,KETFI NIDHAL,Mohcen Acide
27,COM 6,22,Active,LEBSIS TAHER,Mohcen Acide
28,COM 7,23,Active,NOUREDDINE TAREK,Mohcen Acide
29,COM 8,24,Active,BOUHOURA ILYES,Mohcen Acide
30,COM 9,25,Active,ADJEL MED,Mohcen Acide
31,LIV 3,26,Active,ZINE EDDINE,Mohcen Acide
32,LIV 4,27,Active,FERRADJ ADEM,Mohcen Acide
33,LIV 5,28,Active,LAOUAMEUR ATIK,Mohcen Acide
34,LIV 6,29,Active,AMARCHI NADJI,Mohcen Acide
35,LIV 7,30,Active,KOUSSA NAIM,Mohcen Acide`;

function addDelegatesToDatabase() {
  try {
    console.log('📄 Reading current represents.json...');
    
    // Read current represents data
    let currentRepresents = [];
    if (fs.existsSync(representsPath)) {
      const fileContent = fs.readFileSync(representsPath, 'utf8');
      currentRepresents = JSON.parse(fileContent);
      console.log('✅ Current represents count:', currentRepresents.length);
    }

    // Parse CSV data
    console.log('📊 Parsing CSV data...');
    const lines = csvData.trim().split('\n');
    const newDelegates = [];

    lines.forEach((line, index) => {
      const [id, repCode, sequence, status, fullName, company] = line.split(',');
      
      // Create username from full name (first name + last initial)
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[nameParts.length - 1].toLowerCase(); // Last word is usually first name
      const lastNameInitial = nameParts[0].charAt(0).toLowerCase(); // First word is usually last name
      const username = firstName + lastNameInitial;
      
      // Create the delegate object matching your existing structure
      const delegate = {
        iD: parseInt(id),
        RepresentName: fullName.trim(),
        RepCode: repCode.trim(),
        Phone: "0555000000", // Default phone (you can update later)
        City: "Unknown", // Default city (you can update later)
        Wilaya: "Unknown", // Default wilaya (you can update later) 
        username: username,
        password: "123456", // Default password
        status: status.trim(),
        company: company.trim(),
        sequence: parseInt(sequence)
      };

      newDelegates.push(delegate);
      console.log(`➕ Added delegate ${index + 1}: ${fullName} (${username})`);
    });

    // Combine existing and new data
    const allRepresents = [...currentRepresents, ...newDelegates];
    
    // Remove duplicates based on RepCode
    const uniqueRepresents = allRepresents.filter((represent, index, self) => 
      index === self.findIndex(r => r.RepCode === represent.RepCode)
    );

    console.log('📊 Total delegates after merge:', uniqueRepresents.length);
    console.log('📊 New delegates added:', newDelegates.length);

    // Write back to file
    console.log('💾 Writing to represents.json...');
    fs.writeFileSync(representsPath, JSON.stringify(uniqueRepresents, null, 2));
    
    console.log('✅ Successfully added all delegates to the database!');
    console.log('📋 Summary:');
    console.log(`   - Total delegates: ${uniqueRepresents.length}`);
    console.log(`   - New delegates added: ${newDelegates.length}`);
    console.log('');
    console.log('🔑 Login credentials for new delegates:');
    console.log('   - Password: 123456 (for all)');
    console.log('   - Usernames generated from names');
    console.log('');
    console.log('📝 Sample new logins:');
    newDelegates.slice(0, 5).forEach(delegate => {
      console.log(`   - ${delegate.RepresentName}: username = "${delegate.username}", password = "123456"`);
    });

  } catch (error) {
    console.error('❌ Error adding delegates to database:', error);
  }
}

// Run the function
addDelegatesToDatabase();
