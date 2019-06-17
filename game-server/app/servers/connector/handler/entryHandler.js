/**
 * connector 前端服务器。前端服务器主要管理session和Browser的链接。
 * 因此在connector handler中应该主要处理针对session的相关操作；所以下面的关于channel的操作应该
 * 可以放到game server中去。
 *
 * 这里应该只处理与session相关的操作。
* */
var forwardLogger = require("pomelo-logger").getLogger("forward-log", __filename);
var rpcLogger = require("pomelo-logger").getLogger("rpc-log", __filename);

var random = require('../../../util/random');

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
		this.app = app;
};

var handler = Handler.prototype;

/**
 * 修改到只用用户登录而不需要频道，
 * 此函数是将当前连接的uid与session绑定。
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
handler.enter = function(msg, session, next) {
	var self = this;

	var uid = msg.username;
	var sessionService = self.app.get('sessionService');

	//duplicate log in 重复登录
	if( !! sessionService.getByUid(uid)) {
		next(null, {code: 500});
		return false;
	}

	session.bind(uid);
	//添加一个listener
	session.on('closed', onUserLeave.bind(null, self.app));
	next(null, { code: 200, user: uid});
};


/**
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onUserLeave = function(app, session) {
	if(!session || !session.uid || !session.get('roomId')) {
		return;
	}

	app.rpc.game.gameRemote.kick(session, session.uid, app.get('serverId'), session.get('roomId'), null);
};


/**
 * 创建或加入房间;因为game server的route是以roomId为参数；所以不能将这个方法移到gameHandler中去。
 *
 * @param {Object} msg	客户端传递的数据 msg.flag创建房间还是加入房间；msg.roomId房间号.
 * @param {Object} session
 * @param  {Function} next 回调函数，在response时执行
 */
handler.enterTheRoom = function(msg, session, next) {
	var self = this;
	var mjRoomId = null;
	var createFlag;

	//判断是创建房间还是加入房间
	if(msg.flag === "create" && !msg.roomId){
		mjRoomId = random.generateRoomNumber();
		createFlag = true;
	} else if(msg.flag === "join" && msg.roomId){
		mjRoomId = msg.roomId;
		createFlag = false;
	} else {
		next(null, {code: 500});
		return;
	}

	session.set('roomId', mjRoomId);

	self.app.rpc.game.gameRemote.getNumberOfPlayer(session, mjRoomId, function (roomId, number) {
        if(number >= 3){
            rpcLogger.error("-- 房间 %s已有%s人.", roomId, number);

			session.set('roomId', null);
            next(null, {code: 500, msg: "the room is full."});

            return false;
        } else {
            session.push('roomId', function(err){
                if(err){
                    console.error('set rid for session service failed! error is : %j', err.stack);
                }
            });

            self.app.rpc.game.gameRemote.add(session, session.uid, self.app.get('serverId'), mjRoomId, createFlag,
                function (code, id, current, others) {
                    if(code === 500){
                        forwardLogger.error("-- 加入房间失败；flag = %s, uid = %s, roomId = %s.",
													createFlag, session.uid, mjRoomId);

                        next(null, {code: code, msg: "加入房间失败。"});
                        return false;
                    }else if(code === 200){
                        next(null, {code: code, roomId: id, currentPlayer: current, otherPlayers: others});
                    }
                })
        }
	});
};
