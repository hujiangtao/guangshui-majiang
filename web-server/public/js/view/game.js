/**----------------------------------------------------------------
 * Game基础层
 * 游戏的主界面在此，这个层主要是进入游戏后不会变化的一些元素
 * 包括背景，设置等等……
 ----------------------------------------------------------------**/
var gameLayer = cc.Layer.extend({
    currentPlayer: null,
    lyrPrepareGame: null,
    lyrDiceNumber: null,
    lyrBeginGame: null,

    ctor: function(){
      this._super();

      var controller = window.k1controller;
      this.currentPlayer = controller.getCurrentPlayer();
    },

    onEnter: function(){
        this._super();

        var size = cc.winSize;
        cc.spriteFrameCache.addSpriteFrames(res.play_scene_plist);
        var msgSettingBgPng = cc.spriteFrameCache.getSpriteFrame("msg_set_bg.png");
        var btnMessagePng = cc.spriteFrameCache.getSpriteFrame("btn_message.png");
        var btnSettingPng = cc.spriteFrameCache.getSpriteFrame("btn_setting.png");


        //背景
        var gameBackground = new cc.Sprite(res.game_bg_png);
        gameBackground.x = size.width / 2;
        gameBackground.y = size.height / 2;
        this.addChild(gameBackground, 0);

        //时间
        var timeLabel = new cc.LabelTTF("21:40", "Arial", 25);
        timeLabel.x = 60;
        timeLabel.y = size.height - 40;
        timeLabel.color = cc.color(255,255,0);
        this.addChild(timeLabel, 0);

        //房间号
        var roomNumberTitle = new cc.LabelTTF("房间号", "宋体", 25);
        roomNumberTitle.x = 150;
        roomNumberTitle.y = size.height - 38;
        roomNumberTitle.color = cc.color(0, 184, 118);
        this.addChild(roomNumberTitle, 0);

        var roomNumber = new cc.LabelTTF(this.currentPlayer.room.roomId, "Arial", 25);
        roomNumber.x = 225;
        roomNumber.y = size.height - 40;
        roomNumber.color = cc.color(0, 184, 118);
        this.addChild(roomNumber, 0);

        //玩法
        var gameRules = new cc.LabelTTF("4番封顶 自摸加番 买码", "宋体", 25);
        gameRules.x = size.width / 2;
        gameRules.y = size.height - 30;
        this.addChild(gameRules, 0);

        //延迟
        var delayLabel = new cc.LabelTTF("57ms", "Arial", 25);
        delayLabel.x = size.width - 120;
        delayLabel.y = size.height - 40;
        this.addChild(delayLabel, 0);

        //电池
        var powerZSprite = new cc.Sprite(res.powerZ_png);
        powerZSprite.x = size.width - 45;
        powerZSprite.y = size.height - 40;
        this.addChild(powerZSprite, 0);

        var powerGSprite = new cc.Sprite(res.powerG_png);
        powerGSprite.x = size.width - 43;
        powerGSprite.y = size.height - 38;
        this.addChild(powerGSprite, 0);

        //聊天
        var msgSettingBgSprite = new cc.Sprite(msgSettingBgPng);
        msgSettingBgSprite.x = size.width - 55;
        msgSettingBgSprite.y = size.height - 150;
        msgSettingBgSprite.rotation = 90;
        this.addChild(msgSettingBgSprite, 0);

        var btnSettingItem = new cc.MenuItemImage(btnSettingPng, btnSettingPng, function(){
            cc.log("button setting.")
        }, this);
        var btnSetting = new cc.Menu(btnSettingItem);
        btnSetting.x = size.width - 50;
        btnSetting.y = size.height - 115;
        this.addChild(btnSetting, 0);

        var btnMessageItem = new cc.MenuItemImage(btnMessagePng, btnMessagePng, function(){
            cc.log("button message.")
        }, this);
        var btnMessage = new cc.Menu(btnMessageItem);
        btnMessage.x =  size.width - 50;
        btnMessage.y =  size.height - 190;
        this.addChild(btnMessage, 0);
        /**-----------------------------------------------------**/

        var self = this;
        this.lyrPrepareGame = new PrepareGameLayer();
        this.addChild(this.lyrPrepareGame, 0);

        /*var setDiceNumber = function (data, dealer){
            console.log("dice1: " + data.number1 + "; dice2: " + data.number2);

            var diceNumbersLyr = new DiceNumberLayer();
            diceNumbersLyr.setNumber(data.number1, data.number2);

            var beginGameLyr = new BeginGameLayer();
            beginGameLyr.setDiceNumbersLyr(diceNumbersLyr);

            console.log("data.dealer = " + dealer);
            player.getRoom().setDealer(dealer);

            console.log("dealer id: " + player.getRoom().dealerId);
            // beginGameLyr.setDiceNumbers(data.number1, data.number2);
            self.addChild(beginGameLyr, 0);
        };

        // pomelo.on('onDiceNumber',setDiceNumber);

        prepareGameLyr.setReadyCallback(function(data, dealer){
            //移除准备层，并销毁对象
            self.removeChild(prepareGameLyr);
            prepareGameLyr = null;

            setDiceNumber(data, dealer);

            /!*       //获取骰子
                   var route = "game.gameHandler.getDiceNumber";
                   pomelo.request(route, {}, function (data) {
                       if(data.code === 200){
                           console.log("dice number: " + data.number);
                       }
                   });

                   //生成game层开始游戏*!/

        });*/

    }
});



/**----------------------------------------------------------------
 * Game主场景
 * GameLayer层是游戏的基础层，添加到这个场景中
 ----------------------------------------------------------------**/
var gameScene = cc.Scene.extend({
    onEnter: function(){
        this._super();

        var gameLyr = new gameLayer();
        this.addChild(gameLyr);
/*
        var self = this;
        var disbandRoom = function(self){
            self.removeChild(gameLyr);
            gameLyr = null;
            player.exitRoom();
        };

        pomelo.on('onDisbandRoom', function(data){
            console.log(data.msg);

            disbandRoom(self);
            cc.director.runScene(new hallScene());

        });

        pomelo.on("onReturnToHall", function (data) {
            console.log(data.msg);
            if(player.uid === data.uid){
                //如果是发出返回大厅的玩家id，该客户端返回大厅
                self.removeChild(gameLyr);
                gameLyr = null;
                player.exitRoom();

                cc.director.runScene(new hallScene());
            }


        });

        pomelo.on("onTitles", function (data) {
            console.log("onTitles: player " + data.target + ". titles: " + data.msg);
            player.setTitles(data.msg);
        });*/

    },

    returnToHall: function () {
        cc.director.runScene(new hallScene());
    }
});