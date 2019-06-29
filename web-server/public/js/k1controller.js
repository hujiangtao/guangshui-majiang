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

    /*-----------------------------------------------------------------------*
    * Tiles()
    * Player所有的麻将牌
    * -----------------------------------------------------------------------*/
    function Tiles() {
        this.indexTiles = [];
        this.shou = null;
    }

    //初始化手牌链表
    Tiles.prototype.initTiles = function (tiles) {
        for(var i = 0; i < tiles.length; i++){
            this.indexTiles.push(new Majiang(tiles[i], i));
        }

        this.shou = new TilesList();
        for(var j = 0; j < this.indexTiles.length; j++){
            this.shou.insertNode(this.indexTiles[j]);
        }
    };

    //将Tiles的手牌链表的麻将牌的position按照位置更新新值。
    Tiles.prototype.sortTiles = function () {
        //更改麻将的位置.
        var pos = 0;
        var currentNode = this.shou.header;

        do {
            for(var k = 0, len = currentNode.tiles.length; k < len; k++){
                currentNode.tiles[k].changePosition(pos, true);
                pos += 1;
                console.log("sort " + currentNode.tiles[k].id + " new pos is " + currentNode.tiles[k].postion);
            }
            currentNode = currentNode.next;
        }while (currentNode !== null);

    };

    /*-----------------------------------------------------------------------*
    * 手牌的数据结构: 有序链表
    * 
    * -----------------------------------------------------------------------*/    
    function TilesList() {
        this.header = null;
        this.end = null;
        this.length = 0;
        this.pointer = null;
        this.expandStartPointer = null;
        this.expandEndPointer = null;

        this.expandNode = null;
        this.listTilesType = [];           //牌型
    }

    //向链表中添加节点
    TilesList.prototype.insertNode = function (tile) {
        if(this.header === null && this.end === null){
            this.header = this.end = new NodeOfTilesList(tile.points, tile.suitIndex);
            this.header.setTile(tile);
            this.length += 1;

            return;
        }

        if(comparePosition(tile, this.header) === "front"){
            var newHeader = new NodeOfTilesList(tile.points, tile.suitIndex);
            newHeader.setTile(tile);

            this.header.top = newHeader;
            newHeader.next = this.header;
            this.header = newHeader;
            this.length += 1;

            return;
        }

        if(comparePosition(tile, this.end) === "behind"){
            var newEnd = new NodeOfTilesList(tile.points, tile.suitIndex);
            newEnd.setTile(tile);

            this.end.next = newEnd;
            newEnd.top = this.end;
            this.end = newEnd;
            this.length += 1;

            return;
        }

        var tmpNode = this.header;
        do{
            switch (comparePosition(tile, tmpNode)) {
                case "current":
                    tmpNode.setTile(tile);
                    this.length += 1;
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
                    this.length += 1;
                    return;
                default:
                    break;
            }

        }while (this.length < 13);

    };

    //判断麻将牌应该与指定节点的位置关系
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

    TilesList.prototype.traverseType = function(){
        var traverseList = new TilesList();
        var tmpNode = this.header;
        var currentNode = null;

        while (tmpNode !== null){
            if(currentNode === null){
                currentNode = new NodeOfTilesList(tmpNode.points, tmpNode.suitIndex);
                currentNode.tiles = tmpNode.tiles;

                traverseList.header = currentNode;
            }else {
                currentNode.next = new NodeOfTilesList(tmpNode.points, tmpNode.suitIndex);
                currentNode.next.tiles = tmpNode.tiles;

                currentNode.next.top = currentNode;

                currentNode = currentNode.next;
            }

            tmpNode = tmpNode.next;
            if(tmpNode === null){
                traverseList.end = currentNode;
            }
        }

        while (traverseList.header.status !== "end"){
            if(traverseList.header.status === "init"){
                traverseList.expandStartPointer = traverseList.expandEndPointer = traverseList.header;
            }

            traverseList.expandStartPointer.expand(traverseList);

            if(matchingTypes(traverseList) && traverseList.expandEndPointer.next !== null){
                movePointer(traverseList, "next");
            }else if(matchingTypes(traverseList) && traverseList.expandEndPointer.next == null){
                return true;
            }else {
                if(traverseList.expandStartPointer.status === "end"){
                    movePointer(traverseList, "top");
                }
            }

        }

    };

    var movePointer = function (list, direction) {
        if(direction === "top"){
            var tmpNode = list.expandStartPointer.top;
            list.expandEndPointer = list.expandStartPointer.top;

            while (tmpNode.top.suitIndex === list.expandEndPointer.suitIndex
            && tmpNode.top.points === list.expandEndPointer.points){
                tmpNode = tmpNode.top;
            }
        }else {
            var tmpNode = list.expandEndPointer.next;
            list.expandStartPointer = list.expandEndPointer.next;

            while (tmpNode.next.suitIndex === list.expandStartPointer.suitIndex
            && tmpNode.next.points === list.expandStartPointer.points){
                tmpNode = tmpNode.next;
            }

            list.expandEndPointer = tmpNode;
        }

    };

    /**匹配函数------------------------------------------------------------------**/

    var matchingTypes = function(list){
        var listType = new TilesType();
        var isProbable = false;

        var tmpNode = list.expandEndPointer;
        while (tmpNode !== null){
            switch (tmpNode.type) {
                case "si":
                    listType.si.push(tmpNode);
                    break;
                case "ke":
                    listType.ke.push(tmpNode);
                    break;
                case "dui":
                    listType.dui.push(tmpNode);
                    break;
                case "shun":
                    listType.shun.push(tmpNode);
                    break;
                case "dan":
                    listType.dan.push(tmpNode);
                    break;
                default:
                    break;
            }
            tmpNode = tmpNode.top;
        }

        if(listType.si.length === 1){//拢七对
            if(listType.dan.length <= 1 && listType.ke.length === 0 && listType.shun.length === 0){
                isProbable = true;
            }
        }else if(listType.si.length === 0){
            if(listType.dan.length <= 1 && listType.ke.length === 0 && listType.shun.length === 0){//七对
                isProbable = true;
            }else if(listType.dan.length <= 1 && listType.dui.length === 0){//差将
                isProbable = true;
            }else if(listType.dan.length === 0 && listType.dui.length <= 2){//差刻
                isProbable = true;
            }else if(listType.dan.length === 2 && listType.dui.length <= 1
                && listType.dan[0].suitIndex === listType.dan[1].suitIndex){//差顺
                if(Math.abs(listType.dan[0] - listType.dan[1]) <= 2 && listType.dan[0] !== listType.dan){
                    isProbable = true;
                }
            }
        }
    };

    /*-----------------------------------------------------------------------*
    * 牌型。
    *
    * -----------------------------------------------------------------------*/
    function TilesType() {
        this.si = [];           //杠
        this.ke = [];           //刻
        this.shun = [];         //顺
        this.dui = [];          //对
        this.dan = [];          //单
    }


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
        this.type = null;
        this.status = "init";                   //init, expand, reset, end

        this.count = 0;                         //实际count
        this.currentCount = 0;                  //被前面的顺子占用后的count
        this.expandCount = 0;                   //展开一个step后的count
        this.expandFlag = "ready";              //"ready","run","end".
        this.step = 1;
        this.tType = new TilesType();
    }

    //向节点中添加麻将牌对象
    NodeOfTilesList.prototype.setTile = function (tile) {
        this.tiles.push(tile);
        this.count += 1;
    };

    //从节点中移除麻将牌对象
    NodeOfTilesList.prototype.removeTile = function (tile) {
        for(var i = 0; i < this.tiles.length; i++){
            if(this.tiles[i].id === tile.id){
                this.count -= 1;
                return this.tiles.splice(i, 1);
            }
        }

        return false;
    };

    NodeOfTilesList.prototype.expand = function(traverseList) {
        if(this.status === "init"){
            compareTileType(traverseList.expandStartPointer, traverseList);
            this.status = "expand";
        }else if(this.status === "expand"){
            if(this.count === 1){                           //展开顺子
                expandShunzi(traverseList);
            }else if(this.count - this.step <= 0){          //判断能不能继续展开,如果不能继续展开
                resetNode(traverseList);                    //reset展开项
                this.step += 1;                             //增加step

                if(this.step > (this.count - this.step)){   //判断step能否增加,不能增加则展开结束
                    this.status = "end";
                    this.step = 1;
                }else {                     //step能增加,展开
                    expandNode(traverseList);
                }
            }else {                         //能继续展开
                expandNode(traverseList);
            }
        }
    };

    var expandShunzi = function (list) {
        var tmpNode = list.expandEndPointer;

        while (tmpNode.top.points === list.expandStartPointer.points
        && tmpNode.top.suitIndex === list.expandStartPointer.suitIndex) {
            if(tmpNode.type === "shun"){
                var i = 0;
                while (i < 2){
                    var tmpTile = tmpNode.tiles.pop();
                    i += 1;

                    if(tmpTile.suitIndex === list.expandEndPointer.next.suitIndex
                        && tmpTile.points === list.expandEndPointer.next.points){

                        list.expandEndPointer.next.tiles.push(tmpTile);
                        list.expandEndPointer.next.count += 1;
                    }else if(tmpTile.suitIndex === list.expandEndPointer.next.next.suitIndex
                        && tmpTile.points === list.expandEndPointer.next.next.points){

                        list.expandEndPointer.next.next.push(tmpTile);
                        list.expandEndPointer.next.next.count += 1;
                    }else {
                        console.log("expand shunzi error!");
                    }
                }
                return;
            }

            tmpNode = tmpNode.top;
        }

    };

    var expandNode = function (list) {
        list.expandEndPointer.next.top = new NodeOfTilesList(list.expandStartPointer.points, list.expandStartPointer.suitIndex);
        list.expandEndPointer.next.top.next = list.expandEndPointer.next;
        list.expandEndPointer.next = list.expandEndPointer.next.top;
        list.expandEndPointer.next.top = list.expandEndPointer;
        list.expandEndPointer = list.expandEndPointer.next;

        var i = 0;
        while (i < list.expandStartPointer.step) {
            list.expandEndPointer.tiles.push(list.expandStartPointer.tiles.pop());
            i += 1;
            list.expandEndPointer.count += 1;
            list.expandStartPointer.count -= 1;
        }

        compareTileType(list.expandStartPointer, list);
        compareTileType(list.expandEndPointer, list);
    };

    var compareTileType = function (node, list) {
        switch (node.count) {
            case 4:
                node.type = "si";
                break;
            case 3:
                node.type = "ke";
                break;
            case 2:
                node.type = "dui";
                break;
            case 1:
                node.type = compareShunzi(list);
                if(node.type === "shun"){
                    composeShunzi(list);
                }
                break;
            default:
                break;
        }
    };

    var resetNode = function (list) {
        while (list.expandEndPointer.top.points === list.expandStartPointer.points
        && list.expandEndPointer.top.suitIndex === list.expandStartPointer.suitIndex){
            var i = 0;
            while (i < list.expandStartPointer.step){
                list.expandStartPointer.tiles.push(list.expandEndPointer.tiles.pop());
                i += 1;
                list.expandStartPointer.count += 1;
            }
            list.expandEndPointer.next.top = list.expandEndPointer.top;
            list.expandEndPointer.top.next = list.expandEndPointer.next;
            list.expandEndPointer = list.expandEndPointer.top;

        }

        // list.expandStartPointer.status = "reset";
    };

    //判断比较是否能组成顺子
    var compareShunzi = function(list){
        if(list.expandEndPointer.type === "dan"){
            return "dan";
        }else if(list.expandEndPointer.next === null || list.expandEndPointer.next.next === null){
            return "dan";
        }else if(list.expandEndPointer.suitIndex !== list.expandEndPointer.next.suitIndex
            || list.expandEndPointer.suitIndex !== list.expandEndPointer.next.next.suitIndex){
            return "dan";
        }else if(list.expandEndPointer.next.count === 0 || list.expandEndPointer.next.next.count === 0){
            return "dan";
        }else if(list.expandEndPointer.points + 1 !== list.expandEndPointer.next.points
            || list.expandEndPointer.points + 2 !== list.expandEndPointer.next.next.points){
            return "dan";
        }else {
            return "shun";
        }
    };

    //组成顺子
    var composeShunzi = function(list){
        list.expandEndPointer.tiles.push(list.expandEndPointer.next.tiles.pop());
        list.expandEndPointer.tiles.push(list.expandEndPointer.next.next.tiles.pop());
        list.expandEndPointer.next.count -= 1;
        list.expandEndPointer.next.next.count -= 1;
    };

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

    //向房间中添加视图事件
    Room.prototype.addViewEvent = function(eventName, cb){
        if(!this.viewEvent[eventName]){
            this.viewEvent[eventName]= cb;
        }
    };

    //获取房间id
    Room.prototype.getRoomId = function () {
        return this.roomId;
    };

    //向房间中添加Player对象
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
            console.log("insert player error.")
            return false;
        }
    };

    //注册pomelo Listener
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

        pomelo.on("onTiles", function (data) {
            console.log("onTiles: player " + data.target + ". tiles: " + data.msg);
            var player = self.players["current"];

            if(player.id === data.target){
                player.tiles.initTiles(data.msg);
            }else {
                console.log("onTiles: player error! data.target = " + data.target);
                return false;
            }

        });

    };

    Room.prototype.showTiles = function () {

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
        this.status = "init";
        this.view = null;

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

    //更改麻将牌的位置
    Majiang.prototype.changePosition = function (pos, isInit) {
        if(isInit){
            this.postion = pos;
            this.view.setMJPosition();
        }else {
            this.postion = pos;

            // 通知麻将执行move动作

        }
    };

    /*--------------------------------------返回单例对象--------------------------------------*/
    /*--------------------------------------返回单例对象--------------------------------------*/
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

    };
    return _controller;
})();
