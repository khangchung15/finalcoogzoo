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

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    const queries = [
      // Drop triggers individually
      `DROP TRIGGER IF EXISTS after_event_insert`,
      `DROP TRIGGER IF EXISTS after_exhibit_insert`,
      
      // Create EventNotifications table
      `CREATE TABLE IF NOT EXISTS EventNotifications (
        notification_id INT PRIMARY KEY AUTO_INCREMENT,
        event_id INT,
        customer_id INT,
        message TEXT,
        notification_sent BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES Event(Event_ID),
        FOREIGN KEY (customer_id) REFERENCES Customer(ID)
      )`,

      // Create ExhibitNotifications table
      `CREATE TABLE IF NOT EXISTS ExhibitNotifications (
        notification_id INT PRIMARY KEY AUTO_INCREMENT,
        exhibit_id INT,
        message VARCHAR(255),
        notification_sent BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (exhibit_id) REFERENCES Exhibit(ID)
      )`,

      // Create event trigger with plain text
      `CREATE TRIGGER after_event_insert
      AFTER INSERT ON Event
      FOR EACH ROW
      BEGIN
        INSERT INTO EventNotifications (event_id, customer_id, message, notification_sent)
        SELECT 
          NEW.Event_ID,
          Customer.ID,
          CONCAT(
            'Dear ', Customer.First_name, ',\n\n',
            'New Event at CoogZoo!\n\n',
            'Event: ', NEW.Name, '\n',
            'Date: ', DATE_FORMAT(NEW.Date, '%W, %M %D, %Y'), '\n',
            'Time: ', TIME_FORMAT(NEW.StartTime, '%h:%i %p'), ' - ', TIME_FORMAT(NEW.EndTime, '%h:%i %p'), '\n',
            'Location: ', NEW.Location, '\n',
            CASE 
              WHEN NEW.Description IS NOT NULL 
              THEN CONCAT('\nDetails:\n', NEW.Description)
              ELSE ''
            END,
            '\n\nWe look forward to seeing you there!\n\n',
            'Best regards,\n',
            'The CoogZoo Team'
          ),
          FALSE
        FROM Customer;
      END`,

      // Create exhibit trigger with plain text
      `CREATE TRIGGER after_exhibit_insert
      AFTER INSERT ON Exhibit
      FOR EACH ROW
      BEGIN
        INSERT INTO ExhibitNotifications (exhibit_id, message, notification_sent)
        VALUES (
          NEW.ID,
          CONCAT(
            'New Exhibit Alert!\n\n',
            'Name: ', NEW.Name, '\n',
            'Location: ', NEW.Location,
            CASE 
              WHEN NEW.Hours IS NOT NULL 
              THEN CONCAT('\nHours: ', NEW.Hours)
              ELSE ''
            END,
            CASE 
              WHEN NEW.Description IS NOT NULL 
              THEN CONCAT('\n\nDescription:\n', NEW.Description)
              ELSE ''
            END,
            '\n\nCome visit us to explore this exciting new addition!'
          ),
          FALSE
        );
      END`
    ];

    // Execute queries sequentially
    const executeQueries = async (index) => {
      if (index >= queries.length) {
        console.log('Database initialization completed successfully');
        return resolve();
      }

      try {
        await connection.promise().query(queries[index]);
        console.log(`Successfully executed query ${index + 1}`);
        await executeQueries(index + 1);
      } catch (error) {
        console.error(`Error executing query ${index + 1}:`, error);
        reject(error);
      }
    };

    executeQueries(0);
  });
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
  const { firstName, lastName, birthDate, email, password, phone, department, role, startDate, exhibitID, status, supervisorID, endDate, is_deleted } = employeeData;
  
  // validate employee data
  const validationError = validateEmployeeData(employeeData);
  if (validationError) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: validationError }));
  }

  checkEmailExists(email, (err, exists) => {
    if (err) return handleDBError(res, err);
    if (exists) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'Email already exists' }));
    }

    // Begin transaction
    connection.beginTransaction(async (err) => {
      if (err) return handleDBError(res, err);

      try {
        // First insert the employee
        const [employeeResult] = await connection.promise().query(
          `INSERT INTO Employee (First_Name, Last_Name, Birth_Date, Email, Phone, Department, Role, Start_Date, Exhibit_ID, Supervisor_ID, Status, End_Date) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [firstName, lastName, birthDate, email, phone, department, role, startDate, exhibitID || null, supervisorID || null, status, endDate || null]
        );

        // Then insert the password
        await connection.promise().query(
          'INSERT INTO Passwords (email, password) VALUES (?, ?)',
          [email, password]
        );

        // If both queries succeed, commit the transaction
        await connection.promise().commit();
        
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          message: 'Employee added successfully',
          loginCredentials: {
            email: email,
            password: password
          } 
        }));

      } catch (error) {
        // If any error occurs, rollback the transaction
        await connection.promise().rollback();
        handleDBError(res, error);
      }
    });
  });
};
const removeEmployee = (employeeId, res) => {
  connection.beginTransaction(async (err) => {
    if (err) return handleDBError(res, err);

    try {
      // First get the employee's email
      const [employee] = await connection.promise().query(
        'SELECT Email FROM Employee WHERE ID = ?',
        [employeeId]
      );

      if (employee.length === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Employee not found' }));
      }

      const email = employee[0].Email;

      // Soft delete the employee
      await connection.promise().query(
        'UPDATE Employee SET is_deleted = 1 WHERE ID = ?',
        [employeeId]
      );

      // Soft delete the password
      await connection.promise().query(
        'UPDATE Passwords SET is_deleted = 1 WHERE email = ?',
        [email]
      );

      // If both queries succeed, commit the transaction
      await connection.promise().commit();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Employee removed successfully (soft-deleted)' }));

    } catch (error) {
      // If any error occurs, rollback the transaction
      await connection.promise().rollback();
      handleDBError(res, error);
    }
  });
};
const updateEmployee = (employeeId, employeeData, res) => {
  // Validate employee data
  const validationError = validateEmployeeData(employeeData);
  if (validationError) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: validationError }));
  }
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

  connection.beginTransaction(async (err) => {
    if (err) return handleDBError(res, err);

    try {
      // First update the employee
      const [result] = await connection.promise().query(
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
        ]
      );

      // If password is provided, update it
      if (employeeData.password) {
        await connection.promise().query(
          'UPDATE Passwords SET password = ? WHERE email = ?',
          [employeeData.password, normalizedData.Email]
        );
      }

      // If both queries succeed, commit the transaction
      await connection.promise().commit();

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

    } catch (error) {
      // If any error occurs, rollback the transaction
      await connection.promise().rollback();
      handleDBError(res, error);
    }
  });
};
const validateEmployeeData = (employeeData) => {
  const namePattern = /^[A-Za-z-]+$/;
  
  // Validate first name
  if (!employeeData.firstName || !namePattern.test(employeeData.firstName)) {
    return "First name can only contain letters and hyphens";
  }

  // Validate last name
  if (!employeeData.lastName || !namePattern.test(employeeData.lastName)) {
    return "Last name can only contain letters and hyphens";
  }

  // Validate age
  if (!employeeData.birthDate) {
    return "Birth date is required";
  }

  const birthDate = new Date(employeeData.birthDate);
  const today = new Date();
  
  // Check if birth date is valid
  if (isNaN(birthDate.getTime())) {
    return "Invalid birth date";
  }

  // Check if birth date is in the future
  if (birthDate > today) {
    return "Birth date cannot be in the future";
  }

  // Calculate age
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 18) {
    return "Employee must be at least 18 years old";
  }

  const deptRolePattern = /^[A-Za-z\s]+$/;
  
  // Validate department
  if (!deptRolePattern.test(employeeData.department)) {
    return "Department can only contain letters and spaces";
  }
  
  // Validate role
  if (!deptRolePattern.test(employeeData.role)) {
    return "Role can only contain letters and spaces";
  }
  
  return null;
};
//Exhibit Section
const updateExhibitNewStatus = (exhibitId, isNew, res) => {
  connection.query(
    'UPDATE Exhibit SET is_new = ? WHERE ID = ?',
    [isNew, exhibitId],
    (err) => {
      if (err) return handleDBError(res, err);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Exhibit status updated successfully' }));
    }
  );
};
const fetchLatestNewExhibit = (res) => {
  const query = `
    SELECT 
      *,
      DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as formatted_date
    FROM Exhibit 
    WHERE is_new = TRUE 
    ORDER BY created_at DESC 
    LIMIT 1
  `;

  connection.query(query, (error, results) => {
    if (error) return handleDBError(res, error);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(results[0] || null));
  });
};
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
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(responseData);
    } catch (jsonError) {
      console.error('Error serializing JSON:', jsonError);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error: Unable to process response.');
    }
  });
};

const fetchPublicExhibits = (res) => {
  const query = `
    SELECT 
      ID,
      Name as name,
      Location as location,
      Description as description,
      Hours as hours,
      Type as type,
      is_closed,
      closure_reason,
      closure_start,
      closure_end,
      Image_Link as imageLink,
      is_new,
      created_at,
      DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as formatted_date
    FROM Exhibit 
    WHERE is_deleted = 0
    ORDER BY created_at DESC
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return handleDBError(res, error);
    }

    try {
      const responseData = JSON.stringify(results);
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
  const { name, location, description, hours, type, isClosed, closureReason, closureStart, closureEnd, imageLink } = exhibitData;
  
  // Disable safe mode for update
  connection.query('SET SQL_SAFE_UPDATES = 0', (err) => {
    if (err) return handleDBError(res, err);

    // First, update all existing exhibits to not be new
    connection.query('UPDATE Exhibit SET is_new = FALSE WHERE is_new = TRUE', (err) => {
      if (err) return handleDBError(res, err);

      // Then insert the new exhibit
      connection.query(
        `INSERT INTO Exhibit (
          Name, 
          Location, 
          Description,
          Hours, 
          Type, 
          is_closed, 
          closure_reason, 
          closure_start, 
          closure_end, 
          Image_Link,
          is_new,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, CURRENT_TIMESTAMP)`,
        [
          name, 
          location,
          description, 
          hours, 
          type, 
          isClosed || 0, 
          closureReason || null, 
          closureStart || null, 
          closureEnd || null, 
          imageLink
        ],
        (err) => {
          // Re-enable safe mode
          connection.query('SET SQL_SAFE_UPDATES = 1', () => {
            if (err) return handleDBError(res, err);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Exhibit added successfully.' }));
          });
        }
      );
    });
  });
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
const fetchManageAnimals = (res) => {
  connection.query('SELECT * FROM Animal WHERE is_deleted = 0', (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return handleDBError(res, error);
    }

    const animals = results.map(animal => ({
      id: animal.ID,
      name: animal.Name,
      scientificName: animal.Scientific_Name,
      species: animal.Species,
      birthDate: animal.Date_Of_Birth ? new Date(animal.Date_Of_Birth).toISOString().split('T')[0] : null,
      height: animal.Height,
      weight: animal.Weight,
      status: animal.Status,
      statusReason: animal.Status_Reason,
      cageID: animal.Cage_ID,
      exhibitID: animal.Exhibit_ID,
    }));

    try {
      const responseData = JSON.stringify(animals);
      console.log('Fetched animals:', responseData);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(responseData);
    } catch (jsonError) {
      console.error('Error serializing JSON:', jsonError);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error: Unable to process response.');
    }
  });
};

const addAnimal = (animalData, res) => {
  const { name, scientificName, species, birthDate, height, weight, status, statusReason, cageID, exhibitID } = animalData;

  connection.query(
    `INSERT INTO Animal (Name, Scientific_Name, Species, Date_Of_Birth, Height, Weight, Status, Status_Reason, Cage_ID, Exhibit_ID) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, scientificName, species, birthDate, height, weight, status, statusReason, cageID, exhibitID],
    (err) => {
      if (err) return handleDBError(res, err);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Animal added successfully.' }));
    }
  );
}

// function to remove an animal (soft delete)
const removeAnimal = (animalId, res) => {
  connection.query(
    'UPDATE Animal SET is_deleted = 1 WHERE ID = ?',
    [animalId],
    (err, result) => {
      if (err) return handleDBError(res, err);
      if (result.affectedRows > 0) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Animal removed successfully (soft-deleted).' }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Animal not found' }));
      }
    }
  );
};

// function to update an animal
const updateAnimal = (animalId, animalData, res) => {

  const normalizedData = {
    Name: animalData.name,
    Scientific_Name: animalData.scientificName,
    Species: animalData.species,
    Date_Of_Birth: animalData.birthDate,
    Height: animalData.height,
    Weight: animalData.weight,
    Status: animalData.status,
    Status_Reason: animalData.statusReason,
    Cage_ID: animalData.cageID,
    Exhibit_ID: animalData.exhibitID,
  };

  connection.query(
    `UPDATE Animal SET 
      Name = ?, 
      Scientific_Name = ?, 
      Species = ?,
      Date_Of_Birth = ?, 
      Height = ?, 
      Weight = ?, 
      Status = ?, 
      Status_Reason = ?,
      Cage_ID = ?, 
      Exhibit_ID = ?
    WHERE ID = ?`,
    [
      normalizedData.Name, 
      normalizedData.Scientific_Name, 
      normalizedData.Species, 
      normalizedData.Date_Of_Birth, 
      normalizedData.Height, 
      normalizedData.Weight, 
      normalizedData.Status,
      normalizedData.Status_Reason,
      normalizedData.Cage_ID,
      normalizedData.Exhibit_ID,
      animalId
    ],
    (err, result) => {
      if (err) {
        console.error("Update error:", err);
        return handleDBError(res, err);
      }
      if (result.affectedRows > 0) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Animal updated successfully', updatedAnimal: normalizedData }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Animal not found' }));
      }
    }
  );
};

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
const fetchShowcase = (res) => {
  connection.query('SELECT * FROM AnimalShowcase', (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return handleDBError(res, error);
    }

    // map database fields
    const showcases = results.map(showcase => ({
      id: showcase.ID,
      name: showcase.Name,
      scientificName: showcase.Scientific_Name,
      habitat: showcase.Habitat,
      funFact: showcase.Fun_Fact,
      location: showcase.Location,
      imageLink: showcase.Image_Link,
    }));

    try {
      const responseData = JSON.stringify(showcases);
      console.log('Fetched animals:', responseData);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(responseData);
    } catch (jsonError) {
      console.error('Error serializing JSON:', jsonError);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error: Unable to process response.');
    }
  });
};
// function to add a showcase
const addShowcase = (showcaseData, res) => {
  const { name, scientificName, habitat, funFact, location, imageLink } = showcaseData;

  connection.query(
    `INSERT INTO AnimalShowcase (Name, Scientific_Name, Habitat, Fun_Fact, Location, Image_Link) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, scientificName, habitat, funFact, location, imageLink],
    (err) => {
        if (err) return handleDBError(res, err);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Showcase added successfully' }));
    }
  );
};

// function to remove an exhibit (soft delete)
const removeShowcase = (showcaseId, res) => {
  connection.query(
    'DELETE FROM AnimalShowcase WHERE ID = ?',
    [showcaseId],
    (err, result) => {
      if (err) return handleDBError(res, err);
      if (result.affectedRows > 0) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Showcase removed successfully.' }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Showcase not found' }));
      }
    }
  );
};

