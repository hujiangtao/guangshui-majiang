var crc = require('crc');
var logger = require('pomelo-logger').getLogger('test',__filename );

module.exports.dispatch = function(uid, connectors) {
	var index = Math.abs(crc.crc32(uid)) % connectors.length;
	//logger.info("-- crc %s ", crc.crc32(uid));

	return connectors[index];
};