const { Client } = require('pg');
const h3 = require('h3-js');

exports.handler = async (event, context) => {
  let client;
  try {
    const connectionString = process.env.POSTGRES_URL_NON_POOLING;
    client = new Client({
      connectionString: connectionString,
    });

    await client.connect();

    const result = await client.query('SELECT h3_index, visits FROM h3_level_9 WHERE visits > 0');

    const visitedH3s = result.rows.map(row => {
      const h3Index = row.h3_index;
      const visits = row.visits;
      const hexBoundary = h3ToGeoBoundary(h3Index);
      return {
        h3Index,
        hexBoundary,
        visits
      };
    });

    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify(visitedH3s),
    };
  } catch (error) {
    console.error('Failed to retrieve visited H3 indexes:', error);

    if (client) {
      await client.end();
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to retrieve visited H3 indexes' }),
    };
  }
};

function h3ToGeoBoundary(h3Index) {
  // Using the h3-js library to get the geo boundary for the given h3Index
  const hexBoundary = h3.h3ToGeoBoundary(h3Index);
  const formattedBoundary = hexBoundary.map(coord => [coord[0], coord[1]]);
  return formattedBoundary;
}