// update showcase
const updateShowcase = (showcaseId, showcaseData, res) => {
  
  const normalizedData = {
    Name: showcaseData.name,
    Scientific_Name: showcaseData.scientificName,
    Habitat: showcaseData.habitat,
    Fun_Fact: showcaseData.funFact,
    Location: showcaseData.location,
    Image_Link: showcaseData.imageLink,
  };

  connection.query(
    `UPDATE AnimalShowcase SET 
      Name = ?, 
      Scientific_Name = ?, 
      Habitat = ?,
      Fun_Fact = ?, 
      Location = ?, 
      Image_Link = ?
    WHERE ID = ?`,
    [
      normalizedData.Name, 
      normalizedData.Scientific_Name, 
      normalizedData.Habitat, 
      normalizedData.Fun_Fact, 
      normalizedData.Location, 
      normalizedData.Image_Link,
      showcaseId
    ],
    (err, result) => {
      if (err) {
        console.error("Update error:", err);
        return handleDBError(res, err);
      }
      if (result.affectedRows > 0) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Showcase updated successfully', updatedShowcase: normalizedData }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Showcase not found' }));
      }
    }
  );
};
const fetchAnimals = (res) => {
  connection.query('SELECT * FROM AnimalShowcase', (error, results) => {
    if (error) return handleDBError(res, error);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(results));
  });
};

