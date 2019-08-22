const http = require('http');

function createOptions(options) {
	const opt = {
		path: options.path || '/_keepalive',
		delay: options.delay || 3,
		handler: options.handler
	};
	opt.url = `http://${process.env.PROJECT_DOMAIN}.glitch.me${opt.path}`;
	return opt;
}
module.exports = function keepAlive(options) {
	const opt = createOptions(options);
	setInterval(() => http.get(opt.url), opt.delay * 60 * 1000);
	return (req, res, next) => {
		if (opt.handler) {
			opt.handler(req, res, next, opt);
		} else if (req.path === opt.path) {
			res.send("I'm alive");
		} else {
			next();
		}
	};
};
