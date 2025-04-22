// Netlify Function for API Proxy
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Set CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*', // For production, change to your Squarespace URL
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  // Handle OPTIONS request (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Parse query parameters
  const { lat, lon, resolution, version } = event.queryStringParameters || {};
  
  if (!lat || !lon) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing required parameters: lat and lon' })
    };
  }
  
  try {
    // Build the query to your actual API
    const apiUrl = 'https://7vut592qv8.execute-api.eu-west-2.amazonaws.com/beta/scenic-recommendations';
    const params = new URLSearchParams({
      lat,
      lon,
      resolution: resolution || 9,
      version: version || 12
    });
    
    // Make the API request with your key securely from the server
    const response = await fetch(`${apiUrl}?${params}`, {
      headers: {
        'x-api-key': process.env.SCENIC_API_KEY // Set this in Netlify environment variables
      }
    });
    
    // Check for error status
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }
    
    // Get the response data
    const data = await response.json();
    
    // Return the API response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.log('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch POI data', message: error.message })
    };
  }
};
