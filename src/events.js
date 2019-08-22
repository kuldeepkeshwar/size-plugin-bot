/* eslint-disable no-console */

const diff = require('./diff');
const size = require('./size');

function register(app) {
	app.on(['push'], async context => {
		setTimeout(size.get, 0, context);
	});
	app.on(['pull_request.opened', 'pull_request.synchronize'], async context => {
		setTimeout(diff.get, 0, context);
	});
}
module.exports = { register };
