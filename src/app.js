const express = require("express");
// const router = express.Router();
const userController = require("./controllers/userController");
const routes = require("./routes/routes");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/", routes);

app.post("/signup", userController.signup);
app.post("/login", userController.login);
app.put("/users/:id", userController.verifyToken, userController.updateUser);

app.listen(3000, () => {
  console.log(`Server started on port ${PORT}`);
});
