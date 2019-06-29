/**
 * game server相关的逻辑操作都放在这里。
 * romate应该管理房间对象和频道对象。用户对象应该是房间对象管理。
**/
var rpcLogger = require("pomelo-logger").getLogger("rpc-log", __filename);
var random = require('../../../util/random');

/*
* 包中导出一个函数，这个函数运行时返回一个GameRemote对象，
* 这个函数可以看成一个工厂函数。
* */
module.exports = function(app) {
	return new GameRemote(app);
};

/*
* GameRemote对象是门面对象，facade模式
* 在gameRemote中，需要创建房间，房间管理游戏的棋牌和动作，已经玩家的数据。
* 这里的玩家数据应该与session解耦；玩家数据只是游戏数据，所以退出游戏后就没有意义了。
* */
var GameRemote = function(app) {
	this.app = app;
	this.channelService = app.get('channelService');
	this.rooms = {};
};

var remote = GameRemote.prototype;

/**
 * Add user into game channel.
 * 游戏开始是要创建房间，创建玩家，创建频道；这些对象是根据session创建的。
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param roomId 房间号
 * @param {boolean} flag channel parameter
 * @param cb
 */
remote.add = function(uid, sid, roomId, flag, cb) {
	var code = 500;

	// 在这里玩家对象应该与链接session是解耦的，玩家对象在加入房间时创建，在退出房间时释放。
	var currentPlayer = new MJPlayer(uid);

	//创建或者获取room对象,如果没有room对象,而且是创建房间则创建Room
	var room = this.rooms[roomId];
	if(!room && !!flag) {
		room = this.rooms[roomId] = new MJRoom(roomId);
		room.owner = currentPlayer;
	}

	//创建或获取channel对象
	var channel = this.channelService.getChannel(roomId, flag);

	//如果创建对象或者获取对象失败，返回失败code
	if(!room || !channel){
		rpcLogger.error("-- 创建房间或者频道失败！");
		code = 500;
		cb(this.get(roomId, flag), code, roomId);

		return false;
	} else if(room.getPlayer(uid)){
		rpcLogger.error("-- 房间玩家列表出错！");
		code = 500;
		cb(this.get(roomId, flag), code, roomId);

		return false;
	}

	//初始化player、channel和room对象
	channel.add(uid, sid);
	room.addPlayer(currentPlayer, channel, flag, function (flag) { code = flag; });

	var pos = room.getPlayer(uid).getPlayerPosition();
	//向客户端广播登录的用户
	var param = { route: 'onAdd', user: {uid: uid, position: pos }};
	channel.pushMessage(param);

	// 回调函数，response客户端，把相关数据传递回去。

	var allPlayers = room.getMembers();
	var othersPlayer = [];

	for(var i = 0; i < allPlayers.length; i++){
		if(allPlayers[i].uid !== uid){
			othersPlayer.push({ uid: allPlayers[i].uid, position: allPlayers[i].position});
		}
	}

	cb(code, roomId,{uid: uid, position: pos}, othersPlayer);
};

/**
 * 获取房间中的人数
 */
remote.getNumberOfPlayer = function(roomId, cb){
	var room = this.rooms[roomId];

	if(room){
		cb(room.roomId, room.userAmount);
	}else {
		cb(roomId, 0);
	}
};

/**
 * 获取房间
 **/
remote.getRoomById = function(roomId){
	return this.rooms[roomId];
};

/**
 * 获取两个骰子的点数
 **/
remote.getTwoDiceNumber = function(uid, roomId, cb){
	var room = this.rooms[roomId];

	if(!room){
		rpcLogger.error("房间出错.");
		cb(false);
		return false;
	}

	var num1 = random.RandomNumBoth(1, 6);
	var num2 = random.RandomNumBoth(1, 6);

	var param = {route: 'onDiceNumber', msg: {number1: num1, number2: num2}};
	room.channel.pushMessage(param);

	cb(true, {number1: num1, number2: num2});
};

/**
 * 解散房间
 */
remote.disbandRoomById = function(uid, roomId, cb){
	var room = this.rooms[roomId];

	if(!!room && room.owner.uid === uid){
		var param = {route: 'onDisbandRoom', msg: uid + " disband room " + roomId, ownerUid: uid};
		room.channel.pushMessage(param);

		room.channel.destroy();
		room.channel = null;
		for(var key in room.players){
			if(room.players.hasOwnProperty(key)){
				room.players[key] = null;
				delete room.players[key];
			}
		}

		this.rooms[roomId] = null;
		delete this.rooms[roomId];
		cb(200);
	} else {
		cb(500);
		rpcLogger.error("player %s disband room %s error!", uid, roomId);
	}
};
/**
 * 返回游戏大厅
 **/
remote.returnToHall = function(uid, roomId, cb){
	var room = this.rooms[roomId];

	var param = {route: 'onReturnToHall', msg: uid + " return to hall from room " + roomId, uid: uid};
	room.channel.pushMessage(param);

	if(!!room && !!(room.players[uid]) && (room.owner.uid !== uid)){
		room.players[uid] = null;
		delete  room.players[uid];

		cb(200);
	}else {
		cb(500);
		rpcLogger.error("Player %s in room %s return to the hall error.", uid, roomId);
	}
};
/**
 * 准备游戏
 **/
