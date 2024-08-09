const { Client } = require('pg');
const h3 = require('h3-js');

exports.handler = async (event, context) => {
  let client;
  try {
    const connectionString = process.env.POSTGRES_URL_NON_POOLING;
    if (!connectionString) {
      throw new Error('Postgres connection string is not set');
    }

    client = new Client({
      connectionString: connectionString,
    });

    await client.connect();
    console.log('Database connected successfully');

    const result = await client.query('SELECT h3_index, visits FROM h3_level_9 WHERE visits > 0');
    console.log('Query executed successfully', result.rows);

    const visitedH3s = result.rows.map(row => {
      const h3Index = row.h3_index;
      const visits = row.visits;
      const hexBoundary = h3.h3ToGeoBoundary(h3Index, true);

      const boundaryCoords = hexBoundary.map(coord => [coord[0], coord[1]]);

      return {
        H3Index: h3Index,
        HexBoundary: boundaryCoords,
        Visits: visits
      };
    });

    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify(visitedH3s),
    };
  } catch (error) {
    console.error('Failed to retrieve visited H3 indexes:', error.message);

    if (client) {
      await client.end();
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to retrieve visited H3 indexes', details: error.message }),
    };
  }
};