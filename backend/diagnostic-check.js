require('dotenv').config();
const config = require('./src/config');

console.log('=== Lost & Found Backend Diagnostic Check ===\n');

// Check environment variables
console.log('1. Environment Configuration:');
console.log(`   NODE_ENV: ${config.env}`);
console.log(`   PORT: ${config.port}`);

// Check database config
console.log('\n2. Database Configuration:');
console.log(`   Host: ${config.database.host || '❌ Missing'}`);
console.log(`   Port: ${config.database.port || '❌ Missing'}`);
console.log(`   Database: ${config.database.name || '❌ Missing'}`);
console.log(`   User: ${config.database.user || '❌ Missing'}`);
console.log(`   Password: ${config.database.password ? '✓ Set' : '❌ Missing'}`);

// Check Cloudinary config
console.log('\n3. Cloudinary Configuration (for image upload):');
console.log(`   Cloud Name: ${config.cloudinary.cloudName || '❌ Missing'}`);
console.log(`   API Key: ${config.cloudinary.apiKey || '❌ Missing'}`);
console.log(`   API Secret: ${config.cloudinary.apiSecret ? '✓ Set' : '❌ Missing'}`);

// Check Firebase config
console.log('\n4. Firebase Configuration (for authentication):');
console.log(`   Project ID: ${config.firebase.projectId || '❌ Missing'}`);
console.log(`   Client Email: ${config.firebase.clientEmail || '❌ Missing'}`);
console.log(`   Private Key: ${config.firebase.privateKey ? '✓ Set' : '❌ Missing'}`);

// Check temp directory
console.log('\n5. File Upload Configuration:');
const os = require('os');
const fs = require('fs');
const tempDir = os.tmpdir();
console.log(`   Temp Directory: ${tempDir}`);
console.log(`   Temp Dir Exists: ${fs.existsSync(tempDir) ? '✓ Yes' : '❌ No'}`);
console.log(`   Temp Dir Writable: ${fs.accessSync(tempDir, fs.constants.W_OK) === undefined ? '✓ Yes' : '❌ No'}`);

// Test database connection
console.log('\n6. Testing Database Connection...');
const db = require('./src/database/db');
db.query('SELECT NOW()')
  .then(() => {
    console.log('   ✓ Database connection successful!');
  })
  .catch((err) => {
    console.log('   ❌ Database connection failed:', err.message);
  })
  .finally(() => {
    // Test Cloudinary connection
    console.log('\n7. Testing Cloudinary Connection...');
    const cloudinary = require('./src/config/cloudinary');
    cloudinary.api.ping()
      .then(() => {
        console.log('   ✓ Cloudinary connection successful!');
      })
      .catch((err) => {
        console.log('   ❌ Cloudinary connection failed:', err.message);
      })
      .finally(() => {
        console.log('\n=== Diagnostic Check Complete ===');
        process.exit(0);
      });
  });