remote.readyForTheGame = function(uid, roomId, cb){
	var room = this.rooms[roomId];
	var player = room.players[uid];
	var count = 0;

	if(!room || !player){
		rpcLogger.error("user %s in room %s be ready for the game error!", uid, roomId);
		count = -1;
		cb(count);
		return false;
	}

	if(player.readyForGameFlag){
		rpcLogger.error("user %s ready for game flag error!", uid);
		cb(count);
		return;
	}

	player.readyForGameFlag = true;

	for(var key in room.players){
		if(room.players.hasOwnProperty(key)){
			if(room.players[key].readyForGameFlag === true){
				count++;
			}
		}
	}
	cb(count);

	if(count === 3){
		var num1 = random.RandomNumBoth(1, 6);
		var num2 = random.RandomNumBoth(1, 6);
		var tiles = random.shuffleTiles();
		rpcLogger.info("-- 洗牌 tiles: %j", tiles);
		room.setTiles(tiles, this.channelService);

		var dealerId = room.getDealer().uid;
		rpcLogger.debug("-- get dealer id: %s",dealerId);

		var param = {route: "onReadyForGame", msg: " the game is ready.", number: {number1: num1, number2: num2}, dealer: dealerId};
		room.channel.pushMessage(param);

		room.setDices(num1, num2);
	}



};

/**
 * 洗牌
 **/
remote.initMJs = function(uid, roomId, cb){
	var room = this.rooms[roomId];
	var player = room.players[uid];

	var tiles = random.shuffleTiles();
	rpcLogger.info("tiles: %j", tiles);

	room.setTiles(tiles);

};

/**
 * 同步麻将牌
 **/
remote.synchronousTiles = function(tiles, uid, roomId, cb){
	var room = this.rooms[roomId];
	var player = room.players[uid];

	player.tiles = player.bambooTiles.concat(player.dotTiles.concat(player.dragonTiles));
	var tmpTiles = player.tiles;
	var hasFlag;

	for(var i = 0; i < tiles.length; i++){
		hasFlag = false;

		for(var j = 0; j < tmpTiles.length; j++){
			if(tiles[i] === tmpTiles[j]){
				hasFlag = true;
				tmpTiles.splice(j, 1);

				break;
			}
		}

		if(!hasFlag)
			break;
	}

	cb(hasFlag);
};

/**
 * 取牌
 **/
remote.giveTiles = function(uid, roomId, cb){
	var room = this.rooms[roomId];
	var player = room.players[uid];

	var tile = room.tiles.shift();
	rpcLogger.debug("-- give(). give tile: %s, room tiles: %s", tile, room.tiles);
	if(tile){
		cb(tile);
	}else {
		rpcLogger.error("give tile error.")
	}

};
/**
 * 出牌
 **/
remote.playTiles = function(uid, roomId, tile, cb){
	//判断是否是刚刚拿的牌，如果是广播给整个房间；否则将刚刚拿到的牌插入玩家所有的牌中并将玩家打出的
	// 牌删除，并广播给所有玩家
    var room = this.rooms[roomId];
    var player = room.players[uid];

    var param = {route: "playTile", tile: tile, player: uid};
    room.channel.pushMessage(param);

};

/**
 * Get user from game channel.
 *
 * @param {Object} opts parameters for request
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 * @return {Array} users uids in channel
 *
 */
remote.get = function(name, flag) {
	var users = [];
	var channel = this.channelService.getChannel(name, flag);
	if( !! channel) {
		users = channel.getMembers();
	}
	for(var i = 0; i < users.length; i++) {
		users[i] = users[i];
	}
	return users;
};

/**
 * Kick user out game channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 *
 */
remote.kick = function(uid, sid, name, cb) {
	var channel = this.channelService.getChannel(name, false);

	var username = uid;
	var param = {
		route: 'onLeave',
		user: username
	};

	// leave channel
	if( !! channel) {
		channel.leave(uid, sid);
		channel.pushMessage(param);
	}
	cb();
};

/*-------------------------------房间的构造函数-------------------------------*/
/**
 * 麻将房间
 * 麻将房间保存同一个房间中些逻辑运算
 *
 * @class MJRoom
 * @constructor
 */
var MJRoom = function(id) {
	this.roomId = id;
	this.channel = null;
	this.players = {};
	this.userAmount =0;
	this.owner = null;
	this.dices = {};
	this.tiles = [];
	this.playerToken = null;
	this.playerArray = [];
	this.dealer = null;
};

/**
 * 获取庄家
 **/
MJRoom.prototype.getDealer = function(){
	if(!this.dealer) {
		this.dealer = this.owner;
	}

	return this.dealer;
};

/**
 * 像房间添加用户
 *
 * @param {Object} player current player
 * @param {Object} channel  the channel of current room
 * @param {boolean} flag  the flag of create symbol
 */
