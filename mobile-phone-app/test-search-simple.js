const { spawn } = require('child_process');
const http = require('http');

// Function to test the search endpoint
function testSearchEndpoint() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      filters: {
        brand: 'Samsung'
      },
      page: 1,
      limit: 3
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

// Start server and test
console.log('🚀 Starting backend server and testing search endpoint...\n');

const serverProcess = spawn('npx', ['tsx', 'backend/server.ts'], {
  stdio: 'pipe',
  shell: true
});

let serverReady = false;

serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  
  if (output.includes('Server initialization complete') && !serverReady) {
    serverReady = true;
    
    // Wait a moment for server to be fully ready
    setTimeout(async () => {
      try {
        console.log('📋 Testing search endpoint with Samsung filter...\n');
        await testSearchEndpoint();
        console.log('\n✅ Search endpoint test completed successfully!');
        
        // Kill the server process
        serverProcess.kill('SIGINT');
        process.exit(0);
      } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        serverProcess.kill('SIGINT');
        process.exit(1);
      }
    }, 2000);
  }
});

serverProcess.stderr.on('data', (data) => {
  console.error('Server Error:', data.toString());
});

serverProcess.on('close', (code) => {
  console.log(`\nServer process exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nTerminating test...');
  serverProcess.kill('SIGINT');
  process.exit(0);
});