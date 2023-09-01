const { hash, compare } = require('bcryptjs');

module.exports.hashPassword = async (password) => {
	const hashPassword = await hash(password, 12);

	return hashPassword;
};

module.exports.comparePassword = async (password, hashedPassword) => {
	const isValid = await compare(password, hashedPassword);

	return isValid;
};