MJRoom.prototype.addPlayer = function(player, channel, flag, cb) {
	var self = this;

	if(flag && !this.channel && !this.players[player.uid]){
		// 新房间添加用户的条件，flag为true，房间的玩家列表中没有当前玩家，房间中没有频道
		this.channel = channel;
		this.players[player.uid] = player;
		player.room = self;
	} else if(!flag && (this.channel === channel)&& !this.players[player.uid]){
		// 向现有房间中添加玩家，房间的频道与查询的频道一致，房间中没有当前玩家
		this.players[player.uid] = player;
		player.room = self;
	} else {
		rpcLogger.error("-- 向房间添加用户出错。flag = %s, room id = %s, player = %j, channel = %j",
			flag, this.roomId, player, channel);

		cb(500);
		return false;
	}

	if(this.userAmount === 0){
		this.playerToken = player;
	}else if(this.userAmount === 2){
		this.playerToken.nextPlayer = player;
		this.playerToken = player;
		this.playerToken.nextPlayer = this.owner;
	}else{
		this.playerToken.nextPlayer = player;
		this.playerToken = player;
	}

	this.playerArray.push(player);

	this.userAmount++;
	player.setPlayerPosition(this.userAmount);

	cb(200);
};
/***
 * 按uid获取房间中的用户
* */
MJRoom.prototype.getPlayer = function(uid) {

	return this.players[uid];
};
/**
* 返回房间中的所有玩家，返回格式为数组
**/
MJRoom.prototype.getMembers = function () {
	var allPlayers = [];

	for(var uid in this.players) {
		if(this.players.hasOwnProperty(uid)){
			allPlayers.push(this.players[uid]);
		}
	}

	return allPlayers;
};

/**
 * 将洗好的牌放到房间中
 **/
MJRoom.prototype.setTiles = function (tiles, channelService) {
	this.tiles = tiles;

	for (var j = 0; j < 3; j++){
		for (var i = 0; i < 3; i++) {
			var tmp = this.tiles.splice(0,4);
			this.playerArray[i].tiles = this.playerArray[i].tiles.concat(tmp);
		}
	}

	for(var k = 0; k < 3; k++){
		var tmp = this.tiles.shift();
		this.playerArray[k].tiles.push(tmp);
	}

	for(var i = 0; i < 3; i++){
		rpcLogger.debug("player %s tiles %s.", this.playerArray[i].uid, this.playerArray[i].tiles);
	}

	for(var i = 0; i < 3; i++){
		var param = {route: 'onTiles',msg: this.playerArray[i].tiles, target: this.playerArray[i].uid};

		var tuid = this.playerArray[i].uid;
		var tsid = this.channel.getMember(tuid)['sid'];

		rpcLogger.debug("-- server %s player %s tiles: %s", tsid, tuid, this.playerArray[i].tiles);

		channelService.pushMessageByUids(param, [{  uid: tuid,  sid: tsid }]);

		this.playerArray[i].sortTiles();
	}
};

/**
 * 将骰子数输入到房间中。
 **/
MJRoom.prototype.setDices = function (num1, num2) {
	this.dices.first = num1;
	this.dices.second = num2;
};


/*-------------------------------Player的构造函数-------------------------------*/
/**
 * 玩家对象
 * 主要保存玩家的相关数据和一些逻辑运算
 *
 * @class MJPlayer
 * @constructor
 */
var MJPlayer = function(name) {
	this.uid = name;
	this.index = 0;
	this.room = null;
	this.position = 0;
	this.readyForGameFlag = false;
	this.nextPlayer = null;
	this.tiles = [];
	this.bambooTiles = [];
	this.dotTiles = [];
	this.dragonTiles = [];
};

MJPlayer.prototype.setPlayerPosition = function(position){
	this.position = position;
};

MJPlayer.prototype.getPlayerPosition = function(){
	return this.position;
};

MJPlayer.prototype.sortTiles = function () {
	var tiles = this.tiles;

	for (var i = 0; i < tiles.length; i++) {
		if (Math.floor(tiles[i] / 100) === 1) {
			this.bambooTiles.push(tiles[i]);
		} else if (Math.floor(tiles[i] / 100) === 3) {
			this.dotTiles.push(tiles[i]);
		} else if (Math.floor(tiles[i] / 100) === 5) {
			this.dragonTiles.push(tiles[i]);
		} else {
			return false;
		}
	}

	this.bambooTiles = sortTiles(this.bambooTiles);
	rpcLogger.debug("-- MJPlayer.sortTiles bambooTiles : %s", this.bambooTiles );

	this.dotTiles = sortTiles(this.dotTiles);
	rpcLogger.debug("-- MJPlayer.sortTiles dotTiles : %s", this.dotTiles );

	this.dragonTiles = sortTiles(this.dragonTiles);
	rpcLogger.debug("-- MJPlayer.sortTiles dragonTiles : %s", this.dragonTiles );

};

function sortTiles(tiles) {
	var len = tiles.length;

	for(var i = 0; i < len - 1; i++){
		for (var j = 0; j < len - 1 - i; j++) {
			if(tiles[j] % 10 > tiles[j+1] % 10){
				var tmp = tiles[j+1];
				tiles[j+1] = tiles[j];
				tiles[j] = tmp;
			}
		}
	}
	return tiles;
}