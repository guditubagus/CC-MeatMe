const express = require("express");
const router = express.Router();
const productsController = require("../controllers/productsController");
const cartController = require("../controllers/cartController");
const checkoutController = require("../controllers/checkoutController");
const transactionsController = require("../controllers/transactionsController");

// products
router.post("/products", productsController.createProduct);
router.get("/products", productsController.getAllProducts);
router.get("/products/:id", productsController.getProductById);
router.delete("/products/:id", productsController.deleteProductById);

// cart
router.post("/cart", cartController.addToCart);
router.get("/cart", cartController.getCart);
router.delete("/cart/:id", cartController.removeFromCart);

// checkout
router.post("/checkout", checkoutController.processPayment);

// transactions
router.get("/transactions", transactionsController.getAllTransactions);

module.exports = router;
