var dispatcher = require('../../../util/dispatcher');
var connectorLogger = require("pomelo-logger").getLogger("con-log", __filename);

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
};

var handler = Handler.prototype;

/**
 * Gate handler that dispatch user to connectors.
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param {Function} next next stemp callback
 *
 */
handler.queryEntry = function(msg, session, next) {
	var uid = msg.uid;
	connectorLogger.info('-- gate info: %j **', msg);

	if(!uid) {
		next(null, {code: 500});
		return;
	}
	// get all connectors
	var connectors = this.app.getServersByType('connector');
	if(!connectors || connectors.length === 0) {
		next(null, { code: 500 });
		return;
	}
	// select connector
	var res = dispatcher.dispatch(uid, connectors);
	next(null, { code: 200, host: res.host, port: res.clientPort });
};
