/* eslint-disable no-console */

const { register } = require('./events');
const keepAlive = require('./utils/keep-alive');

module.exports = app => {
	console.log('Yay, the app was loaded!');
	const router = app.route('/size-plugin');
	router.use(
		keepAlive({
			path: '/size-plugin/_keepalive',
			handler(req, res, next, options) {
				if (req.path === options.path.replace('/size-plugin', '')) {
					res.send("I'm alive");
				} else {
					next();
				}
			}
		})
	);
	router.get('/ping', (req, res) => {
		res.send('pong!!');
	});
	router.get('/', (req, res) => {
		res.send('Hello Dolores !!');
	});
	register(app);
};
