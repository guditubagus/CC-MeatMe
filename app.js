const express = require("express");
const bodyParser = require("body-parser");
const router = require("./routes");

const app = express();

app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api", router);

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error";
  res.status(err.statusCode).json({
    message: err.message,
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));
