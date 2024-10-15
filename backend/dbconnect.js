const http = require('http'); // Ensure this line is present
const mysql = require('mysql2');
const port = 3000;

const connection = mysql.createConnection({
  host: 'database-1.cpia0w4c2ec6.us-east-2.rds.amazonaws.com',
  user: 'admin',
  password: 'zoodatabase1',
  database: 'SampleDB', // Update the database name here
});

// Verify connection to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the SampleDB database.');
});

// Create the server
const server = http.createServer((req, res) => {
  console.log(`Received request: ${req.method} ${req.url}`); // Log all requests
  if (req.method === 'GET' && req.url === '/api/customers') {
    console.log('Received request for /api/customers'); // Debug log

    // Query to select all data from the customers table
    connection.query('SELECT * FROM customers', (error, results) => {
      if (error) {
        console.error('Error executing query:', error); // Log the error
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error fetching data' }));
        return;
      }

      // Print the results to the terminal in a readable format
      console.log('Fetched customers:', JSON.stringify(results, null, 2)); // Log the results

      // Instead of sending results as a response, we will just send a success message
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Results printed to console.' }));
    });
  } else {
    console.log(`Unhandled request: ${req.method} ${req.url}`); // Log unhandled requests
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// Start the server
server.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});