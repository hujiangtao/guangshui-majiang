/**
** game server服务器。这里handler处理与browser连接的相关操作。
 * 可以把handler作为control看待
**/
var connectorLogger = require("pomelo-logger").getLogger("con-log", __filename);
var rpcLogger = require("pomelo-logger").getLogger("rpc-log", __filename);
var forwardLogger = require("pomelo-logger").getLogger("forward-log", __filename);

// var GameRemote = require('../remote/gameRemote');
var random = require('../../../util/random');

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
};

/*
* 向handler原型中添加方法
* */
var handler = Handler.prototype;

/**
 * 解散房间
 **/
handler.disbandRoom = function(msg, session, next){
	var self = this;

	var uid = session.uid;
	var roomId = session.get("roomId");

	self.app.rpc.game.gameRemote.disbandRoomById(session, uid, roomId, function (resultCode) {
		if(resultCode === 200){
			session.set('roomId', null);
			next(null, {code: resultCode});
		} else if(resultCode === 500){
			next(null, {code: resultCode});
		}
	});
};

/**
 * 返回游戏大厅
 **/
handler.returnToHall = function(msg, session, next){
	var self = this;

	var uid = session.uid;
	var roomId = session.get("roomId");

	self.app.rpc.game.gameRemote.returnToHall(session, uid, roomId, function (resultCode) {
		if(resultCode === 200){
			session.set("roomId", null);
			next(null,{code: resultCode});
		}else if(resultCode === 500){
			next(null,{code: resultCode});
		}
	});
};

/**
 * 准备游戏
 **/
handler.readyForGame = function(msg, session, next){
	var self = this;

	var uid = session.uid;
	var roomId = session.get('roomId');

	self.app.rpc.game.gameRemote.readyForTheGame(session, uid, roomId, function (count) {
		if(count === -1){
			next(null, {code: 500, msg: "服务器出错"});
		}else if(count === 0){
			next(null, {code: 500, msg: "已经点击"});
		}else if(count === 3){


			next(null, {code: 200, flag: true, msg: "所有用户已经准备好了"})
		}else{
			next(null, {code: 200, flag: false, msg: "用户" + uid + "准备好了"});
		}
	});
};

/**
 * 初始化麻将牌。
 **/
handler.initMJs = function(msg, session, next){
	var self = this;

	var uid = session.uid;
	var roomId = session.get('roomId');

	self.app.rpc.game.gameRemote.initMJs(session, uid, roomId,function (flag, data) {

	})
};

/**
 * 获取骰子点数
 **/
handler.getDiceNumber = function(msg, session, next){
	var self = this;

	var uid = session.uid;
	var roomId = session.get('roomId');

	self.app.rpc.game.gameRemote.getTwoDiceNumber(session, uid, roomId,function (flag, data) {
		if(flag){
			next(null, {code: 200, number: data});
		} else {
			next(null, {code: 500});
		}
	})

};

/**
 * 取牌
 **/
handler.give = function(msg, session, next){
	var self = this;

	var uid = session.uid;
	var  roomId = session.get("roomId");
	var tokenId = msg.token;

	if(uid === tokenId){
		self.app.rpc.game.gameRemote.giveTitles(session, uid, roomId, function (title) {
			next(null,{code: 200, title: title});
		});
	}else {
		next(null, {code: 500, msg: "Token does not match"});
	}
};
/**
 * 出牌
 **/
handler.play = function(msg, session, next){
	var self = this;

	var uid = session.uid;
	var  roomId = session.get("roomId");
	var title = msg.title;

	self.app.rpc.game.gameRemote.playTitles(session, uid, roomId, title, function (title) {

	});
};

/**
 * 同步客户端与服务器端的麻将牌
 **/
handler.synchronous = function(msg, session, next){
	var self = this;

	var uid = session.uid;
	var roomId = session.get("roomId");

	self.app.rpc.game.gameRemote.synchronousTitles(session, msg.titles, uid, roomId,function (flag) {
		if(flag){
			next(null, {code: 200})
		}else {
			next(null, {code: 500})
		}
	})
};


/**
 * Send messages to users
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
handler.send = function(msg, session, next) {
	var rid = session.get('roomId');
	var username = session.uid.split('*')[0];
	var channelService = this.app.get('channelService');
	var param = {
		route: 'onChat',
		msg: msg.content,
		from: username,
		target: msg.target
	};
	channel = channelService.getChannel(rid, false);

	//the target is all users
	if(msg.target == '*') {
		channel.pushMessage(param);
	}
	//the target is specific user
	else {
		var tuid = msg.target + '*' + rid;
		var tsid = channel.getMember(tuid)['sid'];
		channelService.pushMessageByUids(param, [{
			uid: tuid,
			sid: tsid
		}]);
	}
	next(null, {
		route: msg.route
	});
};