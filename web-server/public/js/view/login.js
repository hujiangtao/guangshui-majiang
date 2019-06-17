/**
 * Login层
 * @class
 * @extends cc.Layer
 */
var loginLayer = cc.Layer.extend({
    loginBackground: null,
    logoSprite: null,
    loginBotton: null,

    ctor: function(){
        //init
        this._super();

        var size = cc.winSize;

        //add background
        this.loginBackground = new cc.Sprite(res.loginBackground_png);
        this.loginBackground.attr({ x: size.width / 2, y: size.height / 2 });
        this.addChild(this.loginBackground, 0);

        //add logo
        this.logoSprite = new cc.Sprite(res.logo_png);
        this.logoSprite.attr({ x: size.width / 2,  y: (size.height / 3) * 2 });
        this.addChild(this.logoSprite, 0);

        //登录按钮
        var loginMenuItem = new cc.MenuItemImage(
            res.btnTraveler_png,
            res.btnTravelerPrs_png,
            function(){
                cc.log("menu is clicked.");


                cc.director.runScene(new CreateRoleScene());
            },
            this);
        loginMenuItem.attr({
            x: size.width / 2,
            y: size.height / 4,
            scaleX: 0.8,
            scaleY: 0.8
        });

        var loginMenu = new cc.Menu(loginMenuItem);
        loginMenu.x = 0;
        loginMenu.y = 0;
        this.addChild(loginMenu, 1);

        var checkBoxSprite = new cc.Sprite(res.checkBox_png);
        checkBoxSprite.attr({
            x: (size.width *7)/17,
            y: size.height/7
        });
        this.addChild(checkBoxSprite, 1);

        var checkMarkSprite = new cc.Sprite(res.checkMark_png);
        checkMarkSprite.attr({
            x: (size.width *7)/17,
            y: size.height/7
        });
        this.addChild(checkMarkSprite, 2);

        var userAgreementSprite = new cc.Sprite(res.userAgreement_png);
        userAgreementSprite.attr({
            x: size.width / 2 + 30,
            y: size.height/7
        });
        this.addChild(userAgreementSprite, 1);

        var warningTxt = "抵制不良游戏 拒绝盗版游戏 注意自我保护 谨防受骗上当 适度游戏益脑 沉迷游戏伤身 合理安排游戏时间 享受健康生活";
        var gameWarningLabel = new cc.LabelTTF(warningTxt, "Arial", 22);
        gameWarningLabel.attr({
            x: size.width / 2,
            y: 40
        });
        this.addChild(gameWarningLabel, 1);

        return true;
    }
});

/**
 * Login场景
 * @class
 * @extends cc.Scene
 */
var loginScene = cc.Scene.extend({
    onEnter: function(){
        this._super();

        var layer = new loginLayer();
        this.addChild(layer);
    }
});