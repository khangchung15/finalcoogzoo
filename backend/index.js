const http = require('http');
const mysql = require('mysql2');
const port = 3000;

// Create and configure database connection
const connection = mysql.createConnection({
  host: 'database-1.cpia0w4c2ec6.us-east-2.rds.amazonaws.com',
  user: 'admin',
  password: 'zoodatabase1',
  database: 'ZooManagement',
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the ZooManagement database.');
});

// Set common CORS headers
const setCORSHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

// Handle database errors and send a response
const handleDBError = (res, error) => {
  console.error('Error executing query:', error);
  res.writeHead(500, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Error processing the request' }));
};

// Fetch all exhibits from the database
const fetchExhibits = (res) => {
  connection.query('SELECT * FROM Exhibit', (error, results) => {
    if (error) return handleDBError(res, error);

    console.log('Fetched exhibits:', JSON.stringify(results, null, 2));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(results));
  });
};

// Fetch all animals from the database
const fetchAnimals = (res) => {
  connection.query('SELECT * FROM AnimalShowcase', (error, results) => {
    if (error) return handleDBError(res, error);

    console.log('Fetched animals:', JSON.stringify(results, null, 2));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(results));
  });
};

// Fetch all events from the database
const fetchEvents = (res) => {
  connection.query('SELECT * FROM Event', (error, results) => {
    if (error) return handleDBError(res, error);

    if (results.length === 0) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify([])); // Return empty array if no events
    } else {
      console.log('Fetched events:', JSON.stringify(results, null, 2));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(results));
    }
  });
};

// Create the server
const server = http.createServer((req, res) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  setCORSHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/api/events') {
    fetchEvents(res); // Handle fetching events
  } else if (req.method === 'GET' && req.url === '/api/animals') {
    fetchAnimals(res); // Handle fetching animals
  } else if (req.method === 'GET' && req.url === '/api/exhibits') {
    fetchExhibits(res); // Handle fetching exhibits
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});


// Start the server
server.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});
