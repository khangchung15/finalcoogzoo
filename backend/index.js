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

// Function to check if an email exists in the Employee, Customer, or Passwords table
const checkEmailExists = (email, callback) => {
  connection.query('SELECT * FROM Employee WHERE email = ?', [email], (err, employeeResults) => {
    if (err) return callback(err);

    if (employeeResults.length > 0) {
      return callback(null, true); // Email exists in Employee table
    } else {
      connection.query('SELECT * FROM Customer WHERE email = ?', [email], (err, customerResults) => {
        if (err) return callback(err);

        if (customerResults.length > 0) {
          return callback(null, true); // Email exists in Customer table
        } else {
          connection.query('SELECT * FROM Passwords WHERE email = ?', [email], (err, passwordResults) => {
            if (err) return callback(err);
            callback(null, passwordResults.length > 0); // Email exists in Passwords table
          });
        }
      });
    }
  });
};

// Function to add a user to the database during signup
const addUser = (userData, res) => {
  const { name, email, phone, password, dateOfBirth } = userData;

  checkEmailExists(email, (err, exists) => {
    if (err) return handleDBError(res, err);
    if (exists) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'Email already exists' }));
    }

    // Proceed to insert the new user into the Customer and Passwords tables
    connection.query(
      'INSERT INTO Customer (Name, email, phone, DateOfBirth) VALUES (?, ?, ?, ?)',
      [name, email, phone, dateOfBirth],
      (err, result) => {
        if (err) return handleDBError(res, err);

        // Insert the password into the Passwords table
        connection.query(
          'INSERT INTO Passwords (email, password) VALUES (?, ?)',
          [email, password],
          (err) => {
            if (err) return handleDBError(res, err);

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Signup successful' }));
          }
        );
      }
    );
  });
};

// Function to check user credentials for login
const checkUser = (email, password, callback) => {
  connection.query('SELECT * FROM Employee WHERE Email = ?', [email], (err, employeeResults) => {
    if (err) return callback(err);

    if (employeeResults.length > 0) {
      const employee = employeeResults[0];
      connection.query('SELECT role FROM Employee WHERE Email = ?', [email], (err, roleResults) => {
        if (err) return callback(err);

        if (roleResults.length > 0) {
          const role = roleResults[0].role;
          connection.query('SELECT password FROM Passwords WHERE email = ?', [email], (err, passwordResults) => {
            if (err) return callback(err);

            if (passwordResults.length > 0 && passwordResults[0].password === password) {
              callback(null, { email, role, type: 'employee' });
            } else {
              callback('Invalid password');
            }
          });
        } else {
          callback('Role not found');
        }
      });
    } else {
      connection.query('SELECT * FROM Customer WHERE email = ?', [email], (err, customerResults) => {
        if (err) return callback(err);

        if (customerResults.length > 0) {
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

// Function to fetch profile data based on user type
const fetchProfileData = (user, res) => {
  if (user.type.toLowerCase() === 'customer') {
    connection.query('SELECT ID, Name, phone, email, DateOfBirth FROM Customer WHERE email = ?', [user.email], (err, results) => {
      if (err) return handleDBError(res, err);
      if (results.length > 0) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ profile: results[0] }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Profile not found' }));
      }
    });
  } else if (user.type.toLowerCase() === 'employee') {
    connection.query('SELECT ID, Name, phone, email FROM Employee WHERE email = ?', [user.email], (err, results) => {
      if (err) return handleDBError(res, err);
      if (results.length > 0) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ profile: results[0] }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Profile not found' }));
      }
    });
  }
};

// HTTP Server to handle both login, signup, and profile requests
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
        console.log('Received signup data:', jsonData); // Log for debugging
        addUser(jsonData, res);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid JSON' }));
      }
    });
  } else if (req.method === 'GET' && req.url.startsWith('/profile')) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const email = url.searchParams.get('email');
    const type = url.searchParams.get('type');

    if (email && type) {
      fetchProfileData({ email, type }, res);
    } else {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Email and type are required' }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Route not found' }));
  }
}).listen(5000, () => {
  console.log('Server is listening on port 5000');
});
