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

    Player.prototype.setIndex = function(index){
        if(this.index && this.index !== index){
            return false;
        }

        this.index = index;
    };

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

    var setSeat = function (room, player) {
        if(room === null || player.playerId === currentPlayer.playerId){
            player.seat = "current";
        }else {

        }
    };

    /*-----------------------------------------------------------------------*
    * Room构造函数
    *
    * -----------------------------------------------------------------------*/
    function Room(id, self) {
        this.roomId = id;
        this.players = {};
        this.dealerId = null;
        this.tokenId = null;
        this.players["current"] = self;
        this.viewEvent = {};

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

        pomelo.on("onReturnToHall", function (data) {});
        pomelo.on("onReadyForGame",function (data) {});

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
    function Majiang(args) {
        var args = args || {};

        this.name = 'SingletonTester';
        this.pointX = args.pointX || 6; //从接收的参数里获取，或者设置为默认值
        this.pointY = args.pointY || 10;
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
