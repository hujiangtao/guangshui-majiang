var MY_SEAT = 0;
var LEFT_SEAT = 1;
var RIGHT_SEAT = 2;
var FRONT_SEAT = 3;

/**----------------------------------------------------------------
 * 游戏准备层
 * 创建房间后等待其他人进入房间以及游戏开始的层
 * 在等待过程中可以聊天，以及相应的返回大厅和解散游戏的按钮。
 ----------------------------------------------------------------**/
var PrepareGameLayer = cc.Layer.extend({
    currentPlayer: null,
    room: null,
    pomeloListener: null,
    lyrCurrentPlayer: null,
    lyrUpPlayer: null,
    lyrDownPlayer: null,
    
    ctor: function(){
        this._super();

        var controller = window.k1controller;
        this.currentPlayer = controller.getCurrentPlayer();
        this.room = this.currentPlayer.room;

        this.addPrepareEvent();
    },
    
    onEnter: function(){
        this._super();

        var btnReturnToHallPng = cc.spriteFrameCache.getSpriteFrame("btn_back_sala.png");
        var btnDisbandRoomPng = cc.spriteFrameCache.getSpriteFrame("btn_dismiss_room.png");
        var btnReadyPng = cc.spriteFrameCache.getSpriteFrame("btn_ready.png");

        //返回大厅
        var returnToHallItem = new cc.MenuItemImage(btnReturnToHallPng, btnReturnToHallPng, this.onClickBtnReturnToHall, this);
        var btnReturnToHall = new cc.Menu(returnToHallItem);
        btnReturnToHall.attr({ x: this.width - 160, y: 160 });
        this.addChild(btnReturnToHall, 1);

        //解散房间
        var disbandRoomItem = new cc.MenuItemImage(btnDisbandRoomPng, btnDisbandRoomPng, this.onClickBtnDisbandRoom, this);
        var btnDisbandRoom = new cc.Menu(disbandRoomItem);
        btnDisbandRoom.attr({x: this.width - 160, y: 80});
        this.addChild(btnDisbandRoom, 1);

        //准备按钮。点击准备按钮，进入等待进入游戏，当所有玩家都点击准备按钮后，进入游戏层。
        var btnReadyItem = new cc.MenuItemImage(btnReadyPng, btnReadyPng, this.onClickBtnReady, this);
        var btnReady = new cc.Menu(btnReadyItem);
        btnReady.attr({x: this.width / 2, y: this.height / 2});
        this.addChild(btnReady, 1);

        /**-----------------------------------------------------**/

        //Player图标
        this.lyrCurrentPlayer = new gamePlayerLayer();
        this.lyrCurrentPlayer.attr({ width: 100, height: 100, x: this.width / 3, y: 100 });
        this.lyrCurrentPlayer.setSeatPosition(MY_SEAT);

        this.lyrUpPlayer = new gamePlayerLayer();
        this.lyrUpPlayer.attr({ width: 100, height: 100, x: 80, y: this.height / 2 });
        this.lyrUpPlayer.setSeatPosition(LEFT_SEAT);

        this.lyrDownPlayer = new gamePlayerLayer();
        this.lyrDownPlayer.attr({ width: 100, height: 100, x: this.width - 180, y: this.height / 2 });
        this.lyrDownPlayer.setSeatPosition(RIGHT_SEAT);

        //向layer中添加图标
        this.lyrCurrentPlayer.setPlayer(this.currentPlayer);
        this.addChild(this.lyrCurrentPlayer, 1);

        if(this.room.players["up"]){
            this.lyrUpPlayer.setPlayer(this.room.players["up"]);
            this.addChild(this.lyrUpPlayer, 1);
        }

        if(this.room.players["down"]){
            this.lyrDownPlayer.setPlayer(this.room.players["down"]);
            this.addChild(this.lyrDownPlayer, 1);
        }

    },

    onRemoveFromParent: function(){
        var self = this;

        self.removeFromParent();
    },


    //TODO:返回大厅，此处只能非创建者点击调用。
    onClickBtnReturnToHall: function () {
        this.currentPlayer.returnToHall(function (isReturnToHall) {

        });

    },
    //TODO:解散房间：此处只能创建者点击。
    onClickBtnDisbandRoom: function () {
        this.currentPlayer.disbandRoom(function (isDisbandRoom) {

        });
    },

    //TODO:
    onClickBtnReady: function () {
        this.currentPlayer.readyForGame(function (isReadyForGame) {

        });
    },


    addPrepareEvent: function(){
        var self = this;

        var addPlayerLayer = function (player) {
            if(player.position === "up"){
                self.lyrUpPlayer.setPlayer(player);
                self.addChild(self.lyrUpPlayer);
            }else if(player.position === "down"){
                self.lyrDownPlayer.setPlayer(player);
                self.addChild(self.lyrDownPlayer);
            }else {
                return false;
            }
        };

        this.room.addViewEvent("addPlayerLayer", addPlayerLayer);

        var removePlayerLayer = function(player){
            if(player.position === "up"){
                self.lyrUpPlayer.deletePlayer();
                self.removeChild(self.lyrUpPlayer);
            }else if(player.position === "down"){
                self.lyrDownPlayer.deletePlayer();
                self.removeChild(self.lyrDownPlayer);
            }else {
                return false;
            }
        };

        this.room.addViewEvent("removePlayerLayer", removePlayerLayer);
    }

});