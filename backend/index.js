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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

// Function to handle database errors
const handleDBError = (res, error) => {
  console.error('Error executing query:', error);
  res.writeHead(500, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Error processing the request' }));
};


//Employee Section
const fetchEmployees = (res) => {
  connection.query('SELECT * FROM Employee WHERE is_deleted = 0', (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return handleDBError(res, error);
    }

    // map database fields
    const employees = results.map(employee => ({
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

    try {
      const responseData = JSON.stringify(employees);
      console.log('Fetched employees:', responseData);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(responseData);
    } catch (jsonError) {
      console.error('Error serializing JSON:', jsonError);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error: Unable to process response.');
    }
  });
};
const addEmployee = (employeeData, res) => {
  const { firstName, lastName, birthDate, email, phone, department, role, startDate, exhibitID, status, supervisorID, endDate, is_deleted } = employeeData;

  // check if the email already exists
  checkEmailExists(email, (err, exists) => {
    if (err) return handleDBError(res, err);
    if (exists) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'Email already exists' }));
    }

    // insert the employee into the Employee table
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
  connection.query('UPDATE Employee SET is_deleted = 1 WHERE ID = ?',
    [employeeId],
    (err, result) => {
      if (err) return handleDBError(res, err);
      if (result.affectedRows > 0) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Employee removed successfully (soft-deleted)' }));
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
    if (error) {
      console.error('Database error:', error);
      return handleDBError(res, error);
    }

    // map database fields
    const exhibits = results.map(exhibit => ({
      id: exhibit.ID,
      name: exhibit.Name,
      location: exhibit.Location,
      description: exhibit.Description,
      hours: exhibit.Hours,
      type: exhibit.Type,
      isClosed: exhibit.is_closed,
      closureReason: exhibit.closure_reason,
      closureStart: exhibit.closure_start ? new Date(exhibit.closure_start).toISOString().split('T')[0] : null,
      closureEnd: exhibit.closure_end ? new Date(exhibit.closure_end).toISOString().split('T')[0] : null,
      imageLink: exhibit.Image_Link,
    }));

    try {
      const responseData = JSON.stringify(exhibits);
      console.log('Fetched exhibits:', responseData);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(responseData);
    } catch (jsonError) {
      console.error('Error serializing JSON:', jsonError);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error: Unable to process response.');
    }
  });
};
const addExhibit = (exhibitData, res) => {
  const { name, location, description, hours, type, is_closed, closure_reason, closure_start, closure_end, image_link } = exhibitData;
  
  connection.query(
    `INSERT INTO Exhibit (Name, Location, Description, Hours, Type, is_closed, closure_reason, closure_start, closure_end, Image_Link) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, location, description, hours, type, is_closed || 0, closure_reason || null, closure_start || null, closure_end || null, image_link],
    (err) => {
      if (err) return handleDBError(res, err);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Exhibit added successfully.' }));
    }
  );
};
const updateExhibit = (exhibitId, exhibitData, res) => {
  
  const normalizedData = {
    Name: exhibitData.name,
    Location: exhibitData.location,
    Description: exhibitData.description,
    Hours: exhibitData.hours,
    Type: exhibitData.type,
    is_closed: exhibitData.isClosed,
    closure_reason: exhibitData.closureReason || null,
    closure_start: exhibitData.closureStart || null,
    closure_end: exhibitData.closureEnd || null,
    Image_Link: exhibitData.imageLink,
  };

  connection.query(
    `UPDATE Exhibit SET 
      Name = ?, 
      Location = ?, 
      Description = ?,
      Hours = ?, 
      Type = ?, 
      is_closed = ?, 
      closure_reason = ?, 
      closure_start = ?, 
      closure_end = ?, 
      Image_Link = ?
    WHERE ID = ?`,
    [
      normalizedData.Name, 
      normalizedData.Location, 
      normalizedData.Description, 
      normalizedData.Hours, 
      normalizedData.Type, 
      normalizedData.is_closed, 
      normalizedData.closure_reason,
      normalizedData.closure_start,
      normalizedData.closure_end,
      normalizedData.Image_Link,
      exhibitId
    ],
    (err, result) => {
      if (err) {
        console.error("Update error:", err);
        return handleDBError(res, err);
      }
      if (result.affectedRows > 0) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Exhibit updated successfully', updatedExhibit: normalizedData }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Exhibit not found' }));
      }
    }
  );
};

const removeExhibit = (exhibitId, res) => {
  connection.query(
    'UPDATE Exhibit SET is_deleted = 1 WHERE ID = ?',
    [exhibitId],
    (err, result) => {
      if (err) return handleDBError(res, err);
      if (result.affectedRows > 0) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Exhibit removed successfully (soft-deleted).' }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Exhibit not found' }));
      }
    }
  );
};


//Cage Section
const fetchCages = (res) => {
  connection.query('SELECT * FROM Cage WHERE is_deleted = 0', (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return handleDBError(res, error);
    }
    const cages = results.map(cage => ({
      id: cage.ID,
      size: cage.Size,
      type: cage.Type,
      inUse: cage.inUse,
      exhibitID: cage.Exhibit_ID,
    }));
    try {
      const responseData = JSON.stringify(cages);
      console.log('Fetched cages:', responseData);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(responseData);
    } catch (jsonError) {
      console.error('Error serializing JSON:', jsonError);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error: Unable to process response.');
    }
  });
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
  // Parse the ID as an integer
  const id = parseInt(cageId);

  // Validate the ID
  if (isNaN(id) || id <= 0) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'Invalid cage ID format' }));
  }

  // First check if the cage exists and isn't already deleted
  connection.query(
    'SELECT * FROM Cage WHERE ID = ? AND is_deleted = 0',
    [id],
    (err, results) => {
      if (err) return handleDBError(res, err);

      if (results.length === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Cage not found or already deleted' }));
      }

      // If cage exists, proceed with the soft delete
      connection.query(
        'UPDATE Cage SET is_deleted = 1 WHERE ID = ?',
        [id],
        (updateErr, updateResult) => {
          if (updateErr) return handleDBError(res, updateErr);

          if (updateResult.affectedRows > 0) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              message: 'Cage removed successfully',
              success: true,
              id: id
            }));
          } else {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Failed to remove cage' }));
          }
        }
      );
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

      // Insert into Ticket table with the new Exhibit_ID column
      const insertTicketQuery = 'INSERT INTO Ticket (Customer_ID, Ticket_Type, Price, Purchase_Date, Receipt_ID, Exhibit_ID) VALUES (?, ?, ?, ?, ?, ?)';
      
      connection.query(insertTicketQuery, [customerId, ticketData.ticketType, ticketData.price, purchaseDate, receiptId, ticketData.exhibitId], (err) => {
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
      t.ID AS Ticket_ID,
      t.Ticket_Type,
      t.Price,
      t.Purchase_Date,
      t.Receipt_ID,
      r.Total_Amount,
      e.Name AS Exhibit_Name
    FROM Ticket t
    JOIN Receipt r ON t.Receipt_ID = r.ID
    JOIN Customer c ON t.Customer_ID = c.ID
    LEFT JOIN Exhibit e ON t.Exhibit_ID = e.ID  -- Join with Exhibit to get exhibit details
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
      Exhibit.Location,  -- Updated to fetch Location from Exhibit
      Cage.Type, 
      FeedingSchedule.Feeding_Time
    FROM 
      Animal
    JOIN 
      Exhibit ON Animal.Exhibit_ID = Exhibit.ID  -- Join with Exhibit table to get Location
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
      AnimalHealthReport.Report_ID,
      AnimalHealthReport.Employee_ID,
      AnimalHealthReport.Diagnosis,
      AnimalHealthReport.Treatment,
      AnimalHealthReport.Height,
      AnimalHealthReport.Weight,
      AnimalHealthReport.Report_Date,
      Animal.Height AS OriginalHeight,
      Animal.Weight AS OriginalWeight
    FROM 
      AnimalHealthReport
    JOIN 
      Animal ON AnimalHealthReport.Animal_ID = Animal.ID
    WHERE 
      AnimalHealthReport.Animal_ID = ?
      AND AnimalHealthReport.Report_Date BETWEEN ? AND ?
    ORDER BY 
      AnimalHealthReport.Report_Date;
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

  checkEmailExists(email, (err, exists) => {
    if (err) return handleDBError(res, err);
    if (exists) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'Email already exists' }));
    }

    // First get the highest Member_ID
    connection.query(
      'SELECT MAX(Member_ID) as maxMemberId FROM Customer',
      (err, result) => {
        if (err) return handleDBError(res, err);

        const nextMemberId = (result[0].maxMemberId || 1000) + 1;

        // Insert into Customer table with the new Member_ID
        connection.query(
          'INSERT INTO Customer (First_name, Last_name, email, phone, DateOfBirth, Member_ID) VALUES (?, ?, ?, ?, ?, ?)',
          [firstName, lastName, email, phone, dateOfBirth, nextMemberId],
          (err, result) => {
            if (err) return handleDBError(res, err);

            // Insert the password into the Passwords table
            connection.query(
              'INSERT INTO Passwords (email, password) VALUES (?, ?)',
              [email, password],
              (err) => {
                if (err) return handleDBError(res, err);

                // Insert into Membership table
                connection.query(
                  'INSERT INTO Membership (Member_ID, ID, Start_Date, Exp_Date, Member_Type) VALUES (?, ?, CURDATE(), NULL, "basic")',
                  [nextMemberId, result.insertId],
                  (err) => {
                    if (err) return handleDBError(res, err);

                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Signup successful' }));
                  }
                );
              }
            );
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

//Membership Section
const fetchMembershipDetails = (userId, res) => {
  const query = `
      SELECT 
          m.Member_Type as memberType,
          m.Exp_Date as expiryDate,
          DATEDIFF(m.Exp_Date, CURDATE()) as daysUntilExpiry
      FROM Membership m
      WHERE m.ID = ?
  `;

  connection.query(query, [userId], (err, results) => {
      if (err) return handleDBError(res, err);

      if (!results.length) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Membership not found' }));
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
          memberType: results[0].memberType,
          expiryDate: results[0].expiryDate,
          daysUntilExpiry: results[0].daysUntilExpiry || null
      }));
  });
};
const upgradeMembership = (userId, membershipData, res) => {
  const { membershipTier, durationType } = membershipData;

  connection.query(
      'CALL upgrade_membership(?, ?, ?)',
      [userId, membershipTier, durationType],
      (err) => {
          if (err) {
              console.error('Error upgrading membership:', err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: 'Failed to upgrade membership' }));
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Membership upgraded successfully' }));
      }
  );
};

// Function to fetch profile data based on user type
const fetchProfileData = (user, res) => {
  if (user.type.toLowerCase() === 'customer') {
    connection.query(
      'SELECT ID, First_name AS First_Name, Last_name AS Last_Name, phone, email, DateOfBirth FROM Customer WHERE email = ? AND is_deleted = 0', 
      [user.email], 
      (err, results) => {
        if (err) return handleDBError(res, err);
        if (results.length > 0) {
          // Standardize field names to match the frontend expectations
          const standardizedProfile = {
            ID: results[0].ID,
            First_Name: results[0].First_Name,
            Last_Name: results[0].Last_Name,
            email: results[0].email,
            phone: results[0].phone,
            DateOfBirth: results[0].DateOfBirth
          };
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ profile: standardizedProfile }));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Profile not found' }));
        }
      }
    );
  } else if (user.type.toLowerCase() === 'employee') {
    connection.query(
      'SELECT ID, First_Name, Last_Name, phone, email, Birth_Date AS DateOfBirth FROM Employee WHERE email = ? AND is_deleted = 0', 
      [user.email], 
      (err, results) => {
        if (err) return handleDBError(res, err);
        if (results.length > 0) {
          // Standardize field names to match the frontend expectations
          const standardizedProfile = {
            ID: results[0].ID,
            First_Name: results[0].First_Name,
            Last_Name: results[0].Last_Name,
            email: results[0].email,
            phone: results[0].phone,
            DateOfBirth: results[0].DateOfBirth
          };
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ profile: standardizedProfile }));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Profile not found' }));
        }
      }
    );
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
  } 

  else if (req.method === 'POST' && req.url === '/signup') {
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
  }

  else if (req.method === 'GET' && req.url.startsWith('/profile')) {
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
  }
  else if (req.method === 'GET' && req.url === '/tickets'){
    const ticketTypes = [
      { type: 'Child', price: 10, description: 'Ages 3-12' },
      { type: 'Adult', price: 20, description: 'Ages 13-64' },
      { type: 'Senior', price: 15, description: 'Ages 65+' }
    ];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(ticketTypes));
  }
  else if(req.method === 'POST' && req.url === '/tickets'){
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
  }
  else if (req.method === 'GET' && req.url === '/animals'){
    fetchAnimals(res);
  }
  else if (req.method === 'GET' && req.url === '/events'){
    fetchEvents(res);
  }

  else if (req.method === 'GET' && req.url.startsWith('/purchased-tickets')){
    const url = new URL(req.url, `http://${req.headers.host}`);
    const email = url.searchParams.get('email');
  
    if (email) {
    fetchPurchasedTickets(email, res);
    }
    else {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Email is required' }));
    }
  }

  else if(req.method === 'GET' && req.url.startsWith('/employee-id')) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const email = url.searchParams.get('email');

    const query = 'SELECT ID FROM Employee WHERE Email = ?';
    connection.query(query, [email], (err, result) => {
        if (err) {
            console.error("Error fetching employee ID:", err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Database query error' }));
            return;
        }
        if (result.length > 0) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ employeeId: result[0].ID }));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Employee not found' }));
        }
    });
  }

  else if (req.method === 'POST' && req.url === '/add-report') {
    let body = '';

    // Collect incoming data
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
  
    // Once all data is received
    req.on('end', () => {
      try {
        // Parse the JSON body
        const { animalId, employeeId, diagnosis, treatment, height, weight, reportDate } = JSON.parse(body);
  
        if (!height || !weight) {
          return res.writeHead(400, { 'Content-Type': 'application/json' }).end(JSON.stringify({ message: "Height and weight are required." }));
        }
  
        const insertReportQuery = `
          INSERT INTO AnimalHealthReport (Animal_ID, Employee_ID, Diagnosis, Treatment, Height, Weight, Report_Date)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
  
        connection.query(
          insertReportQuery,
          [animalId, employeeId, diagnosis, treatment, height, weight, reportDate],
          (err) => {
            if (err) {
              console.error("Failed to add health report:", err);
              return res.writeHead(500, { 'Content-Type': 'application/json' }).end(JSON.stringify({ message: "Failed to add health report." }));
            }
            res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ message: "Health report added successfully." }));
          }
        );
      } catch (err) {
        console.error("Error parsing JSON body:", err);
        res.writeHead(400, { 'Content-Type': 'application/json' }).end(JSON.stringify({ message: "Invalid JSON data." }));
      }
    });
  }

  else if(req.method === 'GET' && req.url.startsWith('/employee-animals')){
    const url = new URL(req.url, `http://${req.headers.host}`);
    const email = url.searchParams.get('email');
    if (email) {
      fetchExhibitIDByEmail(email, res);
    } else {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Email is required' }));
    }
  }

  else if(req.method === 'GET' && req.url.startsWith('/health-reports')){
    const url = new URL(req.url, `http://${req.headers.host}`);
    const animalId = url.searchParams.get('animalId');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');  
    if (animalId && startDate && endDate) {
      fetchHealthReports(animalId, startDate, endDate, res);
    } 
    else {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'animalId, startDate, and endDate are required' }));
    }
  }

  //Employee Section
  else if(req.method === 'GET' && req.url === '/employees'){
    fetchEmployees(res);
  }

  else if(req.method === 'POST' && req.url === '/add-employee'){
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        console.log
        const employeeData = JSON.parse(body);
        addEmployee(employeeData, res);
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid JSON' }));
      }
    });
  }

  else if (req.method === 'PUT' && req.url.startsWith('/update-employee')) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const employeeId = url.searchParams.get('id');
    if (employeeId) {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        const updateData = JSON.parse(body);
        updateEmployee(employeeId, updateData, res); // Calls the updateEmployee function
      });
    }
  }

  else if(req.method === 'DELETE' && req.url.startsWith('/remove-employee')){
    const url = new URL(req.url, `http://${req.headers.host}`);
    const employeeId = url.searchParams.get('id');
    if (employeeId) {
      removeEmployee(employeeId, res);
    }
  }


  //Exhibit Section
  else if (req.method === 'GET' && req.url === '/exhibits'){
    fetchExhibits(res);
  }

  else if(req.method === 'POST' && req.url === '/add-exhibit'){
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const exhibitData = JSON.parse(body);
        addExhibit(exhibitData, res);
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid JSON' }));
      }
    });
  }

  else if (req.method === 'DELETE' && req.url.startsWith('/remove-exhibit')){
    const url = new URL(req.url, `http://${req.headers.host}`);
    const exhibitId = url.searchParams.get('id');
    console.log(exhibitId);
    if (exhibitId) {
      removeExhibit(exhibitId, res);
    }
    else {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Exhibit ID is required' }));
    }
  }

  else if (req.method === 'PUT' && req.url.startsWith('/update-exhibit')) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const exhibitId = url.searchParams.get('id');
    
    if (exhibitId) {
      let body = '';
      req.on('data', (chunk) => {
          body += chunk.toString();
      });
      req.on('end', () => {
      const updateData = JSON.parse(body);
      updateExhibit(exhibitId, updateData, res); // Calls the updateExhibits function
      });
    } 
    else {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Exhibit ID is required' }));
    }
  }


  //Cage Section
  else if (req.method === 'GET' && req.url === '/cages') {
    fetchCages(res);
  }
  else if (req.method === 'POST' && req.url === '/add-cage') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const cageData = JSON.parse(body);
        addCage(cageData, res);
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid JSON' }));
      }
    });
  }

  else if (req.method === 'DELETE' && req.url.startsWith('/remove-cage')) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const cageId = url.searchParams.get('id');

    if (cageId) {
      removeCage(cageId, res);
    } else {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Cage ID is required' }));
    }
  }

  else if (req.method === 'PUT' && req.url.startsWith('/update-cage')) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const cageId = url.searchParams.get('id');
    
    if (cageId) {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const updateData = JSON.parse(body);
            updateCage(cageId, updateData, res); // Calls the updateCages function
        });
    } else {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Cage ID is required' }));
    }
  }

  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Route not found' }));
  }
}).listen(5000, () => {
  console.log('Server is listening on port 5000');
});