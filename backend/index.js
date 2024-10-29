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

// Ticket System

const purchaseTicket = async (ticketData, res) => {
  try {
    const customerId = await getCustomerIdByEmail(ticketData.email);
    const purchaseDate = new Date().toISOString().split('T')[0];

    // Insert into Receipt table
    const insertReceiptQuery = 'INSERT INTO Receipt (Customer_ID, Item_IDs, Total_Amount, Purchase_Date) VALUES (?, ?, ?, ?)';
    const itemIDs = '1'; // Specify item IDs if needed
    const totalAmount = ticketData.price;

    connection.query(insertReceiptQuery, [customerId, itemIDs, totalAmount, purchaseDate], (err, receiptResult) => {
      if (err) return handleDBError(res, err);

      const receiptId = receiptResult.insertId;

      // Insert into Ticket table using the new Receipt ID
      const insertTicketQuery = 'INSERT INTO Ticket (Customer_ID, Ticket_Type, Price, Purchase_Date, Receipt_ID) VALUES (?, ?, ?, ?, ?)';
      
      connection.query(insertTicketQuery, [customerId, ticketData.ticketType, ticketData.price, purchaseDate, receiptId], (err) => {
        if (err) return handleDBError(res, err);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Ticket purchased successfully', receiptId }));
      });
    });
  } catch (error) {
    handleDBError(res, error);
  }
};

// Ticket System Finished //

const getCustomerIdByEmail = (email) => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT ID FROM Customer WHERE email = ?', [email], (error, results) => {
      if (error) reject(error);
      if (results.length === 0) reject(new Error('Customer not found'));
      resolve(results[0].ID);
    });
  });
};

const fetchPurchasedTickets = (email, res) => {
  const query = `
    SELECT 
      t.ID,
      t.Ticket_Type,
      t.Price,
      t.Purchase_Date,
      t.Receipt_ID,
      r.Total_Amount
    FROM Ticket t
    JOIN Receipt r ON t.Receipt_ID = r.ID
    JOIN Customer c ON t.Customer_ID = c.ID
    WHERE c.email = ?
    ORDER BY t.Purchase_Date DESC`;

  connection.query(query, [email], (error, results) => {
    if (error) return handleDBError(res, error);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(results));
  });
};


// Code for Employee Dash

const fetchAnimalsByExhibitID = (exhibitId, res) => {
  const query = `
    SELECT 
      Animal.ID, 
      Animal.Name, 
      Animal.Species, 
      Animal.Cage_ID, 
      Cage.Location, 
      Cage.Type, 
      Cage.ID,
      FeedingSchedule.Feeding_Time
    FROM 
      Animal
    JOIN 
      Cage ON Animal.Cage_ID = Cage.ID
    JOIN 
      FeedingSchedule ON FeedingSchedule.Animal_ID = Animal.ID
    WHERE 
      Animal.Exhibit_ID = ?
  `;

  connection.query(query, [exhibitId], (error, results) => {
    if (error) return handleDBError(res, error);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(results));
  });
};
// Code for Employee Dash
const fetchExhibitIDByEmail = (email, res) => {
  connection.query('SELECT Exhibit_ID FROM Employee WHERE Email = ?', [email], (error, results) => {
    if (error) return handleDBError(res, error);

    if (results.length > 0) {
      const { Exhibit_ID } = results[0];
      fetchAnimalsByExhibitID(Exhibit_ID, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Employee not found' }));
    }
  });
};

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

const purchaseTicket = (ticketData, res) => {
  const { customerId, ticketType, price } = ticketData;
  const purchaseDate = new Date().toISOString().split('T')[0];

  // Insert into Receipt table
  const insertReceiptQuery = 'INSERT INTO Receipt (Customer_ID, Item_IDs, Total_Amount, Purchase_Date) VALUES (?, ?, ?, ?)';
  const itemIDs = '1'; // Specify item IDs if needed
  const totalAmount = price;

  connection.query(insertReceiptQuery, [customerId, itemIDs, totalAmount, purchaseDate], (err, receiptResult) => {
    if (err) return handleDBError(res, err);

    const receiptId = receiptResult.insertId;

    // Insert into Ticket table using the new Receipt ID
    const insertTicketQuery = 'INSERT INTO Ticket (Customer_ID, Ticket_Type, Price, Purchase_Date, Receipt_ID) VALUES (?, ?, ?, ?, ?)';
    
    connection.query(insertTicketQuery, [customerId, ticketType, price, purchaseDate, receiptId], (err) => {
      if (err) return handleDBError(res, err);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Ticket purchased successfully', receiptId }));
    });
  });
};

const purchaseTicketHandler = (req, res) => {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', () => {
    try {
      const ticketData = JSON.parse(body);
      purchaseTicket(ticketData, res); // Call your purchaseTicket function
    } catch (error) {
      console.error('Error parsing ticket data:', error);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid ticket data' }));
    }
  });
};


// Function to add a user to the database during signup
const addUser = (userData, res) => {
  const { firstName, lastName, email, phone, password, dateOfBirth } = userData;

  // Combine first and last name for the Name field

  checkEmailExists(email, (err, exists) => {
    if (err) return handleDBError(res, err);
    if (exists) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'Email already exists' }));
    }

    // Insert into Customer table with the combined name
    connection.query(
      'INSERT INTO Customer (First_name, Last_name, email, phone, DateOfBirth) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, email, phone, dateOfBirth],
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
    connection.query('SELECT ID, First_name, Last_name, phone, email, DateOfBirth FROM Customer WHERE email = ?', [user.email], (err, results) => {
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
    console.log(email);
    console.log(type);
    if (email && type) {
      fetchProfileData({ email, type }, res);
    } else {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Email and type are required' }));
    }


  } else if (req.method === 'GET' && req.url === '/tickets'){
      // Return available ticket types and prices
  const ticketTypes = [
    { type: 'Child', price: 10, description: 'Ages 3-12' },
    { type: 'Adult', price: 20, description: 'Ages 13-64' },
    { type: 'Senior', price: 15, description: 'Ages 65+' }
  ];
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(ticketTypes));
  }else if(req.method === 'POST' && req.url === '/tickets'){
    let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    try {
      const ticketData = JSON.parse(body);
      purchaseTicket(ticketData, res);
    } catch (error) {
      console.error('Error processing ticket purchase:', error);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid ticket data' }));
    }
  });
  }else if (req.method === 'GET' && req.url === '/animals'){
      fetchAnimals(res);
    }else if (req.method === 'GET' && req.url === '/exhibits'){
      fetchExhibits(res);
    }else if (req.method === 'GET' && req.url === '/events'){
      fetchEvents(res);
    }else if (req.method === 'GET' && req.url.startsWith('/purchased-tickets')){
      const url = new URL(req.url, `http://${req.headers.host}`);
      const email = url.searchParams.get('email');
  
    if (email) {
    fetchPurchasedTickets(email, res);
    } else {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Email is required' }));}
  
    }else if(req.method === 'GET' && req.url.startsWith('/employee-animals')){
      const url = new URL(req.url, `http://${req.headers.host}`);
      const email = url.searchParams.get('email');
      if (email) {
        fetchExhibitIDByEmail(email, res);
      } else {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Email is required' }));
      }
    } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Route not found' }));
  }
}).listen(5000, () => {
  console.log('Server is listening on port 5000');
});