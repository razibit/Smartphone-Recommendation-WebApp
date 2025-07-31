const http = require('http');

function testFilterEndpoint() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/devices/filters',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      console.log(`✅ Status: ${res.statusCode}`);
      console.log(`📋 Headers: ${JSON.stringify(res.headers, null, 2)}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('\n🎯 API Response Structure:');
          console.log(`- Success: ${response.success}`);
          console.log(`- Execution Time: ${response.executionTime}ms`);
          console.log(`- Brands Count: ${response.data.brands?.length || 0}`);
          console.log(`- Chipsets Count: ${response.data.chipsets?.length || 0}`);
          console.log(`- Display Types Count: ${response.data.displayTypes?.length || 0}`);
          console.log(`- Storage Options Count: ${response.data.storageOptions?.length || 0}`);
          console.log(`- Price Range: ₹${response.data.priceRange?.min} - ₹${response.data.priceRange?.max}`);
          
          console.log('\n📊 Sample Data:');
          console.log('First 3 Brands:', response.data.brands?.slice(0, 3));
          console.log('First 3 Chipsets:', response.data.chipsets?.slice(0, 3));
          console.log('Storage Options:', response.data.storageOptions);
          
          resolve(response);
        } catch (error) {
          console.log('❌ Failed to parse JSON response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ HTTP Request Error:', error.message);
      reject(error);
    });

    req.setTimeout(5000, () => {
      console.error('❌ Request timeout');
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Test the endpoint
console.log('🚀 Testing Filter Options API Endpoint...\n');
testFilterEndpoint()
  .then(() => {
    console.log('\n✅ Filter options endpoint test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  });