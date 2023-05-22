const express = require("express");
const router = express.Router();
const userController = require("./controllers/userController");

const app = express();

app.use(express.json());

app.post("/signup", userController.signup);
app.post("/login", userController.login);
app.put("/users/:id", userController.verifyToken, userController.updateUser);

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
