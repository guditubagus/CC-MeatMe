const db = require("../config/db");

exports.processPayment = async (req, res) => {
  const { name, email, address, amount } = req.body;

  try {
    const sql =
      "INSERT INTO transactions (name, email, address, amount) VALUES (?, ?, ?, ?)";
    const values = [name, email, address, amount];
    const [result] = await db.execute(sql, values);

    res.status(201).json({
      id: result.insertId,
      name,
      email,
      address,
      amount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing payment");
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const sql = "SELECT * FROM transactions WHERE email = ?";
    const [results] = await db.execute(sql);

    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving transactions");
  }
};
