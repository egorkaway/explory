const h3 = require('h3-js');

exports.handler = async (event, context) => {
  try {
    const { lat, lng, level } = event.queryStringParameters;

    if (!lat || !lng || !level) {
      throw new Error('Missing required query parameters: lat, lng, or level');
    }

    const latFloat = parseFloat(lat);
    const lngFloat = parseFloat(lng);
    const levelInt = parseInt(level, 10);

    if (isNaN(latFloat) || isNaN(lngFloat) || isNaN(levelInt)) {
      throw new Error('Invalid query parameters: lat, lng, or level');
    }

    const h3Index = h3.geoToH3(latFloat, lngFloat, levelInt);
    const hexBoundary = h3.h3ToGeoBoundary(h3Index);

    const boundaryCoords = hexBoundary.map(coord => [coord[0], coord[1]]);

    const responseData = {
      h3Index,
      hexBoundary: boundaryCoords,
      message: `Hex boundary for H3 index ${h3Index} at level ${levelInt}`,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(responseData),
    };
  } catch (error) {
    console.error('Failed to process H3 request:', error.message);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process H3 request', details: error.message }),
    };
  }
};