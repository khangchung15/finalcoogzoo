const mysql = require('mysql2');
const http = require('http');

// MySQL connection setup
const connection = mysql.createConnection({
  host: 'database-1.cpia0w4c2ec6.us-east-2.rds.amazonaws.com',
  user: 'admin',
  password: 'zoodatabase1',
  database: 'ZooManagement'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the ZooManagement database.');
});

// Set CORS headers
const setCORSHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

// Function to handle database errors
const handleDBError = (res, error) => {
  console.error('Error executing query:', error);
  res.writeHead(500, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Error processing the request' }));
};

// Function to check user credentials for login
const checkUser = (email, password, callback) => {
  // Check if the email exists in the Employee table
  connection.query('SELECT * FROM Employee WHERE Email = ?', [email], (err, employeeResults) => {
    if (err) return callback(err);

    if (employeeResults.length > 0) {
      // User is an employee
      const employee = employeeResults[0];
      
      // Check password from Passwords table
      connection.query('SELECT password FROM Passwords WHERE email = ?', [email], (err, passwordResults) => {
        if (err) return callback(err);

        if (passwordResults.length > 0 && passwordResults[0].password === password) {
          // Password matches, check role
          const role = employee.role; // Assuming role is a field in Employee table
          callback(null, { email, role, type: 'employee' });
        } else {
          callback('Invalid password');
        }
      });
    } else {
      // Check if the email exists in the Customer table
      connection.query('SELECT * FROM Customer WHERE email = ?', [email], (err, customerResults) => {
        if (err) return callback(err);

        if (customerResults.length > 0) {
          // User is a customer
          // Check password from Passwords table
          connection.query('SELECT password FROM Passwords WHERE email = ?', [email], (err, passwordResults) => {
            if (err) return callback(err);

            if (passwordResults.length > 0 && passwordResults[0].password === password) {
              callback(null, { email, type: 'customer' });
            } else {
              callback('Invalid password');
            }
          });
        } else {
          callback('User not found');
        }
      });
    }
  });
};

// Function to add a new user during signup
const addUser = (jsonData, res) => {
  const { username, password, email } = jsonData;
  
  // No password hashing for signup, storing raw password (can be replaced with hashing logic)
  const query = 'INSERT INTO customers(username, password, email) VALUES (?, ?, ?)';
  const values = [username, password, email];

  connection.query(query, values, (error, results) => {
    if (error) return handleDBError(res, error);

    console.log('User added:', JSON.stringify(results, null, 2));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'User added successfully' }));
  });
};

// HTTP Server to handle both login and signup requests
http.createServer((req, res) => {
  setCORSHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.method === 'POST' && req.url === '/login') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const { email, password } = JSON.parse(body);
      checkUser(email, password, (err, user) => {
        if (err) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: err }));
        } else {
          // Return the user's role and other info
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Login successful', user }));
        }
      });
    });
  } else if (req.method === 'POST' && req.url === '/signup') {
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
}).listen(5000, () => {
  console.log('Server listening on port 5000');
});
