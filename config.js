const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Error Connecting to database: ", err);
  }
  console.log("Connected to database");
});

const { Storage } = require("@google-cloud/storage");

const storage = new Storage({
  projectId: process.env.PROJECT_ID,
  keyFilename: process.env.KEYFILE,
});

const bucket = storage.bucket(process.env.BUCKET_NAME);

bucket
  .getFiles()
  .then(() => {
    console.log("Google Cloud Storage connection successful");
  })
  .catch((err) => {
    console.error("Google Cloud Storage connection error:", err);
  });

module.export = { db, bucket };
