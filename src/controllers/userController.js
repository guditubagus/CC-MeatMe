const userService = require("../services/userService");
const jwt = require("jsonwebtoken");

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).send("Token is required!");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    // console.log(req.userId);
    next();
  } catch (error) {
    return res.status(401).send("Unauthorized");
  }
}

async function signup(req, res) {
  try {
    const result = await userService.signup(req.body);
    res.send(result);
  } catch (error) {
    res.status(400).send(error.message);
  }
}

async function login(req, res) {
  try {
    const result = await userService.login(req.body);
    res.send(result);
  } catch (error) {
    res.status(400).send(error.message);
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    // Check if user is authorized to update profile
    // if (userId !== id) {
    //   return res.status(401).send("asdasd");
    // }

    const result = await userService.updateUser(id, { name, email, password });
    res.send(result);
  } catch (error) {
    res.status(400).send(error.message);
  }
}

module.exports = {
  signup,
  login,
  updateUser,
  verifyToken,
};
