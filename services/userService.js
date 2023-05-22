const db = require("../database/db");
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
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
      resolve(token);
      return token;
    });
  });
  //   console.log(result);
  return result;
}

// update user
async function updateUser(id, update) {
  const { error } = validateUpdate(update);
  if (error) {
    throw new Error(error.details.map((detail) => detail.message).join(", "));
  }

  const { name, email, password } = update;

  // check email existed
  const emailExists = await new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM users WHERE email = ? AND id != ?",
      [email, id],
      (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result.length > 0);
      }
    );
  });
  if (emailExists) {
    throw new Error("Email is already taken");
  }

  // has password
  let hashedPassword = null;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  const sql = `UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?`;
  const result = await new Promise((resolve, reject) => {
    db.query(sql, [name, email, hashedPassword, id], (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
  console.log(result);
  return "User updated successfully";
}

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

function validateUpdate(update) {
  const schema = Joi.object({
    name: Joi.string(),
    email: Joi.string().email().messages({
      "string.email": "Email must be a valid email address",
    }),
    password: Joi.string().min(10).messages({
      "string.min": "Password must be at least 10 characters long",
    }),
  });
  return schema.validate(update, { abortEarly: false });
}

module.exports = {
  signup,
  login,
  updateUser,
};
