/**
 * Console Message Watcher
 * This script watches for console messages from the React app
 * Run this in a separate terminal to see real-time console output
 */

const WebSocket = require('ws');

console.log('🔍 Console Message Watcher Started');
console.log('📡 This will capture console messages from your React app');
console.log('🌐 Make sure your React app is running on localhost:3001');
console.log('='.repeat(80));

// Simple HTTP server to capture console messages
const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.method === 'POST' && req.url === '/console') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const message = JSON.parse(body);
        const timestamp = new Date().toISOString();
        
        console.log('\n' + '='.repeat(80));
        console.log(`🕐 [${timestamp}] FRONTEND CONSOLE:`);
        console.log(`📱 Level: ${message.level}`);
        console.log(`📝 Message: ${message.message}`);
        if (message.data) {
          console.log(`📊 Data:`, message.data);
        }
        console.log('='.repeat(80));
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'received' }));
      } catch (error) {
        console.error('❌ Error parsing console message:', error);
        res.writeHead(400);
        res.end('Invalid JSON');
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

const PORT = 3002;
server.listen(PORT, () => {
  console.log(`🎯 Console watcher listening on http://localhost:${PORT}/console`);
  console.log('📋 Add this to your React app to send console messages here:');
  console.log(`
// Add this to your console.log statements:
fetch('http://localhost:${PORT}/console', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ level: 'log', message: 'Your message', data: yourData })
});
  `);
  console.log('='.repeat(80));
});

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\n🛑 Console watcher stopped');
  process.exit(0);
});
