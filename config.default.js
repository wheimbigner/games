module.exports = {
	'jwtSecret': 'generate-a-random-string-for-this',
	'database': 'mongodb://games:password@127.0.0.1:27017/games',
	'mailgun': {
		apikey: 'mailgun-api-key',
		sender: 'donotreply@youdomain.com'
	},
	port: 8080,
	allowCORS: true,
	debug: true,
	masterUser: {
		_id: 'gameadmin',
		password: 'Master user password',
		firstName: 'William',
		lastName: 'Heimbigner',
		supervisor: '',
		admin: true		
	}
}