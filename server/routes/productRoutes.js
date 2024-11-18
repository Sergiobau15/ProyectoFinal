const express = require('express');
const router = express.Router();
const { createProduct, specificProduct, products, updateProduct, inactivateProduct, productsInactive, activateProduct } = require('../controllers/product');

router.post("/create", createProduct);
router.get("/",products);
router.get("/productsInactive", productsInactive);
router.get("/:id", specificProduct);
router.put("/updateProduct/:id", updateProduct);
router.patch("/inactivateProduct/:id", inactivateProduct);
router.put("/activate/:id", activateProduct);

module.exports = router;