const express = require("express");
const router = express.Router();
const db = require("./config/db");
require("./config/storage");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const Joi = require("joi");
const { Storage } = require("@google-cloud/storage");

// validation input

const schemaRegister = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    "any.required": "Name is required",
    "string.min": "Name allowed min 3 letters.",
    "string.max": "Name allowed max 30 letters.",
  }),
  email: Joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.email": "Email must be a valid email address",
  }),
  password: Joi.string().min(10).required().messages({
    "any.required": "Password is required",
    "string.min": "Password must be at least 10 characters long",
  }),
  phone_number: Joi.string().required().messages({
    "any.required": "Phone number is required",
  }),
  address: Joi.string().required().messages({
    "any.required": "Address is required",
  }),
});

const schemaLogin = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.email": "Email must be a valid email address",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

const validateSignup = (req, res, next) => {
  const validationResult = schemaRegister.validate(req.body);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ error: validationResult.error.details[0].message });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const validationResult = schemaLogin.validate(req.body);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ error: validationResult.error.details[0].message });
  }
  next();
};

// buyer

// signup

router.post("/signup", validateSignup, (req, res, next) => {
  // checking account first, existed or not with email
  const sql = "SELECT * FROM buyers WHERE email = ?";
  console.log(req.body);
  const { name, email, password, phone_number, address } = req.body;
  db.query(sql, [email], (err, result) => {
    if (result.length) {
      return res.status(409).send({
        message: "This account existed",
      });
    } else {
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          return res.status(500).send({
            message: err,
          });
        } else {
          const sql =
            "INSERT INTO buyers (name, email, password, phone_number, address) VALUES (?, ?, ?, ?, ?)";
          db.query(
            sql,
            [name, email, hash, phone_number, address],
            (err, result) => {
              if (err) {
                return res.status(400).send({
                  message: err,
                });
              }
              return res.status(201).send({
                message: "Account Successfully Registered!",
              });
            }
          );
        }
      });
    }
  });
});

// sigin
router.post("/signin", validateLogin, (req, res, next) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM buyers WHERE email = ?";
  db.query(sql, [email], (err, result) => {
    if (err) {
      return res.status(400).send({
        message: err,
      });
    }
    if (!result.length) {
      return res.status(401).send({
        message: "Wrong email or password",
      });
    }
    bcrypt.compare(password, result[0]["password"], (err, isMatch) => {
      if (err) {
        return res.status(401).send({
          message: "Wrong email or password",
        });
      }
      if (isMatch && result[0].id) {
        const token = JWT.sign({ id: result[0].id }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });
        return res.status(200).send({
          message: "Login Success!",
          token: token,
        });
      } else {
        return res.status(401).send({
          message: "Wrong email or password",
        });
      }
    });
  });
});

// home app (beranda)
router.get("/products", (req, res) => {
  const email = req.params.email;
  const sqlQuery = "SELECT * FROM products";

  db.query(sqlQuery, (err, result) => {
    if (err) throw err;
    return res.send({ data: result, message: "all products displayed!" });
  });
});

// profile app buyer
router.get("/profile/:email", (req, res) => {
  const email = req.params.email;
  const sql = "SELECT * FROM buyers WHERE email = ?";

  if (
    !req.headers.authorization.startsWith("Bearer") ||
    !req.headers.authorization.split(" ")[1] ||
    !req.headers.authorization
  ) {
    return res.status(422).json({
      message: "Please use token before!",
    });
  }
  const token = req.headers.authorization.split(" ")[1];
  const decoded = JWT.verify(token, process.env.JWT_SECRET);
  db.query(sql, [email, decoded.id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
    return res.status(200).json({
      message: "Success",
      data: result,
    });
  });
});

// search products
router.get("/products/search/:meatname", (req, res) => {
  const meatname = req.params.meatname;
  const sql = "SELECT * FROM products WHERE meatname = ?";
  db.query(sql, [meatname], (err, result) => {
    if (err) throw err;
    return res.send(result);
  });
});

// products details
router.get("/products/:meatname", (req, res) => {
  const meatname = req.params.meatname;
  const sql = `SELECT * FROM products WHERE meatname = ?`;
  db.query(sql, [meatname], (err, result) => {
    if (err) throw err;
    return res.send(result);
  });
});

// cart
router.post("/cart", (req, res) => {});

// seller

// register
router.post("/register", validateSignup, (req, res, next) => {
  // checking account first, existed or not with email
  const sql = "SELECT * FROM sellers WHERE email = ?";
  console.log(req.body);
  const { name, email, password, phone_number, address } = req.body;
  db.query(sql, [email], (err, result) => {
    if (result.length) {
      return res.status(409).send({
        message: "This account existed",
      });
    } else {
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          return res.status(500).send({
            message: err,
          });
        } else {
          const sql =
            "INSERT INTO sellers (name, email, password, phone_number, address) VALUES (?, ?, ?, ?, ?)";
          db.query(
            sql,
            [name, email, hash, phone_number, address],
            (err, result) => {
              if (err) {
                return res.status(400).send({
                  message: err,
                });
              }
              return res.status(201).send({
                message: "Account Successfully Registered!",
              });
            }
          );
        }
      });
    }
  });
});

