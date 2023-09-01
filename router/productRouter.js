const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');

router.get(
	'/',
	wrapAsync(async (req, res) => {
		const products = await Product.find({});
		if (products.length > 0) {
			return res.status(200).json(products);
		}

		throw new ExpressError('No products found', 404);
	})
);

router.post(
	'/',
	wrapAsync(async (req, res) => {
		const productData = req.body;
		const product = new Product(productData);
		await product.save();
		res.status(202).json(product);
	})
);

router.get(
	'/:collectionid',
	wrapAsync(async (req, res) => {
		const collectionId = req.params.collectionid;
		const collection = await Product.findOne({ routeName: collectionId });
		if (!collection) {
			throw new ExpressError('No collection found', 404);
		}
		return res.status(200).json(collection);
	})
);

module.exports = router;
