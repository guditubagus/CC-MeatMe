const db = require("../config/db");

exports.createTransaction = async (amount, currency) => {
  try {
    const sql = "INSERT INTO transactions (amount, currency) VALUES (?, ?)";
    const values = [amount, currency];
    const [result] = await db.execute(sql, values);

    return result.insertId;
  } catch (err) {
    console.error(err);
    throw new Error("Error creating transaction");
  }
};

exports.getTransactionById = async (id) => {
  try {
    const sql = "SELECT * FROM transactions WHERE id = ?";
    const [results] = await db.execute(sql, [id]);

    if (results.length === 0) {
      throw new Error("Transaction not found");
    } else {
      const { amount, currency, created_at } = results[0];
      return {
        id,
        amount,
        currency,
        createdAt: created_at,
      };
    }
  } catch (err) {
    console.error(err);
    throw new Error("Error retrieving transaction");
  }
};

exports.getAllTransactions = async () => {
  try {
    const sql = "SELECT * FROM transactions";
    const [results] = await db.execute(sql);

    return results;
  } catch (err) {
    console.error(err);
    throw new Error("Error retrieving transactions");
  }
};
