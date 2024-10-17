const http = require('http');
const mysql = require('mysql2');
const port = 3000;

// Create and configure database connection
const connection = mysql.createConnection({
  host: 'database-1.cpia0w4c2ec6.us-east-2.rds.amazonaws.com',
  user: 'admin',
  password: 'zoodatabase1',
  database: 'SampleDB',
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the SampleDB database.');
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

// Handle the addition of a new user
const bcrypt = require('bcrypt');

// Handle the addition of a new user
const addUser = (jsonData, res) => {
  const { username, password, email } = jsonData;
  
  // Hash the password before storing it
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return handleDBError(res, err);

    const query = `INSERT INTO customers(username, password, email) VALUES (?, ?, ?)`;
    const values = [username, hashedPassword, email];

    connection.query(query, values, (error, results) => {
      if (error) return handleDBError(res, error);

      console.log('User added:', JSON.stringify(results, null, 2));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User added successfully' }));
    });
  });
};



// Fetch all customers from the database
const fetchCustomers = (res) => {
  connection.query('SELECT * FROM customers', (error, results) => {
    if (error) return handleDBError(res, error);

    console.log('Fetched customers:', JSON.stringify(results, null, 2));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(results));
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

  if (req.method === 'GET' && req.url === '/api/customers') {
    fetchCustomers(res);
  } else if (req.method === 'POST' && req.url === '/api/signup') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const jsonData = JSON.parse(body);
        addUser(jsonData, res);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON format' }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// Start the server
server.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});

// Goes in frontend

// useEffect(() => {
//   fetch('http://localhost:3000/api/signup', {
//     method: "POST",
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(
//       {
//         first_name: "Someone",
//         last_name: "else",
//         email: "test3524234234@email.com",
//         phone_number: "35223523523",
//       }
//     )
//   });
// }, []);