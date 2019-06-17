/************   创建角色场景   ************/
var TEXT_INPUT_FONT_NAME = "Thonburi";
var TEXT_INPUT_FONT_SIZE = 34;

var textInputGetRect = function (node) {
    var rc = cc.rect(node.x, node.y, node.width, node.height);

    rc.x -= rc.width / 2;
    rc.y -= rc.height / 2;

    return rc;
};

var controller = window.k1controller;

var CreateRoleLayer = cc.Layer.extend({
    _trackNode: null,

    onEnter: function(){
        this._super();
        this.addInputListener();

        var size = cc.winSize;

        cc.spriteFrameCache.addSpriteFrames(res.public_ui_plist);
        var malePng = cc.spriteFrameCache.getSpriteFrame("sex_male.png");
        var femalePng = cc.spriteFrameCache.getSpriteFrame("sex_female.png");

        cc.spriteFrameCache.addSpriteFrames(res.chat_plist);
        var textFieldBgPng = cc.spriteFrameCache.getSpriteFrame("chat_input_bg.png");

        //添加背景图
        var roleBgSprite = new cc.Sprite(res.createRoleBg_jpg);
        roleBgSprite.attr({ x: size.width / 2, y: size.height / 2 });
        this.addChild(roleBgSprite, 0);


        //创建角色
        var avatarSprite = new cc.Sprite(res.femaleAvatar_png);
        avatarSprite.attr({ x: size.width / 2, y: size.height * 2 / 3, scaleX: 1.6, scaleY: 1.6 });
        this.addChild(avatarSprite, 1);


        //男性图标
        var sexMaleSprite = new cc.Sprite(malePng);
        sexMaleSprite.attr({ x: (size.width *3)/7, y: (size.height*5)/11, scaleX: 1.6, scaleY: 1.6 });
        this.addChild(sexMaleSprite, 1);

        //女性图标
        var sexFemaleSprite = new cc.Sprite(femalePng);
        sexFemaleSprite.attr({ x: (size.width *4)/7, y: (size.height*5)/11, scaleX: 1.6, scaleY: 1.6 });
        this.addChild(sexFemaleSprite, 1);

        //输入框
        var textField = new cc.TextFieldTTF("输入角色名", TEXT_INPUT_FONT_NAME, TEXT_INPUT_FONT_SIZE);
        textField.attr({x: size.width / 2, y: size.height / 3 });
        this.addChild(textField, 1);
        this._trackNode = textField;

        //输入框背景
        var textFieldBg = new cc.Sprite(textFieldBgPng);
        textFieldBg.attr({ x: size.width / 2, y: size.height / 3 });
        this.addChild(textFieldBg, 0);

        //确认按钮
        var confirmBtnItem = new cc.MenuItemImage(
            res.PopupScene2_png,
            res.PopupScene2_down_png,
            function () {
                cc.log("Confirm button is clicked.");

                var textFieldContent = textField.getContentText();
                var currentPlayer = controller.getCurrentPlayer({id: textFieldContent, position: "current"});

                currentPlayer.login(function (isLogin) {
                    if(isLogin === true){
                        cc.director.runScene(new hallScene());
                    }
                });
            },
            this
        );
        confirmBtnItem.attr({ x: size.width / 2, y: size.height / 6 });

        var confirmBtn = new cc.Menu(confirmBtnItem);
        confirmBtn.attr({ x: 0, y: 0 });
        this.addChild(confirmBtn, 1);

        //确认按钮上的文字
        var confirmTxt = new cc.Sprite(res.PopupScene22_png);
        confirmTxt.attr({ x: size.width / 2, y: size.height / 6 });
        this.addChild(confirmTxt, 2);
    },

    /*----------------------------输入框----------------------------*/
    //TODO:输入框应该独立出一个类
    addInputListener: function () {
        if('touches' in cc.sys.capabilities) {
            cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ALL_AT_ONCE,
                onTouchesEnded: this.onTouchesEnded
            }, this);
        } else if('mouse' in cc.sys.capabilities) {
            cc.eventManager.addListener({
                event: cc.EventListener.MOUSE,
                onMouseUp: this.onMouseUp
            }, this);
        }
    },

    onTouchesEnded: function (touches, event) {
        var target = event.getCurrentTarget();
        if(!target._trackNode)
            return;

        if(touches.length === 0)
            return;

        var touch = touches[0];
        var point =touch.getLocation();

        var rect = textInputGetRect(target._trackNode);
        target.onClickTrackNode(cc.rectContainsPoint(rect, point));
    },

    onMouseUp: function (event) {
        var target = event.getCurrentTarget();
        if(!target._trackNode)
            return;

        var point = event.getLocation();

        var rect = textInputGetRect(target._trackNode);
        target.onClickTrackNode(cc.rectContainsPoint(rect, point));
    },

    onClickTrackNode: function (clicked) {
        var textField = this._trackNode;
        if(clicked) {
            textField.attachWithIME();
        } else {
            textField.detachWithIME();
        }
    }

});

var CreateRoleScene = cc.Scene.extend({
    onEnter: function() {
        this._super();

        this.addChild(new CreateRoleLayer());
    }
});