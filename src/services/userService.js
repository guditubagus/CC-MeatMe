const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

// signup
async function signup(signup) {
  const { error } = validateSignup(signup);
  if (error) {
    throw new Error(error.details.map((detail) => detail.message).join(", "));
  }

  const { name, email, password } = signup;

  // check email existed
  const emailExists = await new Promise((resolve, reject) => {
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result.length > 0);
    });
  });
  if (emailExists) {
    throw new Error("Email is already taken");
  }

  // hashing password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const sql = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
  const result = await new Promise((resolve, reject) => {
    db.query(sql, [name, email, hashedPassword], (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
  console.log(result);
  return "User signed up successfully";
}

// login
async function login(login) {
  const { error } = validateLogin(login);
  if (error) {
    throw new Error(error.details.map((detail) => detail.message).join(", "));
  }

  const { email, password } = login;

  const sql = `SELECT * FROM users WHERE email = ?`;
  const result = await new Promise((resolve, reject) => {
    db.query(sql, [email], async (err, result) => {
      if (err) {
        reject(err);
      }
      if (result.length === 0) {
        reject(new Error("Wrong email or password"));
      }

      // compare password hash
      const user = result[0];
      if (!user) {
        reject(new Error("Wrong email or password"));
      }
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        reject(new Error("Wrong email or password"));
      }

      // create JWT token
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      resolve(token);
      return token;
    });
  });
  //   console.log(result);
  return result;
}

// update user
updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;

  // validate input
  const schema = Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().min(10),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  try {
    const sql = "SELECT * FROM users WHERE id = ?";
    const [results] = await db.execute(sql, [id]);

    if (results.length === 0) {
      res.status(404).send("User not found");
    } else {
      const user = results[0];

      // check email existed
      if (email && email !== user.email) {
        const emailSql = "SELECT * FROM users WHERE email = ?";
        const [emailResults] = await db.execute(emailSql, [email]);
        if (emailResults.length > 0) {
          return res.status(400).send("Email is already taken");
        }
      }

      if (name) {
        user.name = name;
      }
      if (email) {
        user.email = email;
      }
      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }

      const updateSql =
        "UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?";
      const updateValues = [user.name, user.email, user.password, id];
      await db.execute(updateSql, updateValues);

      res.status(200).json({
        id,
        name: user.name,
        email: user.email,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating user");
  }
};

// validate input
function validateSignup(signup) {
  const schema = Joi.object({
    name: Joi.string().required().messages({
      "any.required": "Name is required",
    }),
    email: Joi.string().email().required().messages({
      "any.required": "Email is required",
      "string.email": "Email must be a valid email address",
    }),
    password: Joi.string().min(10).required().messages({
      "any.required": "Password is required",
      "string.min": "Password must be at least 10 characters long",
    }),
  });
  return schema.validate(signup, { abortEarly: false });
}

function validateLogin(login) {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "any.required": "Email is required",
      "string.email": "Email must be a valid email address",
    }),
    password: Joi.string().required().messages({
      "any.required": "Password is required",
    }),
  });
  return schema.validate(login, { abortEarly: false });
}

module.exports = {
  signup,
  login,
  updateUser,
};
