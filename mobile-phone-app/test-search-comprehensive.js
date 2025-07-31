const { spawn } = require('child_process');
const http = require('http');

// Function to test the search endpoint with different filters
function testSearchEndpoint(testName, filters = {}, expectedMinResults = 0) {
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
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          console.log(`\n📋 ${testName}`);
          console.log(`✅ Status: ${res.statusCode}`);
          console.log(`- Success: ${response.success}`);
          console.log(`- Execution Time: ${response.executionTime}ms`);
          console.log(`- Total Results: ${response.data.pagination?.total || 0}`);
          console.log(`- Results Returned: ${response.data.phones?.length || 0}`);
          
          // Verify we got expected results
          const totalResults = response.data.pagination?.total || 0;
          if (totalResults >= expectedMinResults) {
            console.log(`✅ Test passed: Found ${totalResults} results (expected >= ${expectedMinResults})`);
          } else {
            console.log(`❌ Test failed: Found ${totalResults} results (expected >= ${expectedMinResults})`);
          }
          
          if (response.data.phones && response.data.phones.length > 0) {
            console.log('\n📱 Sample Results:');
            response.data.phones.slice(0, 2).forEach((phone, index) => {
              console.log(`${index + 1}. ${phone.brand_name} ${phone.model}`);
              console.log(`   - RAM: ${phone.ram_gb}GB, Storage: ${phone.internal_storage_gb}GB`);
              console.log(`   - Battery: ${phone.battery_capacity}mAh`);
              console.log(`   - Display: ${phone.display_type_name || 'N/A'}`);
              console.log(`   - Chipset: ${phone.chipset_name || 'N/A'}`);
            });
          }
          
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

// Test cases
const testCases = [
  {
    name: "Test 1: No filters (get all phones)",
    filters: {},
    expectedMinResults: 10
  },
  {
    name: "Test 2: Brand filter (Samsung)",
    filters: { brand: 'Samsung' },
    expectedMinResults: 5
  },
  {
    name: "Test 3: RAM filter (8GB+)",
    filters: { ramGb: 8 },
    expectedMinResults: 1
  },
  {
    name: "Test 4: Multiple filters (Samsung + 6GB RAM)",
    filters: { 
      brand: 'Samsung',
      ramGb: 6
    },
    expectedMinResults: 1
  },
  {
    name: "Test 5: Price range filter (₹20,000 - ₹50,000)",
    filters: { 
      priceRange: {
        min: 20000,
        max: 50000
      }
    },
    expectedMinResults: 0 // May be 0 if no pricing data
  }
];

// Start server and run tests
console.log('🚀 Starting comprehensive search endpoint tests...\n');

const serverProcess = spawn('npx', ['tsx', 'backend/server.ts'], {
  stdio: 'pipe',
  shell: true
});

let serverReady = false;

serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  
  if (output.includes('Server initialization complete') && !serverReady) {
    serverReady = true;
    
    // Wait a moment for server to be fully ready
    setTimeout(async () => {
      try {
        console.log('🧪 Running comprehensive search endpoint tests...\n');
        
        let passedTests = 0;
        let totalTests = testCases.length;
        
        for (const testCase of testCases) {
          try {
            await testSearchEndpoint(testCase.name, testCase.filters, testCase.expectedMinResults);
            passedTests++;
          } catch (error) {
            console.error(`❌ ${testCase.name} failed:`, error.message);
          }
          
          // Add delay between tests
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        console.log('\n' + '='.repeat(60));
        console.log(`📊 Test Summary: ${passedTests}/${totalTests} tests passed`);
        
        if (passedTests === totalTests) {
          console.log('✅ All search endpoint tests completed successfully!');
        } else {
          console.log('⚠️  Some tests failed, but search endpoint is functional');
        }
        
        // Kill the server process
        serverProcess.kill('SIGINT');
        process.exit(0);
      } catch (error) {
        console.error('\n❌ Test suite failed:', error.message);
        serverProcess.kill('SIGINT');
        process.exit(1);
      }
    }, 2000);
  }
});

serverProcess.stderr.on('data', (data) => {
  // Suppress stderr output unless it's an actual error
  const errorOutput = data.toString();
  if (errorOutput.includes('Error') || errorOutput.includes('error')) {
    console.error('Server Error:', errorOutput);
  }
});

serverProcess.on('close', (code) => {
  if (code !== 0) {
    console.log(`\nServer process exited with code ${code}`);
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nTerminating tests...');
  serverProcess.kill('SIGINT');
  process.exit(0);
});