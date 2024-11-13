const mysql = require('mysql2');
const http = require('http');

// MySQL connection setup
const connection = mysql.createConnection({
  host: 'database-1.cpia0w4c2ec6.us-east-2.rds.amazonaws.com',
  user: 'admin',
  password: 'zoodatabase1',
  database: 'ZooManagement',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

// Function to handle database errors
const handleDBError = (res, error) => {
  console.error('Error executing query:', error);
  res.writeHead(500, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Error processing the request', details: error.message }));
};

const parseBody = async (req) => {
  const buffers = [];
  for await (const chunk of req) {
    buffers.push(chunk);
  }
  const data = Buffer.concat(buffers).toString();
  return JSON.parse(data);
};

//Employee Section
const fetchEmployees = async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    const [results] = await conn.query('SELECT * FROM Employee WHERE is_deleted = 0');
    
    return results.map(employee => ({
      id: employee.ID,
      firstName: employee.First_Name,
      lastName: employee.Last_Name,
      birthDate: employee.Birth_Date ? new Date(employee.Birth_Date).toISOString().split('T')[0] : null,
      email: employee.Email,
      phone: employee.Phone,
      department: employee.Department,
      role: employee.Role,
      startDate: employee.Start_Date ? new Date(employee.Start_Date).toISOString().split('T')[0] : null,
      exhibitID: employee.Exhibit_ID,
      supervisorID: employee.Supervisor_ID,
      status: employee.Status,
      endDate: employee.End_Date ? new Date(employee.End_Date).toISOString().split('T')[0] : null,
    }));
  } catch (error) {
    throw error;
  } finally {
    if (conn) conn.release();
  }
};
const addEmployee = (employeeData, res) => {
  const { firstName, lastName, birthDate, email, phone, department, role, startDate, exhibitID, status, supervisorID, endDate } = employeeData;
  checkEmailExists(email, (err, exists) => {
    if (err) return handleDBError(res, err);
    if (exists) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'Email already exists' }));
    }
    connection.query(
      `INSERT INTO Employee (First_Name, Last_Name, Birth_Date, Email, Phone, Department, Role, Start_Date, Exhibit_ID, Supervisor_ID, Status, End_Date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, birthDate, email, phone, department, role, startDate, exhibitID || null, status, supervisorID || null, endDate || null],
      (err) => {
        if (err) return handleDBError(res, err);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Employee added successfully' }));
      }
    );
  });
};
const removeEmployee = (employeeId, res) => {
  connection.query(
    'UPDATE Employee SET is_deleted = 1 WHERE ID = ?',
    [employeeId],
    (err, result) => {
      if (err) return handleDBError(res, err);
      if (result.affectedRows > 0) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Employee removed successfully (soft-deleted).' }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Employee not found' }));
      }
    }
  );
};
const updateEmployee = (employeeId, employeeData, res) => {
  const normalizedData = {
    First_Name: employeeData.firstName,
    Last_Name: employeeData.lastName,
    Birth_Date: employeeData.birthDate,
    Email: employeeData.email,
    Phone: employeeData.phone,
    Department: employeeData.department,
    Role: employeeData.role,
    Start_Date: employeeData.startDate,
    Exhibit_ID: employeeData.exhibitID || null,
    Supervisor_ID: employeeData.supervisorID || null,
    Status: employeeData.status,
    End_Date: employeeData.endDate || null
  };
  connection.query(
    `UPDATE Employee 
     SET First_Name = ?, Last_Name = ?, Birth_Date = ?, Email = ?, Phone = ?, 
         Department = ?, Role = ?, Start_Date = ?, Exhibit_ID = ?, Supervisor_ID = ?, 
         Status = ?, End_Date = ? 
     WHERE ID = ?`,
    [
      normalizedData.First_Name,
      normalizedData.Last_Name,
      normalizedData.Birth_Date,
      normalizedData.Email,
      normalizedData.Phone,
      normalizedData.Department,
      normalizedData.Role,
      normalizedData.Start_Date,
      normalizedData.Exhibit_ID,
      normalizedData.Supervisor_ID,
      normalizedData.Status,
      normalizedData.End_Date,
      employeeId
    ],
    (err, result) => {
      if (err) {
        console.error("Update error:", err);
        return handleDBError(res, err);
      }
      if (result.affectedRows > 0) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          message: 'Employee updated successfully',
          updatedEmployee: normalizedData 
        }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Employee not found' }));
      }
    }
  );
};

//Exhibit Section
const fetchExhibits = (res) => {
  connection.query('SELECT * FROM Exhibit WHERE is_deleted = 0', (error, results) => {
    if (error) return handleDBError(res, error);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(results));
  });
};
const addExhibit = (exhibitData, res) => {
  const { name, location, hours, type, is_closed, closure_reason, closure_start, closure_end, image_link } = exhibitData;

  connection.query(
    `INSERT INTO Exhibit (Name, Location, Hours, Type, is_closed, closure_reason, closure_start, closure_end, Image_Link) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, location, hours, type, is_closed || 0, closure_reason || null, closure_start || null, closure_end || null, image_link || null],
    (err) => {
      if (err) return handleDBError(res, err);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Exhibit added successfully' }));
    }
  );
};
const updateExhibit = (exhibitId, exhibitData, res) => {
  const { name, location, hours, type, is_closed, closure_reason, closure_start, closure_end, image_link } = exhibitData;

  connection.query(
    `UPDATE Exhibit 
     SET Name = ?, Location = ?, Hours = ?, Type = ?, is_closed = ?, closure_reason = ?, closure_start = ?, closure_end = ?, Image_Link = ? 
     WHERE ID = ?`,
    [name, location, hours, type, is_closed || 0, closure_reason || null, closure_start || null, closure_end || null, image_link || null, exhibitId],
    (err, result) => {
      if (err) return handleDBError(res, err);

      if (result.affectedRows > 0) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Exhibit updated successfully' }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Exhibit not found' }));
      }
    }
  );
};
const removeExhibit = (exhibitId, res) => {
  connection.query('DELETE FROM Exhibit WHERE ID = ?', [exhibitId], (err, result) => {
    if (err) return handleDBError(res, err);

    if (result.affectedRows > 0) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Exhibit removed successfully' }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Exhibit not found' }));
    }
  });
};

