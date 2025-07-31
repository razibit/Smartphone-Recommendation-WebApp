const http = require('http');

function testSearchEndpoint(filters = {}) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      filters,
      page: 1,
      limit: 5
    });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/devices/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      console.log(`✅ Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('\n🎯 Search API Response:');
          console.log(`- Success: ${response.success}`);
          console.log(`- Execution Time: ${response.executionTime}ms`);
          console.log(`- Total Results: ${response.data.pagination?.total || 0}`);
          console.log(`- Results Returned: ${response.data.phones?.length || 0}`);
          console.log(`- Current Page: ${response.data.pagination?.page}`);
          console.log(`- Total Pages: ${response.data.pagination?.totalPages}`);
          
          if (response.data.phones && response.data.phones.length > 0) {
            console.log('\n📱 Sample Phone Results:');
            response.data.phones.forEach((phone, index) => {
              console.log(`${index + 1}. ${phone.brand_name} ${phone.model}`);
              console.log(`   - RAM: ${phone.ram_gb}GB, Storage: ${phone.internal_storage_gb}GB`);
              console.log(`   - Price: ₹${phone.price_unofficial || phone.price_official || 'N/A'}`);
            });
          }
          
          console.log('\n🔍 SQL Query Used:');
          console.log(response.sqlQuery);
          
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

    req.setTimeout(10000, () => {
      console.error('❌ Request timeout');
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Testing Phone Search API Endpoint...\n');
  
  try {
    // Test 1: Search without filters (get all phones)
    console.log('📋 Test 1: Search without filters');
    await testSearchEndpoint();
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test 2: Search with brand filter
    console.log('📋 Test 2: Search with brand filter (Samsung)');
    await testSearchEndpoint({ brand: 'Samsung' });
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test 3: Search with multiple filters
    console.log('📋 Test 3: Search with multiple filters (Samsung + RAM >= 8GB)');
    await testSearchEndpoint({ 
      brand: 'Samsung',
      ramGb: 8
    });
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test 4: Search with price range
    console.log('📋 Test 4: Search with price range (₹20,000 - ₹50,000)');
    await testSearchEndpoint({ 
      priceRange: {
        min: 20000,
        max: 50000
      }
    });
    
    console.log('\n✅ All search endpoint tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runTests();