// login
router.post("/login", validateLogin, (req, res, next) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM sellers WHERE email = ?";
  db.query(sql, [email], (err, result) => {
    if (err) {
      return res.status(400).send({
        message: err,
      });
    }
    if (!result.length) {
      return res.status(401).send({
        message: "Wrong email or password",
      });
    }
    bcrypt.compare(password, result[0]["password"], (err, isMatch) => {
      if (err) {
        return res.status(401).send({
          message: "Wrong email or password",
        });
      }
      if (isMatch && result[0].id) {
        const token = JWT.sign({ id: result[0].id }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });
        return res.status(200).send({
          message: "Login Success!",
          token: token,
        });
      } else {
        return res.status(401).send({
          message: "Wrong email or password",
        });
      }
    });
  });
});

// profile app seller
router.get("/profileSeller/:email", (req, res) => {
  const email = req.params.email;
  const sql = "SELECT * FROM sellers WHERE email = ?";

  if (
    !req.headers.authorization.startsWith("Bearer") ||
    !req.headers.authorization.split(" ")[1] ||
    !req.headers.authorization
  ) {
    return res.status(422).json({
      message: "Please use token before!",
    });
  }
  const token = req.headers.authorization.split(" ")[1];
  const decoded = JWT.verify(token, process.env.JWT_SECRET);
  db.query(sql, [email, decoded.id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
    return res.status(200).json({
      message: "Success",
      data: result,
    });
  });
});

// make data products (only works for seller)
router.post("/products", (req, res) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    return res.status(422).json({
      message: "Please use token before!",
    });
  }

  const token = req.headers.authorization.split(" ")[1];

  const decoded = JWT.verify(token, process.env.JWT_SECRET);
  const userID = decoded.id;

  // products details
  const address = req.body.address;
  const meatname = req.body.meatname;
  const details = req.body.details;
  const stock = req.body.stock;
  const price = req.body.price;
  const image = req.file;

  if (!image) {
    return res.status(400).send("No image file uploaded");
  }

  const allowedExtensions = ["jpg", "jpeg", "png"];
  const extension = image.originalname.split(".").pop().toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    return res.status(400).send("Only image files are allowed");
  }

  const date = new Date();

  const fileName = `${date.toJSON()}_${image.originalname}`;

  // Upload the image to GCS
  try {
    const blob = gcs.file(fileName);
    const stream = blob.createWriteStream({
      metadata: {
        contentType: image.mimetype,
      },
    });
    stream.on("error", (err) => {
      console.error(err);
      res.status(500).send("Error uploading image");
    });
    stream.on("finish", async () => {
      try {
        // Insert the product into the database
        const imageUrl = `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${fileName}`;
        const sql = `
          INSERT INTO products(address, meatname, details, stock, price, image)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        const values = [address, meatname, details, stock, price, imageUrl];
        const [result] = await db.execute(sql, values);

        res.status(201).send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send("Error creating product");
      }
    });
    stream.end(image.buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error uploading image");
  }
});

// change data product by ID
router.put("/products/:id_product", (req, res) => {
  if (
    !req.headers.authorization.startsWith("Bearer") ||
    !req.headers.authorization.split(" ")[1] ||
    !req.headers.authorization
  ) {
    return res.status(422).json({
      message: "Please use token before!",
    });
  }
  const token = req.headers.authorization.split(" ")[1];
  const decoded = JWT.verify(token, process.env.JWT_SECRET);

  const id_product = req.params.id_product;
  const address = req.body.address;
  const meatname = req.body.meatname;
  const details = req.body.details;
  const stock = req.body.stock;
  const price = req.body.price;

  const sql =
    "UPDATE products SET address = ?, meatname = ?, details = ?, stock = ?, price = ? WHERE id_product = ?";

  db.query(
    sql,
    [address, meatname, details, stock, price, id_product],
    decoded.id,
    (err, result) => {
      if (err) throw err;
      return res.send({ data: result });
    }
  );
});

// delete product data by ID
router.delete("/products/:id_product", (req, res) => {
  if (
    !req.headers.authorization.startsWith("Bearer") ||
    !req.headers.authorization.split(" ")[1] ||
    !req.headers.authorization
  ) {
    return res.status(422).json({
      message: "Please use token before!",
    });
  }
  const token = req.headers.authorization.split(" ")[1];
  const decoded = JWT.verify(token, process.env.JWT_SECRET);

  const id_product = req.params.id_product;
  const sql = "DELETE FROM products WHERE id_product = ?";

  db.query(sql, [id_product], decoded.id, (err, result) => {
    if (err) throw err;
    return res.send({ data: result });
  });
});

module.exports = router;