//Cage Section
const fetchCages = async (res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const [results] = await conn.query('SELECT * FROM Cage WHERE is_deleted = 0');
    
    const cages = results.map(cage => ({
      id: cage.ID,
      size: cage.Size,
      type: cage.Type,
      inUse: cage.inUse,
      exhibitID: cage.Exhibit_ID,
    }));

    return cages;
  } catch (error) {
    throw error;
  } finally {
    if (conn) conn.release();
  }
};

const addCage = (cageData, res) => {
  const { size, type, inUse, exhibitID } = cageData;

    connection.query(
      `INSERT INTO Cage (Size, Type, inUse, Exhibit_ID) 
      VALUES (?, ?, ?, ?)`,
      [ size, type, inUse ? 1: 0, exhibitID ],
      (err) => {
        if (err) return handleDBError(res, err);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Cage added successfully.' }));
      }
    );
};
const removeCage = (cageId, res) => {
  connection.query('UPDATE Cage SET is_deleted = 1 WHERE ID = ?',
    [cageId],
    (err, result) => {
      if (err) return handleDBError(res, err);
      if (result.affectedRows > 0) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Cage removed successfully (soft-deleted).' }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Cage not found' }));
      }
    }
  );
};
const updateCage = (cageId, cageData, res) => {
  const normalizedData = {
    Size: cageData.size,
    Type: cageData.type,
    inUse: cageData.inUse,
    Exhibit_ID: cageData.exhibitID,
  };

  connection.query(
    `UPDATE Cage 
     SET Size = ?, Type = ?, inUse = ?, Exhibit_ID = ?
     WHERE ID = ?`,
    [
      normalizedData.Size,
      normalizedData.Type,
      normalizedData.inUse,
      normalizedData.Exhibit_ID,
      cageId
    ],
    (err, result) => {
      if (err) {
        console.error("Update error:", err);
        return handleDBError(res, err);
      }
      if (result.affectedRows > 0) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          message: 'Cage updated successfully',
          updatedCage: normalizedData 
        }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Cage not found' }));
      }
    }
  );
};


const checkEmailExists = (email, callback) => {
  connection.query('SELECT * FROM Employee WHERE email = ? AND is_deleted = 0', [email], (err, employeeResults) => {
    if (err) return callback(err);

    if (employeeResults.length > 0) {
      return callback(null, true);
    } else {
      connection.query('SELECT * FROM Customer WHERE email = ? AND is_deleted = 0', [email], (err, customerResults) => {
        if (err) return callback(err);

        if (customerResults.length > 0) {
          return callback(null, true);
        } else {
          connection.query('SELECT * FROM Passwords WHERE email = ? AND is_deleted = 0', [email], (err, passwordResults) => {
            if (err) return callback(err);
            callback(null, passwordResults.length > 0);
          });
        }
      });
    }
  });
};
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

