//TODO:有时间将属性设定改为attr({})函数形式，一个个属性赋值太臃肿了。

//创建房间的层
var CreateRoomLayer = cc.Layer.extend({
    btnExitCreateRoomLayer: null,
    btnConfirm: null,
    currentPlayer: null,

    ctor: function(){
        this._super();

        var controller = window.k1controller;
        this.currentPlayer = controller.getCurrentPlayer();
    },

    onEnter: function () {
        this._super();

        cc.spriteFrameCache.addSpriteFrames(res.setting_plist);
        var createRoomBgPng = cc.spriteFrameCache.getSpriteFrame("setting8.png");
        var createRoomExitPng = cc.spriteFrameCache.getSpriteFrame("setting1.png");

        var createRoomBgSprite = new cc.Scale9Sprite(createRoomBgPng, cc.rect(100, 100, 100, 100));
        createRoomBgSprite.attr({ x: this.width / 2, y: this.height / 2, width: 1230, height: 670})
        this.addChild(createRoomBgSprite, 3);

        var createRoomTitleSprite = new cc.Sprite(res.PopupScene8_png);
        createRoomTitleSprite.x = this.width / 2;
        createRoomTitleSprite.y = this.height - 70;
        this.addChild(createRoomTitleSprite, 3);

        //退出
        var exitTheCreationRoomBtnItem = new cc.MenuItemImage(createRoomExitPng, createRoomExitPng,
            this.onClickBtnExitCreateRoomLayer, this);
        var exitTheCreationRoomBtn = new cc.Menu(exitTheCreationRoomBtnItem);
        exitTheCreationRoomBtn.x = 1230;
        exitTheCreationRoomBtn.y = this.height - 60;
        this.addChild(exitTheCreationRoomBtn, 3);

        //选择游戏
        var selectBtnItem = new cc.MenuItemImage(
            res.creatroom2_png,
            res.creatroom2_png,
            function(){ cc.log("Select botton.")    },
            this
        );
        var selectBtn = new cc.Menu(selectBtnItem);
        selectBtn.x = 150;
        selectBtn.y = this.height - 150;
        this.addChild(selectBtn, 4);

        var selectLable = new cc.LabelTTF("广水麻将", "雅黑", 30);
        selectLable.x = 150;
        selectLable.y = this.height - 145;
        selectLable.color = cc.color(255, 215, 0);
        this.addChild(selectLable, 4);

        var popupScene5Sprite = new cc.Scale9Sprite(res.PopupScene5_png, cc.rect(25, 25, 25, 25));
        popupScene5Sprite.x = this.width / 2;
        popupScene5Sprite.y = this.height / 2 - 30;
        popupScene5Sprite.width = 1180;
        popupScene5Sprite.height = 432;
        this.addChild(popupScene5Sprite, 3);

        var separationLineSprite1 = new cc.Sprite(res.creatroom18_png);
        separationLineSprite1.x = this.width / 2;
        separationLineSprite1.y = 365;
        this.addChild(separationLineSprite1, 4);

        var separationLineSprite2 = new cc.Sprite(res.creatroom18_png);
        separationLineSprite2.x = this.width / 2;
        separationLineSprite2.y = 425;
        this.addChild(separationLineSprite2, 4);

        var separationLineSprite3 = new cc.Sprite(res.creatroom18_png);
        separationLineSprite3.x = this.width / 2;
        separationLineSprite3.y = 485;
        this.addChild(separationLineSprite3, 4);

        var separationLineSprite4 = new cc.Sprite(res.creatroom18_png);
        separationLineSprite4.x = this.width / 2;
        separationLineSprite4.y = 305;
        this.addChild(separationLineSprite4, 4);

        var separationLineSprite5 = new cc.Sprite(res.creatroom18_png);
        separationLineSprite5.x = this.width / 2;
        separationLineSprite5.y = 245;
        this.addChild(separationLineSprite5, 4);

        //局数
        var NumberOfGamesSprite = new cc.Sprite(res.creatroom9_png);
        NumberOfGamesSprite.x = 190;
        NumberOfGamesSprite.y = 510;
        this.addChild(NumberOfGamesSprite, 4);

        //var NumberOfGamesItem1 = new cc.MenuItemToggle(
        var NumberOfGamesItem1 = new RadioButtonItem(
            new cc.MenuItemImage(res.checkbox_void_png),
            new cc.MenuItemImage(res.checkbox_full_png)
        );

        NumberOfGamesItem1.x = 300;
        NumberOfGamesItem1.y = 510;
        NumberOfGamesItem1.setSelectedIndex(1);
        NumberOfGamesItem1.setCallback(this.onRadioBtnClicked,NumberOfGamesItem1);

        var NumberOfGamesTitle1 = new cc.MenuItemFont("4局");
        NumberOfGamesTitle1.enabled = false;
        NumberOfGamesTitle1.x = 350;
        NumberOfGamesTitle1.y = 505;
        NumberOfGamesTitle1.color = cc.color(139,69,19);

        //var NumberOfGamesItem2 = new cc.MenuItemToggle(
        var NumberOfGamesItem2 = new RadioButtonItem(
            new cc.MenuItemImage(res.checkbox_void_png),
            new cc.MenuItemImage(res.checkbox_full_png)
        );

        NumberOfGamesItem2.x = 470;
        NumberOfGamesItem2.y = 510;
        NumberOfGamesItem2.setCallback(this.onRadioBtnClicked, NumberOfGamesItem2);

        var NumberOfGamesTitle2 = new cc.MenuItemFont("8局");
        NumberOfGamesTitle2.enabled = false;
        NumberOfGamesTitle2.x = 520;
        NumberOfGamesTitle2.y = 505;
        NumberOfGamesTitle2.color = cc.color(139,69,19);

        cc.MenuItemFont.setFontName("宋体");
        cc.MenuItemFont.setFontSize(30);

        //var NumberOfGameMenu = new cc.Menu(NumberOfGamesItem1,NumberOfGamesTitle1,
        var NumberOfGameMenu = new RadioButton(NumberOfGamesItem1,NumberOfGamesTitle1,
            NumberOfGamesItem2, NumberOfGamesTitle2);
        NumberOfGameMenu.x = 0;
        NumberOfGameMenu.y = 0;
        NumberOfGameMenu.markRadioItem([0,2],0);
        this.addChild(NumberOfGameMenu,4);

        //封顶
        var limitOfGamesSprite = new cc.Sprite(res.creatroom19_png);
        limitOfGamesSprite.x = 190;
        limitOfGamesSprite.y = 450;
        this.addChild(limitOfGamesSprite, 4);

        //封顶的Radio按钮
        var limitRadioItem1 = new RadioButtonItem(
            new cc.MenuItemImage(res.checkbox_void_png),
            new cc.MenuItemImage(res.checkbox_full_png)
        );
        limitRadioItem1.x = 300;
        limitRadioItem1.y = 450;
        limitRadioItem1.setSelectedIndex(1);

        var limitRadioItemLabel1 = new cc.MenuItemFont("3番");
        limitRadioItemLabel1.enabled = false;
        limitRadioItemLabel1.x = 350;
        limitRadioItemLabel1.y = 445;
        limitRadioItemLabel1.color = cc.color(139,69,19);

        /****************************************************/
        var limitRadioItem2 = new RadioButtonItem(
            new cc.MenuItemImage(res.checkbox_void_png),
            new cc.MenuItemImage(res.checkbox_full_png)
        );
        limitRadioItem2.x = 470;
        limitRadioItem2.y = 450;

        var limitRadioItemLabel2 = new cc.MenuItemFont("4番");
        limitRadioItemLabel2.enabled = false;
        limitRadioItemLabel2.x = 520;
        limitRadioItemLabel2.y = 445;
        limitRadioItemLabel2.color = cc.color(139,69,19);

        /****************************************************/
        var limitRadioItem3 = new RadioButtonItem(
            new cc.MenuItemImage(res.checkbox_void_png),
            new cc.MenuItemImage(res.checkbox_full_png)
        );
        limitRadioItem3.x = 640;
        limitRadioItem3.y = 450;

        var limitRadioItemLabel3 = new cc.MenuItemFont("5番");
        limitRadioItemLabel3.enabled = false;
        limitRadioItemLabel3.x = 690;
        limitRadioItemLabel3.y = 445;
        limitRadioItemLabel3.color = cc.color(139,69,19);

        var limitRadioButton = new RadioButton(limitRadioItem1, limitRadioItemLabel1, limitRadioItem2,
            limitRadioItemLabel2, limitRadioItem3, limitRadioItemLabel3);
        limitRadioButton.x = 0;
        limitRadioButton.y = 0;
        limitRadioButton.markRadioItem([0,2,4], 0);
        this.addChild(limitRadioButton, 4);

        //玩法
        /****************************************************/
        var rulesOfGamesSprite = new cc.Sprite(res.creatroom15_png);
        rulesOfGamesSprite.x = 190;
        rulesOfGamesSprite.y = 390;
        this.addChild(rulesOfGamesSprite, 4);

        //确定按钮
        var confirmButtonItem = new cc.MenuItemImage(res.PopupScene2_png, res.PopupScene2_down_png,this.onClickBtnConfirm, this);
        var confirmButton = new cc.Menu(confirmButtonItem);
        confirmButton.x = this.width / 2;
        confirmButton.y = 80;
        this.addChild(confirmButton, 4);

        var confirmSprite = new cc.Sprite(res.PopupScene22_png);
        confirmSprite.x = this.width / 2;
        confirmSprite.y = 80;
        this.addChild(confirmSprite, 4);

        return true;
    },

    onClickBtnExitCreateRoomLayer: function(){
        cc.log("exit create room layer.");

        var self = this;
        var parent = self.getParent();

        //重启其他按钮
        parent.btnCreateRoom.setEnabled(true);
        parent.btnJoinRoom.setEnabled(true);

        self.removeFromParent();
    },

    onClickBtnConfirm: function(){
        cc.log("创建房间确认按钮");

        this.currentPlayer.createRoom(function (isCreateRoom) {
            if(isCreateRoom){
                cc.director.runScene(new gameScene());
            }

        });

    },

    onRadioBtnClicked: function(){
        //if(this.getSelectedIndex() == 1){
        //    this.setSelectedIndex(1);
        //}
        cc.log("index is " + this.getRadioItemIndex() + " radio status is " + this.getRadioStatus());
    }
});