/*----------------------------------------------------------------------------*
* K1Controller
* 客户端逻辑相关的都放在此处；view只负责与现实及动作相关
*
* ----------------------------------------------------------------------------*/

var pomelo = window.pomelo;

var queryEntry = function(uid, cb) {
    var route = 'gate.gateHandler.queryEntry';

    pomelo.init({host: window.location.hostname, port: 3014, log: true}, function(){
        pomelo.request(route,{ uid: uid },function(data){
            pomelo.disconnect();
            if(data.code === 500){  return false;  }
            cb(data.host, data.port);
        });
    });
};

window.k1controller = (function () {

    /*-----------------------------------------------------------------------*
    * Player构造函数
    *
    * -----------------------------------------------------------------------*/
    function Player(args) {
        var _args = args || {};

        if(!_args.id){
            return false;
        }

        if(!_args.index && _args.position === "current"){
            this.id = _args.id;
            this.position = "current";
        }else if(_args.index && !_args.position){
            this.id = _args.id;
            this.index = _args.index;

            this.position = calculatePosition(this.index);
        }else {
            return false;
        }

        this.tiles = new Tiles();
        this.addPomeloListener();
    }

    //计算player在当前客户端的位置
    var calculatePosition = function(index){
        if(currentPlayer.index === index){
            console.log("current player error!");
            return false;
        }

        var posFlag = index - currentPlayer.index;
        if( posFlag === -1 || posFlag === 2){
            return "up";
        } else if(posFlag === 1 || posFlag === -2){
            return "down";
        } else {
            console.log("insert player error.");
            return false;
        }
    };

    //set index
    Player.prototype.setIndex = function(index){
        if(this.index && this.index !== index){
            return false;
        }

        this.index = index;
    };

    //当前用户登录
    Player.prototype.login = function (cb) {
        var self = this;

        queryEntry(self.id, function(host, port){
            pomelo.init({host: host, port: port, log: true},function(){
                var route = "connector.entryHandler.enter";

                pomelo.request(route, { username: self.id}, function(data){
                    if(data.code === 500){
                        console.log("create role failed.");
                    }
                    if(data.code === 200){
                        console.log("user " + data.user + " login");
                        cb(true);
                    }
                });
            });
        });
    };

    //当前用户创建房间
    Player.prototype.createRoom = function (cb) {
        var self = this;
        var route = "connector.entryHandler.enterTheRoom";

        pomelo.request(route,{ flag: "create" }, function(data){
            if(data.code === 200){
                console.log("user id is " + data.currentPlayer.uid);
                console.log("user position is " + data.currentPlayer.position);
                console.log("room id is " + data.roomId);

                //TODO:在重构服务端需要注意，这里的position属性需要改成index
                self.setIndex(data.currentPlayer.position);
                self.room = new Room(data.roomId, self);

                self.room.insertPlayer(self);

                cb(true);
            } else {
                console.log("Error! 创建房间失败。");
            }
        });
    };

    //当前用户加入房间
    Player.prototype.joinRoom = function (roomNumber, cb) {
        var self = this;
        var isJoinRoom = false;

        var route = "connector.entryHandler.enterTheRoom";

        pomelo.request(route, { flag: "join", roomId: roomNumber}, function(data){
            if(data.code === 500){
                if(data.msg === undefined){
                    console.log("房间不存在。");
                } else {
                    console.log(data.msg);
                }

            } else if(data.code === 200){
                console.log("current user id: " + data.currentPlayer.uid);
                console.log("current user position: " + data.currentPlayer.position);
                console.log("current user room id : " + data.roomId);

                if(!self.room){
                    self.room = new Room(roomNumber, self);
                    self.setIndex(data.currentPlayer.position);
                    self.room.insertPlayer(self);

                    console.log("other length " + data.otherPlayers.length);
                    for(var i = 0; i < data.otherPlayers.length; i++){
                        console.log("other user "+ i +" id: " + data.otherPlayers[i].uid);
                        console.log("other user "+ i + "position: " + data.otherPlayers[i].position);

                        var player = new Player({id: data.otherPlayers[i].uid, index: data.otherPlayers[i].position});
                        self.room.insertPlayer(player);
                    }

                    cb(true);
                } else {
                    return false;
                }

            }
        });

        return isJoinRoom;
    };

    //当前用户从房间中返回游戏大厅
    Player.prototype.returnToHall = function (cb) {
        var route = "game.gameHandler.returnToHall";

        pomelo.request(route, {}, function (data) {
            if(data.code === 200){
                console.log("return to hall.");
                cb(true);
            }
        });
        cc.log("return to the hall.");

    };

    //当前用户解散房间
    Player.prototype.disbandRoom = function (cb) {
        var route = "game.gameHandler.disbandRoom";

        pomelo.request(route, {}, function (data) {
            if(data.code === 200){
                console.log("code : 200.");

                cb(true);
            } else if (data.code === 500){
                console.log("disband room error.");
            } else {
                console.log("error!!")
            }
        });

        cc.log("disband room.");
    };

    //当前用户登录房间后准备开始游戏
    Player.prototype.readyForGame = function () {
        var isReadyForGame = false;

        var route = "game.gameHandler.readyForGame";
        pomelo.request(route, {}, function (data) {
            if(data.code === 500){
                isReadyForGame = false;
                console.log(data.msg);
            }else if(data.code === 200){
                isReadyForGame = true;

                if(data.flag){
                    //所有player都已经准备好了
                    console.log(data.msg);
                }else {
                    //当前用户准备好了
                    console.log(data.msg);
                }
            }
        });

        return isReadyForGame;
    };

    //当前用户获取进入的房间对象
    Player.prototype.getRoom = function () {
        if(this.room){
            return this.room;
        }else {
            return false;
        }
    };

    //当前用户添加监听器，响应pomelo服务器的指令。
    Player.prototype.addPomeloListener = function () {
        var self = this;

        pomelo.on("onTitles", function (data) {
            console.log("onTitles: player " + data.target + ". titles: " + data.msg);

            if(self.id === data.target){
                self.tiles.initTiles(data.msg);
            }else {
                console.log("onTiles: player error!");
                return false;
            }

        });
    };

    /*-----------------------------------------------------------------------*
    * Player所有的麻将牌
    *
    * -----------------------------------------------------------------------*/
    function Tiles() {
        this.indexTiles = null;
        this.showTiles = null;

        this.shou = null;

    }

    Tiles.prototype.initTiles = function (tiles) {
        this.indexTiles = tiles;

        var initTiles = [];
        for(var i = 0; i < tiles.length; i++){
            initTiles.push(new Majiang(tiles[i], i));
        }

        this.shou = new TilesList();
        while (initTiles.length > 0) {
            this.shou.insertNode(initTiles.shift());
        }

        initTiles = null;
    };

    /*-----------------------------------------------------------------------*
    * 手牌的数据结构: 有序链表
    * 
    * -----------------------------------------------------------------------*/    
    function TilesList() {
        this.header = null;
        this.end = null;
        this.length = 0;
        this.expandNode = null;
        this.listTitlesType = [];           //牌型
    }

    TilesList.prototype.insertNode = function (tile) {
        if(this.header === null && this.end === null){
            this.header = this.end = new NodeOfTilesList(tile.points, tile.suitIndex);
            this.header.setTile(tile);

            return;
        }

        if(comparePosition(tile, this.header) === "front"){
            var newHeader = new NodeOfTilesList(tile.points, tile.suitIndex);
            newHeader.setTile(tile);

            this.header.top = newHeader;
            newHeader.next = this.header;
            this.header = newHeader;

            return;
        }

        if(comparePosition(tile, this.end) === "behind"){
            var newEnd = new NodeOfTilesList(tile.points, tile.suitIndex);
            newEnd.setTile(tile);

            this.end.next = newEnd;
            newEnd.top = this.end;
            this.end = newEnd;

            return;
        }

        var tmpNode = this.header;
        do{
            switch (comparePosition(tile, tmpNode)) {
                case "current":
                    tmpNode.setTile(tile);
                    return;
                case "behind":
                    tmpNode = tmpNode.next;
                    break;
                case "front":
                    var currentNode = new NodeOfTilesList(tile.points, tile.suitIndex);
                    currentNode.setTile(tile);

                    tmpNode.top.next = currentNode;
                    currentNode.top = tmpNode.top;
                    currentNode.next = tmpNode;
                    tmpNode.top = currentNode;

                    return;
                default:
                    break;
            }

        }while (tmpNode !== null);

        return;
    };

    var comparePosition = function (tile, node) {
        if(tile.suitIndex < node.suitIndex){
            return "front";
        }else if(tile.suitIndex > node.suitIndex){
            return "behind";
        }else if(tile.suitIndex === node.suitIndex){
            if(tile.points < node.points){
                return "front";
            }else if(tile.points > node.points){
                return "behind";
            }else if(tile.points === node.points){
                return "current";
            }
        }
    };


    /*-----------------------------------------------------------------------*
    * 有序链表的单元Node对象。
    *
    * -----------------------------------------------------------------------*/
    function NodeOfTilesList(points, suitIndex) {
        this.points = points;
        this.suitIndex = suitIndex;
        this.top = null;
        this.next = null;
        this.tiles = [];                        //同花色同点数的麻将对象.

        this.count = 0;                         //实际count
        this.currentCount = 0;                  //被前面的顺子占用后的count
        this.expandCount = 0;                   //展开一个step后的count
        this.expandFlag = "ready";              //"ready","run","end".
        this.step = 1;
        this.tType = new TitlesType();
    }

    NodeOfTilesList.prototype.setTile = function (tile) {
        this.tiles.push(tile);
        this.count += 1;
    };

    NodeOfTilesList.prototype.removeTile = function (tile) {
        for(var i = 0; i < this.tiles.length; i++){
            if(this.tiles[i].id === tile.id){
                this.count -= 1;
                return this.tiles.splice(i, 1);
            }
        }

        return false;
    };

    /*-----------------------------------------------------------------------*
    * 牌型。
    *
    * -----------------------------------------------------------------------*/
    function TitlesType() {
        this.si = [];           //杠
        this.ke = [];           //刻
        this.shun = [];         //顺
        this.dui = [];          //对
        this.dan = [];          //单
    }

    /*-----------------------------------------------------------------------*
    * Room构造函数
    *
    * -----------------------------------------------------------------------*/
    function Room(id, self) {
        this.roomId = id;
        this.players = {};
        this.dealer = null;
        this.tokenId = null;
        this.players["current"] = self;
        this.viewEvent = {};
        this.diceArray = [];

        this.addPomeloListeners();
    }

    Room.prototype.addViewEvent = function(eventName, cb){
        if(!this.viewEvent[eventName]){
            this.viewEvent[eventName]= cb;
        }
    };

    Room.prototype.getRoomId = function () {
        return this.roomId;
    };

    Room.prototype.insertPlayer = function (player) {
        if(!this.players["current"]){
            console.log("current player error!");
            return false;
        }

        console.log("insert player " + player.id + ", postion is : " + player.position + " , index = " + player.index);

        if(player.position === "up" && !this.players["up"]){
            this.players["up"] = player;
        }else if(player.position === "down" && !this.players["down"]){
            this.players["down"] = player;
        }else {
            return false;
            console.log("insert player error.")
        }
    };

    Room.prototype.addPomeloListeners = function () {
        var self = this;

        pomelo.on('onAdd', function(data) {
            if(currentPlayer.id === data.user.uid){
                console.log("当前用户已经生成。");
                return;
            }

            var player = new Player({id: data.user.uid, index: data.user.position});
            self.insertPlayer(player);

            self.viewEvent["addPlayerLayer"](player);
        });

        pomelo.on("onDisbandRoom", function (data) {
            console.log(data.msg);

            self.viewEvent["runSceneNewHall"]();

            for(var key in self.players){
                self.players[key] = null;
            }

            currentPlayer.room = null;
        });

        pomelo.on("onReturnToHall", function (data) {
            if(currentPlayer.id === data.uid){
                self.viewEvent["runSceneNewHall"]();

                for(var key in self.players){
                    self.players[key] = null;
                }

                currentPlayer.room = null;
            }else{
                for(var key in self.players){
                    if(self.players[key].id === data.uid){
                        self.viewEvent["removePlayerLayer"](self.players[key]);
                    }
                }
            }
        });

        pomelo.on("onReadyForGame",function (data) {
            console.log("dice number: " + data.number);
            // self._readyCallback(data.number, data.dealer);
            for(var key in self.players){
                if(self.players[key].id === data.dealer){
                    self.dealer = self.players[key];
                }
            }

            self.diceArray.push(data.number.number1);
            self.diceArray.push(data.number.number2);

            self.viewEvent["removePrepareGameLayer"]();
        });

    };

    Room.prototype.viewEvent = function () {

    };

    /*-----------------------------------------------------------------------*
    * Hall构造函数
    *
    * -----------------------------------------------------------------------*/
    function Application(args) {
        var _args = args || {};

        this.config = {};
        this.pointX = _args.pointX || 6; //从接收的参数里获取，或者设置为默认值
        this.pointY = _args.pointY || 10;
    }

    /*-----------------------------------------------------------------------*
    * Majiang构造函数
    *
    * -----------------------------------------------------------------------*/
    function Majiang(id, index) {
        this.id = id;
        this.index = index;
        this.postion = index;
        this.points = id % 10;
        this.name = this.points;

        if (Math.floor(id / 100) === 1) {
            this.suit = "bamboo";
            this.suitIndex = 1;
        }else if(Math.floor(id / 100) === 3){
            this.suit = "dot";
            this.suitIndex = 3;
        }else if(Math.floor(id / 100) === 5){
            this.suit = "dragon";
            this.suitIndex = 5;
            if(this.points === 1){
                this.name = "zhong";
            }else if(this.points === 2){
                this.name = "fa";
            }else if(this.points === 3){
                this.name = "bai";
            }
        }
    }


    /*--------------------------------------返回单例对象--------------------------------------*/
    //实例容器
    var currentPlayer, application;
    // var room;

    var _controller = {
        name: 'controller',

        getCurrentPlayer: function (args) {
            if (currentPlayer === undefined) {
                currentPlayer = new Player(args);
            }
            return currentPlayer;
        },

        getApplication: function (args) {
            if (application === undefined) {
                application = new Application(args);
            }
            return application;
        },

        //在前端，房间与当前用户的关系是组合关系，没有必要特别暴露获取房间对象的接口。
        /*getRoom: function (args) {
            if (room === undefined) {
                room = new Room(args);
            }
            return room;
        }*/
    };
    return _controller;
})();