const fetchAnimalsByExhibitID = (exhibitId, res) => {
  const query = `
    SELECT 
      Animal.ID AS Animal_ID,
      Animal.Name, 
      Animal.Species, 
      Animal.Cage_ID, 
      Cage.Location, 
      Cage.Type, 
      FeedingSchedule.Feeding_Time
    FROM 
      Animal
    JOIN 
      Cage ON Animal.Cage_ID = Cage.ID
    LEFT JOIN 
      FeedingSchedule ON FeedingSchedule.Animal_ID = Animal.ID
    WHERE 
      Animal.Exhibit_ID = ?
      AND Animal.is_deleted = 0
      AND Cage.is_deleted = 0
      AND FeedingSchedule.is_deleted = 0;
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

// Fetch all animals from the database
const fetchAnimals = (res) => {
  connection.query('SELECT * FROM AnimalShowcase', (error, results) => {
    if (error) return handleDBError(res, error);
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


// Get Animal Health Reports for Employee Dash
const fetchHealthReports = (animalId, startDate, endDate, res) => {
  const query = `
    SELECT 
      Report_ID,
      Employee_ID,
      Diagnosis,
      Treatment,
      Report_Date
    FROM 
      AnimalHealthReport
    WHERE 
      Animal_ID = ?
      AND Report_Date BETWEEN ? AND ?
    ORDER BY 
      Report_Date;
  `;
  connection.query(query, [animalId, startDate, endDate], (error, results) => {
    if (error) return handleDBError(res, error);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(results));
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
  connection.query('SELECT * FROM Employee WHERE Email = ? AND is_deleted = 0', [email], (err, employeeResults) => {
    if (err) return callback(err);

    if (employeeResults.length > 0) {
      const employee = employeeResults[0];
      connection.query('SELECT role FROM Employee WHERE Email = ? AND is_deleted = 0', [email], (err, roleResults) => {
        if (err) return callback(err);

        if (roleResults.length > 0) {
          const role = roleResults[0].role;
          connection.query('SELECT password FROM Passwords WHERE email = ? AND is_deleted = 0', [email], (err, passwordResults) => {
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
      connection.query('SELECT * FROM Customer WHERE email = ? AND is_deleted = 0', [email], (err, customerResults) => {
        if (err) return callback(err);

        if (customerResults.length > 0) {
          connection.query('SELECT password FROM Passwords WHERE email = ? AND is_deleted = 0', [email], (err, passwordResults) => {
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
    connection.query('SELECT ID, First_name, Last_name, phone, email, DateOfBirth FROM Customer WHERE email = ? AND is_deleted = 0', [user.email], (err, results) => {
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
    connection.query('SELECT ID, First_Name, Last_Name, phone, email FROM Employee WHERE email = ? AND is_deleted = 0', [user.email], (err, results) => {
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
module.exports = async (req, res) => {
  setCORSHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  try {
    // Route handling
    if (req.method === 'GET') {
      // GET routes
      if (req.url === '/cages') {
        const cages = await fetchCages();
        res.status(200).json(cages);
      }
      else if (req.url === '/employees') {
        const employees = await fetchEmployees();
        res.status(200).json(employees);
      }
      else if (req.url === '/exhibits') {
        const exhibits = await fetchExhibits();
        res.status(200).json(exhibits);
      }
      // Add other GET routes...
    }
    else if (req.method === 'POST') {
      const body = await parseBody(req);
      
      // POST routes
      if (req.url === '/add-cage') {
        await addCage(body);
        res.status(201).json({ message: 'Cage added successfully' });
      }
      else if (req.url === '/add-employee') {
        await addEmployee(body);
        res.status(201).json({ message: 'Employee added successfully' });
      }
      // Add other POST routes...
    }
    else if (req.method === 'PUT') {
      const body = await parseBody(req);
      const url = new URL(req.url, `http://${req.headers.host}`);
      const id = url.searchParams.get('id');

      if (!id) {
        res.status(400).json({ message: 'ID is required' });
        return;
      }

      if (req.url.startsWith('/update-cage')) {
        await updateCage(id, body);
        res.status(200).json({ message: 'Cage updated successfully' });
      }
      else if (req.url.startsWith('/update-employee')) {
        await updateEmployee(id, body);
        res.status(200).json({ message: 'Employee updated successfully' });
      }
      // Add other PUT routes...
    }
    else if (req.method === 'DELETE') {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const id = url.searchParams.get('id');

      if (!id) {
        res.status(400).json({ message: 'ID is required' });
        return;
      }

      if (req.url.startsWith('/remove-cage')) {
        await removeCage(id);
        res.status(200).json({ message: 'Cage removed successfully' });
      }
      else if (req.url.startsWith('/remove-employee')) {
        await removeEmployee(id);
        res.status(200).json({ message: 'Employee removed successfully' });
      }
      // Add other DELETE routes...
    }
    else {
      res.status(404).json({ message: 'Route not found' });
    }
  } catch (error) {
    console.error('Server error:', error);
    handleDBError(res, error);
  }
};