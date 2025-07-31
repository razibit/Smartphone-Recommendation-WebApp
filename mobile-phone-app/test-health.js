const http = require('http');

function testHealth() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/health',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('Health Response:', JSON.stringify(response, null, 2));
          resolve(response);
        } catch (error) {
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request Error:', error.message);
      reject(error);
    });

    req.setTimeout(5000, () => {
      console.error('Request timeout');
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

testHealth()
  .then(() => console.log('Health check passed'))
  .catch((error) => console.error('Health check failed:', error.message));