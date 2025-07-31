// Simple test for filter options endpoint
const { DatabaseConnection } = require('./backend/database/connection.ts');
const { QueryBuilder } = require('./backend/database/queryBuilder.ts');

async function testFilterOptions() {
  try {
    console.log('Testing filter options query...');
    
    const queryBuilder = new QueryBuilder();
    const queryResult = queryBuilder.buildFilterOptionsQuery();
    
    console.log('Generated SQL Query:');
    console.log(queryResult.query);
    console.log('\nParameters:', queryResult.params);
    
    // Execute the query
    const result = await queryBuilder.executeQueryWithDetails(queryResult);
    
    console.log('\nQuery Results:');
    console.log('Execution Time:', result.executionTime, 'ms');
    console.log('Results:', JSON.stringify(result.results, null, 2));
    
    // Process the results like the controller does
    const filterOptions = {
      brands: [],
      chipsets: [],
      displayTypes: [],
      storageOptions: [],
      priceRange: { min: 0, max: 0 }
    };

    if (Array.isArray(result.results)) {
      result.results.forEach((row) => {
        try {
          if (row.type === 'brands' && row.options) {
            filterOptions.brands = typeof row.options === 'string' ? JSON.parse(row.options) : row.options;
          } else if (row.type === 'chipsets' && row.options) {
            filterOptions.chipsets = typeof row.options === 'string' ? JSON.parse(row.options) : row.options;
          } else if (row.type === 'displayTypes' && row.options) {
            filterOptions.displayTypes = typeof row.options === 'string' ? JSON.parse(row.options) : row.options;
          } else if (row.type === 'storageOptions' && row.options) {
            const storageData = typeof row.options === 'string' ? JSON.parse(row.options) : row.options;
            filterOptions.storageOptions = Array.isArray(storageData) ? storageData.sort((a, b) => a - b) : [];
          } else if (row.type === 'priceRange' && row.options) {
            filterOptions.priceRange = typeof row.options === 'string' ? JSON.parse(row.options) : row.options;
          }
        } catch (parseError) {
          console.warn(`Failed to parse ${row.type} options:`, parseError);
        }
      });
    }

    console.log('\nProcessed Filter Options:');
    console.log(JSON.stringify(filterOptions, null, 2));
    
    console.log('\n✅ Filter options test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFilterOptions();