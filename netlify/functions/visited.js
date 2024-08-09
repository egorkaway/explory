const { Client } = require('pg');

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
  // This is a placeholder function. You need to use a library or implement logic
  // to convert h3Index to geoBoundary similar to how it's done in the Go code.
  return [
    [37.78052, -122.4376],
    [37.78227, -122.43486],
  ]; // Dummy data for example
}