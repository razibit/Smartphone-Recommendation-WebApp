/**
 * Scalability Testing Script for Mobile Phone Database
 * Tests the application with larger datasets and concurrent requests
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

class ScalabilityTester {
  constructor(baseUrl = 'http://localhost:3001/api') {
    this.baseUrl = baseUrl;
    this.results = {
      endpoint: '',
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      responseTimes: [],
      errorTypes: {},
      concurrentUsers: 0,
      throughput: 0,
      memoryUsage: [],
      errors: []
    };
  }

  /**
   * Test filter options endpoint with concurrent requests
   */
  async testFilterOptions(concurrentUsers = 10, requestsPerUser = 20) {
    console.log(`\n🔍 Testing Filter Options (${concurrentUsers} concurrent users, ${requestsPerUser} requests each)`);
    this.results.endpoint = 'GET /devices/filters';
    this.results.concurrentUsers = concurrentUsers;

    const totalRequests = concurrentUsers * requestsPerUser;
    const startTime = Date.now();
    
    const userPromises = Array.from({ length: concurrentUsers }, async (_, userIndex) => {
      const userResults = [];
      
      for (let i = 0; i < requestsPerUser; i++) {
        const requestStart = Date.now();
        
        try {
          const response = await fetch(`${this.baseUrl}/devices/filters`);
          const responseTime = Date.now() - requestStart;
          
          if (response.ok) {
            const data = await response.json();
            userResults.push({
              success: true,
              responseTime,
              dataSize: JSON.stringify(data).length
            });
          } else {
            userResults.push({
              success: false,
              responseTime,
              error: `HTTP ${response.status}`,
              statusCode: response.status
            });
          }
        } catch (error) {
          const responseTime = Date.now() - requestStart;
          userResults.push({
            success: false,
            responseTime,
            error: error.message
          });
        }
      }
      
      return userResults;
    });

    const allResults = (await Promise.all(userPromises)).flat();
    const endTime = Date.now();
    
    this.processResults(allResults, totalRequests, endTime - startTime);
    this.logResults('Filter Options');
  }

  /**
   * Test search endpoint with various filter combinations
   */
  async testSearch(concurrentUsers = 8, requestsPerUser = 15) {
    console.log(`\n🔍 Testing Search Endpoint (${concurrentUsers} concurrent users, ${requestsPerUser} requests each)`);
    this.results = { ...this.results, endpoint: 'POST /devices/search', concurrentUsers };

    const searchVariations = [
      { filters: {} }, // No filters
      { filters: { brand: 'Apple' } },
      { filters: { brand: 'Samsung', ramGb: 8 } },
      { filters: { priceRange: { min: 200, max: 1000 } } },
      { filters: { ramGb: 12, internalStorage: '256' } },
      { filters: { brand: 'OnePlus', displayType: 'AMOLED' } },
      { 
        filters: { 
          brand: 'Apple', 
          ramGb: 6, 
          priceRange: { min: 500, max: 1500 },
          internalStorage: '128'
        } 
      },
      { 
        filters: {},
        sortBy: 'price_unofficial',
        sortOrder: 'desc',
        page: 1,
        limit: 50
      }
    ];

    const totalRequests = concurrentUsers * requestsPerUser;
    const startTime = Date.now();

    const userPromises = Array.from({ length: concurrentUsers }, async (_, userIndex) => {
      const userResults = [];
      
      for (let i = 0; i < requestsPerUser; i++) {
        const searchPayload = searchVariations[i % searchVariations.length];
        const requestStart = Date.now();
        
        try {
          const response = await fetch(`${this.baseUrl}/devices/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(searchPayload)
          });
          
          const responseTime = Date.now() - requestStart;
          
          if (response.ok) {
            const data = await response.json();
            userResults.push({
              success: true,
              responseTime,
              dataSize: JSON.stringify(data).length,
              resultCount: data.data?.phones?.length || 0,
              executionTime: data.data?.executionTime || 0
            });
          } else {
            userResults.push({
              success: false,
              responseTime,
              error: `HTTP ${response.status}`,
              statusCode: response.status
            });
          }
        } catch (error) {
          const responseTime = Date.now() - requestStart;
          userResults.push({
            success: false,
            responseTime,
            error: error.message
          });
        }
      }
      
      return userResults;
    });

    const allResults = (await Promise.all(userPromises)).flat();
    const endTime = Date.now();
    
    this.processResults(allResults, totalRequests, endTime - startTime);
    this.logResults('Search');
  }

  /**
   * Test phone details endpoint with various phone IDs
   */
  async testPhoneDetails(concurrentUsers = 12, requestsPerUser = 10) {
    console.log(`\n🔍 Testing Phone Details (${concurrentUsers} concurrent users, ${requestsPerUser} requests each)`);
    this.results = { ...this.results, endpoint: 'GET /devices/:id', concurrentUsers };

    // Test with phone IDs 1-50 (assuming they exist)
    const phoneIds = Array.from({ length: 50 }, (_, i) => i + 1);
    const totalRequests = concurrentUsers * requestsPerUser;
    const startTime = Date.now();

    const userPromises = Array.from({ length: concurrentUsers }, async (_, userIndex) => {
      const userResults = [];
      
      for (let i = 0; i < requestsPerUser; i++) {
        const phoneId = phoneIds[Math.floor(Math.random() * phoneIds.length)];
        const requestStart = Date.now();
        
        try {
          const response = await fetch(`${this.baseUrl}/devices/${phoneId}`);
          const responseTime = Date.now() - requestStart;
          
          if (response.ok) {
            const data = await response.json();
            userResults.push({
              success: true,
              responseTime,
              dataSize: JSON.stringify(data).length,
              phoneId
            });
          } else {
            userResults.push({
              success: false,
              responseTime,
              error: `HTTP ${response.status}`,
              statusCode: response.status,
              phoneId
            });
          }
        } catch (error) {
          const responseTime = Date.now() - requestStart;
          userResults.push({
            success: false,
            responseTime,
            error: error.message,
            phoneId
          });
        }
      }
      
      return userResults;
    });

    const allResults = (await Promise.all(userPromises)).flat();
    const endTime = Date.now();
    
    this.processResults(allResults, totalRequests, endTime - startTime);
    this.logResults('Phone Details');
  }

  /**
   * Process and analyze test results
   */
  processResults(results, totalRequests, totalTime) {
    this.results.totalRequests = totalRequests;
    this.results.successfulRequests = results.filter(r => r.success).length;
    this.results.failedRequests = results.filter(r => !r.success).length;
    
    const responseTimes = results.map(r => r.responseTime);
    this.results.responseTimes = responseTimes;
    this.results.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    this.results.minResponseTime = Math.min(...responseTimes);
    this.results.maxResponseTime = Math.max(...responseTimes);
    this.results.throughput = (totalRequests / totalTime) * 1000; // requests per second

    // Count error types
    results.filter(r => !r.success).forEach(r => {
      const errorType = r.statusCode || r.error || 'Unknown';
      this.results.errorTypes[errorType] = (this.results.errorTypes[errorType] || 0) + 1;
    });

    // Track memory usage if available
    if (process.memoryUsage) {
      this.results.memoryUsage.push(process.memoryUsage());
    }
  }

  /**
   * Log test results
   */
  logResults(testName) {
    const successRate = (this.results.successfulRequests / this.results.totalRequests) * 100;
    
    console.log(`\n📊 ${testName} Results:`);
    console.log(`  Total Requests: ${this.results.totalRequests}`);
    console.log(`  Successful: ${this.results.successfulRequests} (${successRate.toFixed(1)}%)`);
    console.log(`  Failed: ${this.results.failedRequests}`);
    console.log(`  Average Response Time: ${this.results.averageResponseTime.toFixed(2)}ms`);
    console.log(`  Min Response Time: ${this.results.minResponseTime}ms`);
    console.log(`  Max Response Time: ${this.results.maxResponseTime}ms`);
    console.log(`  Throughput: ${this.results.throughput.toFixed(2)} requests/second`);
    
    if (Object.keys(this.results.errorTypes).length > 0) {
      console.log(`  Error Types:`, this.results.errorTypes);
    }

    // Performance assessment
    if (this.results.averageResponseTime > 1000) {
      console.log(`  ⚠️  Warning: High average response time (>${this.results.averageResponseTime.toFixed(0)}ms)`);
    } else if (this.results.averageResponseTime < 200) {
      console.log(`  ✅ Excellent response time (${this.results.averageResponseTime.toFixed(0)}ms)`);
    } else if (this.results.averageResponseTime < 500) {
      console.log(`  ✅ Good response time (${this.results.averageResponseTime.toFixed(0)}ms)`);
    }

    if (successRate < 95) {
      console.log(`  ⚠️  Warning: Low success rate (${successRate.toFixed(1)}%)`);
    } else {
      console.log(`  ✅ High success rate (${successRate.toFixed(1)}%)`);
    }
  }

  /**
   * Test database connection under load
   */
  async testDatabaseLoad() {
    console.log(`\n🗄️  Testing Database Connection Pool`);
    
    const startTime = Date.now();
    const concurrentConnections = 20;
    const queriesPerConnection = 10;

    const connectionPromises = Array.from({ length: concurrentConnections }, async (_, connIndex) => {
      const connectionResults = [];
      
      for (let i = 0; i < queriesPerConnection; i++) {
        const queryStart = Date.now();
        
        try {
          // Test with a complex query that exercises the database
          const response = await fetch(`${this.baseUrl}/devices/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filters: {
                brand: ['Apple', 'Samsung', 'OnePlus'][i % 3],
                ramGb: [6, 8, 12][i % 3]
              },
              page: Math.floor(i / 2) + 1,
              limit: 20
            })
          });
          
          const queryTime = Date.now() - queryStart;
          
          if (response.ok) {
            const data = await response.json();
            connectionResults.push({
              success: true,
              queryTime,
              executionTime: data.data?.executionTime || 0,
              connection: connIndex
            });
          } else {
            connectionResults.push({
              success: false,
              queryTime,
              error: `HTTP ${response.status}`,
              connection: connIndex
            });
          }
        } catch (error) {
          const queryTime = Date.now() - queryStart;
          connectionResults.push({
            success: false,
            queryTime,
            error: error.message,
            connection: connIndex
          });
        }
      }
      
      return connectionResults;
    });

    const allConnectionResults = (await Promise.all(connectionPromises)).flat();
    const endTime = Date.now();

    const successful = allConnectionResults.filter(r => r.success);
    const avgQueryTime = successful.reduce((sum, r) => sum + r.queryTime, 0) / successful.length;
    const avgExecutionTime = successful.reduce((sum, r) => sum + r.executionTime, 0) / successful.length;

    console.log(`  Database Load Test Results:`);
    console.log(`  Concurrent Connections: ${concurrentConnections}`);
    console.log(`  Total Queries: ${allConnectionResults.length}`);
    console.log(`  Successful Queries: ${successful.length}`);
    console.log(`  Average Query Time: ${avgQueryTime.toFixed(2)}ms`);
    console.log(`  Average DB Execution Time: ${avgExecutionTime.toFixed(2)}ms`);
    console.log(`  Test Duration: ${endTime - startTime}ms`);
  }

  /**
   * Generate comprehensive test report
   */
  generateReport() {
    const reportData = {
      timestamp: new Date().toISOString(),
      testConfiguration: {
        baseUrl: this.baseUrl,
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage()
      },
      results: this.results,
      recommendations: this.generateRecommendations()
    };

    const reportPath = path.join(__dirname, `scalability-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    
    console.log(`\n📄 Full report saved to: ${reportPath}`);
    return reportData;
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.results.averageResponseTime > 500) {
      recommendations.push("Consider adding database indexes for frequently queried columns");
      recommendations.push("Implement connection pooling if not already in place");
    }

    if (this.results.failedRequests > 0) {
      recommendations.push("Investigate error handling and add retry mechanisms");
      recommendations.push("Consider implementing circuit breaker pattern for resilience");
    }

    if (this.results.throughput < 10) {
      recommendations.push("Consider horizontal scaling or load balancing");
      recommendations.push("Optimize database queries and add caching layer");
    }

    return recommendations;
  }
}

// Main test execution
async function runScalabilityTests() {
  console.log('🚀 Starting Scalability Tests for Mobile Phone Database');
  console.log('===============================================');

  const tester = new ScalabilityTester();

  try {
    // Test individual endpoints
    await tester.testFilterOptions(10, 20);
    await tester.testSearch(8, 15);
    await tester.testPhoneDetails(12, 10);
    
    // Test database under load
    await tester.testDatabaseLoad();
    
    // Generate comprehensive report
    const report = tester.generateReport();
    
    console.log('\n🎯 Overall Performance Assessment:');
    console.log('================================');
    
    if (report.recommendations.length > 0) {
      console.log('📋 Recommendations:');
      report.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    } else {
      console.log('✅ No major performance issues detected!');
    }

  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runScalabilityTests().then(() => {
    console.log('\n✅ Scalability testing completed!');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Scalability testing failed:', error);
    process.exit(1);
  });
}

module.exports = { ScalabilityTester };