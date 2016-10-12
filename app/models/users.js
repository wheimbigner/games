var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var mongooseHidden = require('mongoose-hidden')({ defaultHidden: { password: true }});

var bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;

var UserSchema = new Schema(
	{
		_id: String,
		password: { type: String, default: '' },
		firstName: String,
		lastName: String,
		supervisor: String,
		parttime: Boolean,
		admin: { type: Boolean, default: false },
		lastlogin: Date,
	},
	{
		timestamps: true
	}
);
UserSchema.pre('save', function (next) {
	const user = this;
	if (!user.isModified('password')) return next();
	bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
		if (err) return next(err);
		bcrypt.hash(user.password, salt, (err, hash) => {
			if (err) return next(err);
			user.password = hash;
			next();
		})
	})
})
UserSchema.methods.checkpass = function (pass, cb) {
	bcrypt.compare(pass, this.password, function (err, isMatch) {
		if (err) return cb(err);
		cb(null, isMatch);
	});
};
UserSchema.plugin(mongooseHidden);

module.exports = mongoose.model('User', UserSchema);