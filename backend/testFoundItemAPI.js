require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testFoundItemAPI() {
  try {
    console.log('\n🧪 Testing Found Item API submission...\n');

    // You'll need a valid Firebase token - get it from your browser's localStorage
    // For now, let's test without authentication to see what error we get
    
    const formData = new FormData();
    formData.append('itemName', 'Test Found Item');
    formData.append('category', 'Electronics');
    formData.append('description', 'Testing found item submission');
    formData.append('location', 'Library');
    formData.append('dateFound', '2025-12-21');
    formData.append('timeFound', '14:30');
    formData.append('secretDetail', 'Has a red sticker');
    formData.append('whereToFind', 'Security Office');

    // Create a small test image if you have one, or skip
    // formData.append('image', fs.createReadStream('path/to/test-image.jpg'));

    console.log('📤 Sending POST request to /api/found-items...\n');

    const response = await axios.post('http://localhost:5000/api/found-items', formData, {
      headers: {
        ...formData.getHeaders(),
        // Authorization: 'Bearer YOUR_TOKEN_HERE'  // Add your token
      }
    });

    console.log('✅ Success!');
    console.log('Response:', response.data);

  } catch (error) {
    console.error('\n❌ Error occurred:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testFoundItemAPI();
