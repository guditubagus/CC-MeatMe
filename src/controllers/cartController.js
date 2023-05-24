const db = require("../config/db");

exports.addToCart = async (req, res) => {
  const { name, email, address, items } = req.body;

  try {
    // insert cart do db
    const sql =
      "INSERT INTO carts (name, email, address, items) VALUES (?, ?, ?, ?)";
    const values = [name, email, address, JSON.stringify(items)];
    const [result] = await db.execute(sql, values);

    res.status(201).json({
      id: result.insertId,
      name,
      email,
      address,
      items,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding to cart");
  }
};

exports.getCart = async (req, res) => {
  const { email } = req.query;

  try {
    const sql = "SELECT * FROM carts WHERE email = ?";
    const [results] = await db.execute(sql, [email]);

    if (results.length === 0) {
      res.status(404).send("Cart not found");
    } else {
      const { id, name, email, address, items } = results[0];
      res.status(200).json({
        id,
        name,
        email,
        address,
        items: JSON.parse(items),
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving cart");
  }
};

exports.removeFromCart = async (req, res) => {
  const { id } = req.params;

  try {
    const sql = "DELETE FROM carts WHERE id = ?";
    const [result] = await db.execute(sql, [id]);

    if (result.affectedRows === 0) {
      res.status(404).send("Cart not found");
    } else {
      res.status(204).send();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error removing from cart");
  }
};
