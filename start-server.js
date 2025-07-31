#!/usr/bin/env node

console.log('🚀 Starting server-db.js explicitly...');
console.log('📁 Current directory:', process.cwd());
console.log('📄 Files in directory:', require('fs').readdirSync('.').filter(f => f.endsWith('.js')));

// Ensure we're running the correct server
const serverPath = './server-db.js';
console.log(`🎯 Executing: ${serverPath}`);

try {
  require(serverPath);
} catch (error) {
  console.error('❌ Error starting server-db.js:', error);
  process.exit(1);
}
