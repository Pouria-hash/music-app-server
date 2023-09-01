const mongoose = require('mongoose');
const Product = require('../models/product');
const SHOP_DATA = require('./products');

mongoose
	.connect('mongodb://localhost:27017/e-commerce', {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		useFindAndModify: false
	})
	.then(() => console.log('mongoose connected'))
	.catch((err) => console.log(err));

const seedDb = async () => {
	try {
		await Product.deleteMany({});

		const products = await Product.insertMany(SHOP_DATA);
		console.log(products);
	} catch (err) {
		coonsole.log(err);
	}
};

seedDb();
