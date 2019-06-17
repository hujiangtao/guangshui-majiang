//TODO:有时间将属性设定改为attr({})函数形式，一个个属性赋值太臃肿了。

/**
 * 加入房间的按钮点击后弹出加入房间层
 * 这个层弹出后，屏蔽背景层上的相关事件，比如加入房间的按钮和创建房间按钮。
 * 这个层通过点击数字输入房间号
 **/
var JoinRoomLayer = cc.Layer.extend({
    btnExitJoinRoom: null,
    btnConfirm: null,
    currentPlayer: null,
    roomId: 0,
    inputNumberArray: [],

    ctor: function(){
        this._super();

        var controller = window.k1controller;
        this.currentPlayer = controller.getCurrentPlayer();
    },

    onEnter: function(){
        this._super();
        cc.spriteFrameCache.addSpriteFrames(res.setting_plist);
        var joinRoomExitPng = cc.spriteFrameCache.getSpriteFrame("setting1.png");

        var joinRoomBgSprite = new cc.Sprite(res.num_bg_png);
        joinRoomBgSprite.x = this.width/2;
        joinRoomBgSprite.y = this.height/2;
        this.addChild(joinRoomBgSprite, 3);

        var joinRoomTitleSprite = new cc.Sprite(res.PopupScene20_png);
        joinRoomTitleSprite.x = this.width/2;
        joinRoomTitleSprite.y = 605;
        this.addChild(joinRoomTitleSprite, 3);
        /**----------------------------------------------------------------**/

        //关闭按钮
        var joinRoomExitItem = new cc.MenuItemImage(joinRoomExitPng, joinRoomExitPng, this.onClickBtnExitJoinRoomLayer,this);
        var joinRoomExitBtn = new cc.Menu(joinRoomExitItem);
        joinRoomExitBtn.x = this.width/2 + 360;
        joinRoomExitBtn.y = 615;
        this.addChild(joinRoomExitBtn, 3);
        /**----------------------------------------------------------------**/

        var labelOfRoomNumber = new cc.LabelTTF("请输入房间号", "宋体", 36);
        labelOfRoomNumber.x = this.width/2;
        labelOfRoomNumber.y = 520;
        labelOfRoomNumber.color = cc.color(168,33,33);
        this.addChild(labelOfRoomNumber, 3);

        var roomNumberArray = [];
        var roomNumberUnderLine = [];

        for(var i = 0; i < 5; i++){
            roomNumberArray[i] = new cc.LabelTTF("", "Arial", 36);
            roomNumberArray[i].x = this.width/2 + (i - 2)*60;
            roomNumberArray[i].y = 465;
            roomNumberArray[i].color = cc.color(120,20,20);
            this.addChild(roomNumberArray[i], 3);
            roomNumberUnderLine[i] = new cc.LabelTTF("_", "Arial", 36);
            roomNumberUnderLine[i].x = this.width/2 + (i - 2)*60;
            roomNumberUnderLine[i].y = 460;
            roomNumberUnderLine[i].color = cc.color(120,20,20);
            this.addChild(roomNumberUnderLine[i], 3);
        }
        /**----------------------------------------------------------------**/

            //虚拟数字键盘
        var NumberPngArray = [];

        for(var i = 0; i < 12; i++) {
            var pngStr = "num_" + (i + 1) +"_png";
            var pngStrDark = "num_" + (i + 1) +"dark_png";

            NumberPngArray[i] = new cc.MenuItemImage(res[pngStr], res[pngStrDark],
                (function createCallback(logStr, k){
                    if(k < 9){
                        return function(){
                            cc.log("Number " + (k + 1) + " " + logStr);

                            if(this.inputNumberArray.length < 5) {
                                this.inputNumberArray.push(k + 1);
                                for(var j = 0; j < this.inputNumberArray.length; j++){
                                    roomNumberArray[4 - j].setString(this.inputNumberArray[this.inputNumberArray.length - 1 - j]);
                                }
                            }
                        };
                    }else if (k === 10) {
                        return function(){
                            cc.log("Number 0"  + " "+ logStr);
                            if(this.inputNumberArray.length < 5) {
                                this.inputNumberArray.push(0);
                                for(var j = 0; j < this.inputNumberArray.length; j++){
                                    roomNumberArray[4 - j].setString(this.inputNumberArray[this.inputNumberArray.length - 1 - j]);
                                }
                            }
                        };
                    } else if (k === 9) {
                        return function(){
                            cc.log("重输 " + logStr);

                            for(var j = 0; j < this.inputNumberArray.length; j++){
                                roomNumberArray[4 - j].setString("");
                            }
                            this.inputNumberArray.splice(0,this.inputNumberArray.length);
                        };
                    } else if (k === 11) {
                        return function(){
                            cc.log("删除 " + logStr);

                            for(var j = 0; j < this.inputNumberArray.length; j++){
                                roomNumberArray[4 - j].setString("");
                            }
                            this.inputNumberArray.splice(this.inputNumberArray.length - 1, 1);
                            for(var j = 0; j < this.inputNumberArray.length; j++){
                                roomNumberArray[4 - j].setString(this.inputNumberArray[this.inputNumberArray.length - 1 - j]);
                            }
                        };
                    } else {
                        cc.log("error.");
                        return false;
                    }
                })(pngStr, i), this);

            var numIndexX = i % 3;
            var numIndexY = Math.floor(i/3);
            NumberPngArray[i].attr({
                x: 430 + numIndexX * 203,
                y: 380 - numIndexY * 69,
                scaleX: 0.8,scaleY: 0.8
            });
        }

        var NumberKeyboard = new cc.Menu(NumberPngArray);
        NumberKeyboard.x = 0;
        NumberKeyboard.y = 0;
        this.addChild(NumberKeyboard, 3);
        /**----------------------------------------------------------------**/

/*        // this.roomId = roomNumber;
        this.roomId = (function () {
            var roomNumber = 0;

            console.log("inputNumberArray length = " + inputNumberArray.length);

            for(var j = 0; j < inputNumberArray.length; j++){
                roomNumber = roomNumber + inputNumberArray[inputNumberArray.length - 1 - j] * Math.pow(10, j);

                console.log("inputNumberArray[" + j + "] = " + inputNumberArray[j]);
            }

            return roomNumber;
        }());
        console.log("roomNumber = " + this.roomId);*/


        //确定按钮
        var confirmBtnItem = new cc.MenuItemFont("确认", this.onClickBtnConfirm, this);
        confirmBtnItem.setFontName("黑体");
        confirmBtnItem.setFontSize(30);
        confirmBtnItem.color = cc.color(120,20,20);

        var confirmBtn = new cc.Menu(confirmBtnItem);
        confirmBtn.x = this.width/2;
        confirmBtn.y = 110;
        this.addChild(confirmBtn, 3);
    },

    onClickBtnExitJoinRoomLayer: function(){
        cc.log("Exit join Room Layer.");

        var self = this;
        var parent = self.getParent();

        //重启其他按钮
        parent.btnCreateRoom.setEnabled(true);
        parent.btnJoinRoom.setEnabled(true);

        self.removeFromParent();
    },

    onClickBtnConfirm: function(){
        cc.log("加入房间，确定按钮。");

        var roomNumber = 0;
        console.log("inputNumberArray length = " + this.inputNumberArray.length);

        for(var j = 0; j < this.inputNumberArray.length; j++){
            roomNumber = roomNumber + this.inputNumberArray[this.inputNumberArray.length - 1 - j] * Math.pow(10, j);

            console.log("inputNumberArray[" + j + "] = " + this.inputNumberArray[j]);
        }
        console.log("roomNumber = " + roomNumber);

        if(roomNumber === 0){
            return false;
        } else {
            this.currentPlayer.joinRoom(roomNumber, function (isJoinRoom) {
                if(isJoinRoom){
                    cc.director.runScene(new gameScene());
                }
            });
        }
    }
});