const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 20,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("Error Connecting to database: ", err);
  }
  console.log("Connected to database");
});
module.export = db;