//Event Section
const fetchEvents = (res) => {
  connection.query('SELECT * FROM Event', (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return handleDBError(res, error);
    }
    try {
      // Map database fields
      const events = results.map(event => ({
        id: event.Event_ID,
        name: event.Name,
        description: event.Description,
        date: event.Date ? new Date(event.Date).toISOString().split('T')[0] : null,
        startTime: event.StartTime,
        endTime: event.EndTime,
        location: event.Location
      }));
      // Single response with data
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(events));
    } catch (jsonError) {
      console.error('Error serializing JSON:', jsonError);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error: Unable to process response.');
      }
    }
  });
};
const addEvent = (eventData, res) => {
  const { name, description, date, startTime, endTime, location } = eventData;
    connection.query(
      `INSERT INTO Event (Name, Description, Date, StartTime, EndTime, Location) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [ name, description, date, startTime, endTime, location ],
      (err) => {
        if (err) return handleDBError(res, err);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Event added successfully.' }));
      }
    );
};
// function to remove an event (soft delete)
const removeEvent = (eventId, res) => {
  connection.query(
    'DELETE FROM Event WHERE Event_ID = ?',
    [eventId],
    (err, result) => {
      if (err) return handleDBError(res, err);
      if (result.affectedRows > 0) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Event removed successfully.' }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Event not found' }));
      }
    }
  );
};
// update event
const updateEvent = (eventId, eventData, res) => {
  
  const normalizedData = {
    Name: eventData.name,
    Description: eventData.description,
    Date: eventData.date,
    StartTime: eventData.startTime,
    EndTime: eventData.endTime,
    Location: eventData.location,
  };
  connection.query(
    `UPDATE Event SET 
      Name = ?, 
      Description = ?, 
      Date = ?,
      StartTime = ?, 
      EndTime = ?, 
      Location = ?
    WHERE Event_ID = ?`,
    [
      normalizedData.Name, 
      normalizedData.Description, 
      normalizedData.Date, 
      normalizedData.StartTime, 
      normalizedData.EndTime, 
      normalizedData.Location,
      eventId
    ],
    (err, result) => {
      if (err) {
        console.error("Update error:", err);
        return handleDBError(res, err);
      }
      if (result.affectedRows > 0) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Event updated successfully', updatedEvent: normalizedData }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Event not found' }));
      }
    }
  );
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
const getMembershipReport = (startDate, endDate, types, res) => {
  const typeFilter = types && types.length > 0 ? 
    `AND m.Member_Type IN (${types.map(type => `'${type}'`).join(',')})` : '';

  const queries = {
    // Basic membership stats
    membershipTypes: `
      SELECT 
        m.Member_Type as type,
        COUNT(*) as count,
        COALESCE(
          SUM(CASE 
            WHEN m.Member_Type = 'vip' THEN 20
            WHEN m.Member_Type = 'premium' THEN 70
            ELSE 0
          END), 0
        ) as revenue,
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Membership)) as percentage
      FROM Membership m
      GROUP BY m.Member_Type
    `,

    // Member activity
    memberActivity: `
      SELECT 
        m.Member_Type as Member_Type,
        COUNT(DISTINCT m.ID) as active_members,
        COUNT(t.ID) as tickets_purchased,
        COALESCE(SUM(t.Price), 0) as ticket_revenue
      FROM Membership m
      LEFT JOIN Customer c ON m.ID = c.ID
      LEFT JOIN Ticket t ON c.ID = t.Customer_ID
        AND t.Purchase_Date BETWEEN ? AND ?
      GROUP BY m.Member_Type
    `,

    // Popular exhibits
    exhibitPopularity: `
      SELECT 
        m.Member_Type as Member_Type,
        COALESCE(e.Name, 'No Exhibit') as exhibit_name,
        COUNT(t.ID) as visit_count
      FROM Membership m
      INNER JOIN Customer c ON m.ID = c.ID
      LEFT JOIN Ticket t ON t.Customer_ID = c.ID 
        AND t.Purchase_Date BETWEEN ? AND ?
      LEFT JOIN Exhibit e ON t.Exhibit_ID = e.ID
      WHERE t.Exhibit_ID IS NOT NULL
      GROUP BY m.Member_Type, e.Name, e.ID
      HAVING visit_count > 0
      ORDER BY m.Member_Type, visit_count DESC
    `,

    // Demographics
    demographics: `
      SELECT 
        m.Member_Type as Member_Type,
        ROUND(AVG(TIMESTAMPDIFF(YEAR, c.DateOfBirth, CURDATE()))) as avg_age,
        COUNT(CASE WHEN TIMESTAMPDIFF(YEAR, c.DateOfBirth, CURDATE()) < 25 THEN 1 END) as under_25,
        COUNT(CASE WHEN TIMESTAMPDIFF(YEAR, c.DateOfBirth, CURDATE()) BETWEEN 25 AND 40 THEN 1 END) as age_25_40,
        COUNT(CASE WHEN TIMESTAMPDIFF(YEAR, c.DateOfBirth, CURDATE()) > 40 THEN 1 END) as over_40
      FROM Membership m
      JOIN Customer c ON m.ID = c.ID
      GROUP BY m.Member_Type
    `,

    // Total stats
    totalStats: `
      SELECT 
        COUNT(DISTINCT m.ID) as totalMembers,
        COUNT(DISTINCT CASE 
          WHEN (m.Exp_Date >= CURDATE() OR m.Exp_Date IS NULL) 
          AND m.Member_Type != 'basic'
          THEN m.ID 
        END) as activeMembers,
        COUNT(DISTINCT CASE 
          WHEN m.Exp_Date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
          THEN m.ID 
        END) as expiringMembers,
        COALESCE(
          SUM(CASE 
            WHEN m.Member_Type = 'vip' THEN 20
            WHEN m.Member_Type = 'premium' THEN 70
            ELSE 0
          END), 0
        ) as totalRevenue
      FROM Membership m
    `
  };

  const reportData = {
    membershipTypes: [],
    memberActivity: [],
    exhibitPopularity: [],
    demographics: [],
    totalRevenue: 0,
    totalMembers: 0,
    activeMembers: 0,
    expiringMembers: 0
  };

  Promise.all([
    // Get membership types distribution
    new Promise((resolve, reject) => {
      connection.query(queries.membershipTypes, [], (error, results) => {
        if (error) {
          reject(error);
        } else {
          reportData.membershipTypes = results;
          resolve();
        }
      });
    }),

    // Get member activity
    new Promise((resolve, reject) => {
      connection.query(queries.memberActivity, [startDate, endDate], (error, results) => {
        if (error) {
          reject(error);
        } else {
          reportData.memberActivity = results;
          resolve();
        }
      });
    }),

    // Get exhibit popularity
    new Promise((resolve, reject) => {
      connection.query(queries.exhibitPopularity, [startDate, endDate], (error, results) => {
        if (error) {
          reject(error);
        } else {
          reportData.exhibitPopularity = results;
          resolve();
        }
      });
    }),

    // Get demographics
    new Promise((resolve, reject) => {
      connection.query(queries.demographics, [], (error, results) => {
        if (error) {
          reject(error);
        } else {
          reportData.demographics = results;
          resolve();
        }
      });
    }),

    // Get total stats
    new Promise((resolve, reject) => {
      connection.query(queries.totalStats, [], (error, results) => {
        if (error) {
          reject(error);
        } else {
          if (results && results[0]) {
            reportData.totalRevenue = results[0].totalRevenue || 0;
            reportData.totalMembers = results[0].totalMembers || 0;
            reportData.activeMembers = results[0].activeMembers || 0;
            reportData.expiringMembers = results[0].expiringMembers || 0;
          }
          resolve();
        }
      });
    })
  ])
  .then(() => {
    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(reportData));
  })
  .catch(error => {
    res.writeHead(500, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ 
      error: 'Failed to generate report',
      details: error.message 
    }));
  });
};
const fetchMembershipDetails = (userId, res) => {
  const query = `
      SELECT 
          m.Member_Type as memberType,
          m.Exp_Date as expiryDate,
          DATEDIFF(m.Exp_Date, CURDATE()) as daysUntilExpiry,
          mn.message as notificationMessage
      FROM Membership m
      LEFT JOIN MembershipNotifications mn ON m.ID = mn.customer_id
          AND mn.notification_type = 'MEMBERSHIP_EXPIRY'
          AND mn.date_created >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      WHERE m.ID = ?
      ORDER BY mn.date_created DESC
      LIMIT 1
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
          daysUntilExpiry: results[0].daysUntilExpiry || null,
          notificationMessage: results[0].notificationMessage
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

