const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema(
	{
		title: {
			type: String,
			required: true
		},
		routeName: {
			type: String,
			required: true
		},
		items: [
			{
				name: { type: String, required: true },
				imageUrl: { type: String, required: true },
				price: { type: Number, required: true }
			}
		]
	},
	{
		timestamps: true
	}
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
