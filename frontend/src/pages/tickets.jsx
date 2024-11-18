const purchaseTicket = async (ticketData, res) => {
  // Start a transaction
  connection.beginTransaction(async (err) => {
    if (err) {
      console.error('Error starting transaction:', err);
      return handleDBError(res, err);
    }

    try {
      // Get customer ID
      const [customerResults] = await connection.promise().query(
        'SELECT ID FROM Customer WHERE email = ?',
        [ticketData.email]
      );

      if (customerResults.length === 0) {
        throw new Error('Customer not found');
      }

      const customerId = customerResults[0].ID;
      const purchaseDate = new Date().toISOString().split('T')[0];

      // Verify exhibit exists and is open
      const [exhibitResults] = await connection.promise().query(
        'SELECT ID, is_closed FROM Exhibit WHERE ID = ? AND is_deleted = 0',
        [ticketData.exhibitId]
      );

      if (exhibitResults.length === 0) {
        throw new Error('Exhibit not found');
      }

      if (exhibitResults[0].is_closed) {
        throw new Error('Exhibit is currently closed');
      }

      // Insert Receipt
      const [receiptResult] = await connection.promise().query(
        'INSERT INTO Receipt (Customer_ID, Item_IDs, Total_Amount, Purchase_Date) VALUES (?, ?, ?, ?)',
        [customerId, ticketData.exhibitId.toString(), ticketData.price, purchaseDate]
      );

      const receiptId = receiptResult.insertId;

      // Insert Ticket
      await connection.promise().query(
        'INSERT INTO Ticket (Customer_ID, Ticket_Type, Price, Purchase_Date, Receipt_ID, Exhibit_ID) VALUES (?, ?, ?, ?, ?, ?)',
        [
          customerId,
          ticketData.ticketType,
          ticketData.price,
          purchaseDate,
          receiptId,
          ticketData.exhibitId
        ]
      );

      // If everything succeeded, commit the transaction
      await connection.promise().commit();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Ticket purchased successfully',
        receiptId: receiptId
      }));

    } catch (error) {
      // If anything fails, rollback the transaction
      await connection.promise().rollback();
      
      console.error('Error in ticket purchase:', error);
      
      if (error.message === 'Customer not found' || error.message === 'Exhibit not found') {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: error.message }));
      } else if (error.message === 'Exhibit is currently closed') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: error.message }));
      } else {
        handleDBError(res, error);
      }
    }
  });
};

// Helper function to fetch purchased tickets with full details
const fetchPurchasedTickets = async (email, res) => {
  try {
    const query = `
      SELECT 
        t.ID AS Ticket_ID,
        t.Ticket_Type,
        t.Price,
        t.Purchase_Date,
        t.Receipt_ID,
        r.Total_Amount,
        e.Name AS Exhibit_Name,
        e.Location AS Exhibit_Location
      FROM Ticket t
      JOIN Receipt r ON t.Receipt_ID = r.ID
      JOIN Customer c ON t.Customer_ID = c.ID
      LEFT JOIN Exhibit e ON t.Exhibit_ID = e.ID
      WHERE c.email = ? AND t.is_deleted = 0
      ORDER BY t.Purchase_Date DESC
    `;

    const [tickets] = await connection.promise().query(query, [email]);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(tickets));

  } catch (error) {
    console.error('Error fetching purchased tickets:', error);
    handleDBError(res, error);
  }
};