const getTicketReport = (startDate, endDate, exhibits, res) => {
  const exhibitFilter = exhibits && exhibits.length > 0 ? 
    `AND t.Exhibit_ID IN (${exhibits})` : '';
  
  const queries = {
    ticketTypes: `
      SELECT 
        t.Ticket_Type as type,
        COUNT(*) as count,
        SUM(t.Price) as revenue
      FROM Ticket t
      WHERE t.Purchase_Date BETWEEN ? AND ?
        ${exhibitFilter}
      GROUP BY t.Ticket_Type
      ORDER BY count DESC
    `,
    
    exhibitPopularity: `
      SELECT 
        e.Name as name,
        COUNT(t.ID) as tickets,
        COALESCE(SUM(t.Price), 0) as revenue
      FROM Exhibit e
      LEFT JOIN Ticket t ON e.ID = t.Exhibit_ID 
        AND t.Purchase_Date BETWEEN ? AND ?
        ${exhibitFilter}
      GROUP BY e.ID, e.Name
      ORDER BY tickets DESC
    `,
    
    totalStats: `
      SELECT 
        COUNT(*) as totalTickets,
        COALESCE(SUM(Price), 0) as totalRevenue
      FROM Ticket t
      WHERE t.Purchase_Date BETWEEN ? AND ?
        ${exhibitFilter}
    `
  };

  const reportData = {
    ticketTypes: [],
    exhibitPopularity: [],
    totalRevenue: 0,
    totalTickets: 0
  };

  Promise.all([
    new Promise((resolve, reject) => {
      connection.query(queries.ticketTypes, [startDate, endDate], (error, results) => {
        if (error) {
          reject(error);
        } else {
          reportData.ticketTypes = results.map(type => ({
            ...type,
            count: type.count || 0,
            revenue: type.revenue || 0
          }));
          resolve();
        }
      });
    }),

    new Promise((resolve, reject) => {
      connection.query(queries.exhibitPopularity, [startDate, endDate], (error, results) => {
        if (error) {
          reject(error);
        } else {
          reportData.exhibitPopularity = results.map(exhibit => ({
            ...exhibit,
            tickets: exhibit.tickets || 0,
            revenue: exhibit.revenue || 0
          }));
          resolve();
        }
      });
    }),

    new Promise((resolve, reject) => {
      connection.query(queries.totalStats, [startDate, endDate], (error, results) => {
        if (error) {
          reject(error);
        } else {
          if (results && results[0]) {
            reportData.totalRevenue = results[0].totalRevenue || 0;
            reportData.totalTickets = results[0].totalTickets || 0;
          }
          resolve();
        }
      });
    })
  ])
  .then(() => {
    if (reportData.totalTickets > 0) {
      reportData.ticketTypes = reportData.ticketTypes.map(type => ({
        ...type,
        percentage: ((type.count / reportData.totalTickets) * 100).toFixed(1)
      }));

      reportData.exhibitPopularity = reportData.exhibitPopularity.map(exhibit => ({
        ...exhibit,
        percentage: ((exhibit.tickets / reportData.totalTickets) * 100).toFixed(1)
      }));
    } else {
      reportData.ticketTypes = reportData.ticketTypes.map(type => ({
        ...type,
        percentage: '0.0'
      }));

      reportData.exhibitPopularity = reportData.exhibitPopularity.map(exhibit => ({
        ...exhibit,
        percentage: '0.0'
      }));
    }

    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(reportData));
  })
  .catch(error => {
    res.writeHead(500, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ 
      error: 'Failed to generate report',
      details: error.message 
    }));
  });
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
const fetchGiftShopItems = (res) => {
  const query = `
    SELECT 
      Item_ID,
      Name,
      Item_Description,
      Category,
      Price,
      Stock_Level,
      Reorder_Level,
      Image_URL,
      Is_Active
    FROM Gift_Shop_Item
    WHERE Is_Active = 1
    ORDER BY Category, Name
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return handleDBError(res, error);
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(results));
  });
};

const fetchAllGiftShopItems = (res) => {
  const query = `
    SELECT 
      Item_ID,
      Name,
      Item_Description,
      Category,
      Price,
      Stock_Level,
      Reorder_Level,
      Image_URL,
      Is_Active
    FROM Gift_Shop_Item
    ORDER BY Category, Name
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return handleDBError(res, error);
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(results));
  });
};
const addGiftShopItem = (res, body) => {
  const item = JSON.parse(body);
  
  const query = `
    INSERT INTO Gift_Shop_Item (
      Name,
      Item_Description,
      Category,
      Price,
      Stock_Level,
      Reorder_Level,
      Image_URL,
      Is_Active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    item.Name,
    item.Item_Description,
    item.Category,
    item.Price,
    item.Stock_Level,
    item.Reorder_Level,
    item.Image_URL,
    item.Is_Active
  ];

  connection.query(query, values, (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return handleDBError(res, error);
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      message: 'Item added successfully',
      itemId: results.insertId 
    }));
  });
};

const updateGiftShopItem = (res, itemId, body) => {
  const item = JSON.parse(body);
  
  const query = `
    UPDATE Gift_Shop_Item
    SET 
      Name = ?,
      Item_Description = ?,
      Category = ?,
      Price = ?,
      Stock_Level = ?,
      Reorder_Level = ?,
      Image_URL = ?,
      Is_Active = ?
    WHERE Item_ID = ?
  `;

  const values = [
    item.Name,
    item.Item_Description,
    item.Category,
    item.Price,
    item.Stock_Level,
    item.Reorder_Level,
    item.Image_URL,
    item.Is_Active,
    itemId
  ];

  connection.query(query, values, (error) => {
    if (error) {
      console.error('Database error:', error);
      return handleDBError(res, error);
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Item updated successfully' }));
  });
};

const purchaseGiftShopItem = (res, body) => {
  const { email, itemId, quantity } = JSON.parse(body);

  // First get customer ID
  connection.query('SELECT ID FROM Customer WHERE email = ?', [email], (err, customerResults) => {
    if (err || customerResults.length === 0) {
      console.error('Customer not found or query error:', err);
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Customer not found' }));
    }

    const customerId = customerResults[0].ID;

    // Check item and stock
    connection.query(
      'SELECT * FROM Gift_Shop_Item WHERE Item_ID = ? AND Is_Active = 1',
      [itemId],
      (err, itemResults) => {
        if (err || itemResults.length === 0) {
          console.error('Item not found or query error:', err);
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Item not found' }));
        }

        const item = itemResults[0];
        
        // Check stock level
        if (item.Stock_Level < quantity) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Insufficient stock' }));
        }

        // Begin transaction
        connection.beginTransaction((err) => {
          if (err) {
            console.error('Transaction error:', err);
            return handleDBError(res, err);
          }

          // 1. Create receipt
          const totalAmount = item.Price * quantity;
          connection.query(
            'INSERT INTO Receipt (Customer_ID, Item_IDs, Total_Amount, Purchase_Date) VALUES (?, ?, ?, CURDATE())',
            [customerId, itemId.toString(), totalAmount],
            (err, receiptResult) => {
              if (err) {
                return connection.rollback(() => handleDBError(res, err));
              }

              const receiptId = receiptResult.insertId;

              // 2. Record in GiftShop table
              connection.query(
                'INSERT INTO GiftShop (Customer_ID, Item_ID, Quantity, Price, Purchase_Date, Receipt_ID) VALUES (?, ?, ?, ?, CURDATE(), ?)',
                [customerId, itemId, quantity, totalAmount, receiptId],
                (err) => {
                  if (err) {
                    return connection.rollback(() => handleDBError(res, err));
                  }

                  // 3. Update stock level
                  connection.query(
                    'UPDATE Gift_Shop_Item SET Stock_Level = Stock_Level - ? WHERE Item_ID = ?',
                    [quantity, itemId],
                    (err) => {
                      if (err) {
                        return connection.rollback(() => handleDBError(res, err));
                      }

                      // Commit transaction
                      connection.commit((err) => {
                        if (err) {
                          return connection.rollback(() => handleDBError(res, err));
                        }

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                          message: 'Purchase successful',
                          receiptId: receiptId
                        }));
                      });
                    }
                  );
                }
              );
            }
          );
        });
      }
    );
  });
};

// Fetch purchase history
const fetchPurchaseHistory = (email, res) => {
  const query = `
    SELECT 
      g.Customer_ID,
      g.Item_ID,
      g.Quantity,
      g.Price,
      g.Purchase_Date,
      g.Receipt_ID,
      i.Name,
      i.Item_Description,
      i.Category,
      i.Image_URL
    FROM GiftShop g
    JOIN Gift_Shop_Item i ON g.Item_ID = i.Item_ID
    JOIN Customer c ON g.Customer_ID = c.ID
    WHERE c.email = ?
    ORDER BY g.Purchase_Date DESC`;

  connection.query(query, [email], (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return handleDBError(res, error);
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(results));
  });
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

  //Event Section
  else if (req.method === 'GET' && req.url === '/events'){
    fetchEvents(res);
  }
  else if (req.method === 'POST' && req.url === '/add-event') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const eventData = JSON.parse(body);
        addEvent(eventData, res);
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid JSON' }));
      }
    });
  }
  else if (req.method === 'DELETE' && req.url.startsWith('/remove-event')) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const eventId = url.searchParams.get('id');
    if (eventId) {
      removeEvent(eventId, res);
    } else {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Event ID is required' }));
    }
  }
  else if (req.method === 'PUT' && req.url.startsWith('/update-event')) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const eventId = url.searchParams.get('id');
    
    if (eventId) {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const updateData = JSON.parse(body);
            updateEvent(eventId, updateData, res); 
        });
    } else {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Event ID is required' }));
    }
  }
  else if (req.method === 'GET' && req.url === '/animals') {
    fetchManageAnimals(res);
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

  else if (req.method === 'GET' && req.url === '/public-exhibits') {
    fetchPublicExhibits(res);
  }

  else if (req.method === 'POST' && req.url === '/add-exhibit') {
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

  else if (req.method === 'GET' && req.url.startsWith('/ticket-report')){
    console.log('Received ticket report request:', req.url);

    const url = new URL(req.url, `http://${req.headers.host}`);
    let startDate = url.searchParams.get('startDate');
    let endDate = url.searchParams.get('endDate');
    const exhibits = url.searchParams.get('exhibits');
    if (!startDate || !endDate) {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
      startDate = thirtyDaysAgo.toISOString().split('T')[0];
      endDate = today.toISOString().split('T')[0];
    }
    const exhibitsList = exhibits ? exhibits.split(',').filter(Boolean) : [];
    getTicketReport(startDate, endDate, exhibitsList, res);
  }

  else if (req.method === 'GET' && req.url === '/giftshop-items') {
    return fetchGiftShopItems(res);
  }

  else if (req.method === 'POST' && req.url === '/purchase-giftshop-item') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
  
    req.on('end', () => {
      purchaseGiftShopItem(res, body);
    });
    return;
  }
  else if (req.method === 'GET' && req.url.startsWith('/giftshop-history')) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const email = url.searchParams.get('email');
    
    if (email) {
      return fetchPurchaseHistory(email, res);
    } else {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Email is required' }));
    }
  }

  else if (req.method === 'GET' && req.url === '/showcases') {
    fetchShowcase(res);
  } 
  else if (req.method === 'POST' && req.url === '/add-showcase') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const showcaseData = JSON.parse(body);
        addShowcase(showcaseData, res);
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid JSON' }));
      }
    });
  }
  else if (req.method === 'PUT' && req.url.startsWith('/update-showcase')) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const showcaseId = url.searchParams.get('id');

    if (showcaseId) {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        try {
          const showcaseData = JSON.parse(body);
          updateShowcase(showcaseId, showcaseData, res);
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Invalid JSON' }));
        }
      });
    } else {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Showcase ID is required' }));
    }
  }
  else if (req.method === 'DELETE' && req.url.startsWith('/remove-showcase')) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const showcaseId = url.searchParams.get('id');

    if (showcaseId) {
      removeShowcase(showcaseId, res);
    } else {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Showcase ID is required' }));
    }
  }

  else if (req.method === 'POST' && req.url === '/add-animal') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const animalData = JSON.parse(body);
        addAnimal(animalData, res);
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid JSON' }));
      }
    });
  }
  else if (req.method === 'PUT' && req.url.startsWith('/update-animal')) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const animalId = url.searchParams.get('id');

    if (animalId) {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        try {
          const animalData = JSON.parse(body);
          updateAnimal(animalId, animalData, res);
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Invalid JSON' }));
        }
      });
    } else {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Animal ID is required' }));
    }
  }
  else if (req.method === 'DELETE' && req.url.startsWith('/remove-animal')) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const animalId = url.searchParams.get('id');

    if (animalId) {
      removeAnimal(animalId, res);
    } else {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Animal ID is required' }));
    }
  } 

  //Membership Section
  else if(req.method === 'GET' && req.url.startsWith('/membership-details')){
    const url = new URL(req.url, `http://${req.headers.host}`);
    const userId = url.searchParams.get('userId');

    if (!userId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'User ID is required' }));
    }
    fetchMembershipDetails(userId, res);
  }
  else if(req.method === 'POST' && req.url === '/upgrade-membership'){
      let body = '';

      req.on('data', chunk => {
          body += chunk.toString();
      });

      req.on('end', () => {
          try {
              const { userId, membershipTier, durationType } = JSON.parse(body);
              
              if (!userId || !membershipTier || !durationType) {
                  res.writeHead(400, { 'Content-Type': 'application/json' });
                  return res.end(JSON.stringify({ error: 'Missing required fields' }));
              }

              upgradeMembership(userId, { membershipTier, durationType }, res);
          } catch (error) {
              console.error('Error processing membership upgrade:', error);
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Invalid request data' }));
          }
      });
  }
  else if (req.method === 'GET' && req.url.startsWith('/membership-report')) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let startDate = url.searchParams.get('startDate');
    let endDate = url.searchParams.get('endDate');
    const types = url.searchParams.get('types');

    if (!startDate || !endDate) {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
      startDate = thirtyDaysAgo.toISOString().split('T')[0];
      endDate = today.toISOString().split('T')[0];
    }

    const typesList = types ? types.split(',').filter(Boolean) : [];
    getMembershipReport(startDate, endDate, typesList, res);

  }
  else if (req.method === 'GET' && req.url === '/giftshop-items') {
    return fetchGiftShopItems(res);
  }
  
  else if (req.method === 'GET' && req.url === '/giftshop-items-all') {
    return fetchAllGiftShopItems(res);
  }
  
  else if (req.method === 'POST' && req.url === '/giftshop-items') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => addGiftShopItem(res, body));
    return;
  }
  else if (req.method === 'PUT' && req.url.match(/^\/giftshop-items\/\d+$/)) {
    const itemId = req.url.split('/')[2];
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => updateGiftShopItem(res, itemId, body));
    return;
  }
  
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Route not found' }));
  }
}).listen(5000, () => {
  console.log('Server is listening on port 5000');
});