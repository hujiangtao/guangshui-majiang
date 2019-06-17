/************游戏大厅*******************/
var controller = window.k1controller;

// 创建大厅层
var hallLayer = cc.Layer.extend({
    app: null,
    lyrCreateRoom: null,
    lyrJoinRoom: null,
    btnCreateRoom: null,
    btnJoinRoom: null,

    ctor: function(){
        this._super();

        this.app = controller.getApplication();
    },

    onEnter: function () {
        this._super();

        cc.spriteFrameCache.addSpriteFrames(res.mainScene_plist);
        var hallBgFootbarPng = cc.spriteFrameCache.getSpriteFrame("xixia001.png");

        var size = cc.winSize;

        //添加背景图
        var hallBgSprite = new cc.Sprite(res.hallBg_png);
        hallBgSprite.attr({ x:size.width/2, y:size.height/2 });
        this.addChild(hallBgSprite, 0);

        var hallBgNvSprite = new cc.Sprite(res.hallNv_png);
        hallBgNvSprite.attr({ x: size.width/2 - 80, y: size.height/2 - 54 });
        this.addChild(hallBgNvSprite, 1);

        var hallBgTopbarSprite = new cc.Sprite(res.topBar_png);
        hallBgTopbarSprite.attr({ x: size.width/2, y: size.height/2 + 300 });
        this.addChild(hallBgTopbarSprite, 1);

        var hallBgFootbarSprite = new cc.Sprite(hallBgFootbarPng);
        hallBgFootbarSprite.attr({ x: size.width/2, y: size.height/2 - 329 });
        this.addChild(hallBgFootbarSprite, 1);

        //公告
        var noticeSprite = new cc.Sprite(res.notice_png);
        noticeSprite.attr({ x: 200, y: size.height / 2, scaleX: 0.8, scaleY: 0.8});
        this.addChild(noticeSprite, 1);

        var noticeLabel = new cc.LabelTTF("珍爱生活\n远离赌博","宋体", 30);
        noticeLabel.attr({ x: noticeSprite.width / 2, y: noticeSprite.height / 2 });
        noticeSprite.addChild(noticeLabel, 1);

        //创建房间的层
        this.lyrCreateRoom = new CreateRoomLayer();
        this.lyrCreateRoom.attr({ x: 0, y: 0 });

        //创建房间按钮
        var createRoomBtnItem = new cc.MenuItemImage(res.createRoom_png, res.createRoom_png, this.onClickBtnCreateRoom,this);
        this.btnCreateRoom = new cc.Menu(createRoomBtnItem);
        this.btnCreateRoom.attr({x: size.width - 350, y: size.height/2, scaleX: 0.8, scaleY: 0.8 });
        this.addChild(this.btnCreateRoom, 1);

        //弹出层：加入房间
        this.lyrJoinRoom = new JoinRoomLayer();
        this.lyrJoinRoom.attr({ x: 0, y: 0 });

        //加入房间按钮
        var joinRoomBtnItem = new cc.MenuItemImage(res.enterRoom_png, res.enterRoom_png,this.onClickBtnJoinRoom, this);
        this.btnJoinRoom = new cc.Menu(joinRoomBtnItem);
        this.btnJoinRoom.attr({ x: size.width - 350, y: size.height/2 - 160, scaleX: 0.8, scaleY: 0.8 });
        this.addChild(this.btnJoinRoom, 1);

        /**-----------------------------------------------------**/

        // 创建头部layer，头部相关sprite放到头部layer中
        var topLayer = new hallTopLayer();
        topLayer.attr({ x: 0, y: size.height - 110, width: size.width, height: 110 });
        this.addChild(topLayer, 1);

        var footerLayer = new hallFooterLayer();
        footerLayer.attr({ x: 0, y: 0, width: size.width, height: 150});
        this.addChild(footerLayer, 1);

        return true;
    },
    
    onClickBtnCreateRoom: function () {
        cc.log("显示创建房间面板..");

        this.addChild(this.lyrCreateRoom, 3);

        //关闭其他按钮
        this.btnCreateRoom.setEnabled(false);
        this.btnJoinRoom.setEnabled(false);
    },
    
    onClickBtnJoinRoom: function () {
        cc.log("join the room.");

        this.addChild(this.lyrJoinRoom, 3);

        //关闭其他按钮
        this.btnCreateRoom.setEnabled(false);
        this.btnJoinRoom.setEnabled(false);
    }
});

//大厅头部
var hallTopLayer = cc.Layer.extend({
    onEnter: function () {
        this._super();

        var size = cc.winSize;

        cc.spriteFrameCache.addSpriteFrames(res.public_ui_plist);
        var publicFrameHeadPng = cc.spriteFrameCache.getSpriteFrame("public_frame_head.png");
        var cardPng = cc.spriteFrameCache.getSpriteFrame("card.png");
        var messagePng = cc.spriteFrameCache.getSpriteFrame("xiao'xi.png");
        var helpPng = cc.spriteFrameCache.getSpriteFrame("bangzhu.png");
        var configPng = cc.spriteFrameCache.getSpriteFrame("shezhi.png");

        var publicFrameHeadSprite = new cc.Sprite(publicFrameHeadPng);
        publicFrameHeadSprite.attr({ x: 64, y: this.height / 2});
        this.addChild(publicFrameHeadSprite, 2);

        var companyNameLbl = new cc.LabelTTF("广水麻将","宋体", 30);
        companyNameLbl.ignoreAnchorPointForPosition(true);
        companyNameLbl.attr({ x: 130, y: 70, color: cc.color(255, 215, 0)});
        // companyNameLbl.color = cc.color(255, 215, 0);
        this.addChild(companyNameLbl, 2);

        var userIdLbl = new cc.LabelTTF("ID: 10001", "Arial", 25);
        userIdLbl.ignoreAnchorPointForPosition(true);
        userIdLbl.attr({ x: 130, y: 40 });
        this.addChild(userIdLbl, 2);

        var cardSprite = new cc.Sprite(cardPng);
        cardSprite.ignoreAnchorPointForPosition(true);
        cardSprite.attr({x: 130, y: 10});
        this.addChild(cardSprite, 2);

        var cardLbl = new cc.LabelTTF("9999", "Arial", 30);
        cardLbl.ignoreAnchorPointForPosition(true);
        cardLbl.attr({ x: 200, y: 6 });
        this.addChild(cardLbl, 2);

        var titleSprite = new cc.Sprite(res.logoMini_png);
        titleSprite.attr({ x: this.width / 2, y: this.height / 2 });
        this.addChild(titleSprite, 2);

        var messageSprite = new cc.Sprite(messagePng);
        messageSprite.attr({ x: this.width - 210, y: this.height / 2 });
        this.addChild(messageSprite, 2);

        var helpSprite = new cc.Sprite(helpPng);
        helpSprite.attr({ x: this.width - 130, y: this.height / 2 });
        this.addChild(helpSprite, 2);

        var configSprite = new cc.Sprite(configPng);
        configSprite.attr({x: this.width - 50, y: this.height / 2 });
        this.addChild(configSprite, 2);

        return true;
    }
});

//大厅底部
var hallFooterLayer = cc.Layer.extend({
    onEnter: function () {
        this._super();

        var recordPng = cc.spriteFrameCache.getSpriteFrame("zhanji.png");
        var sharePng = cc.spriteFrameCache.getSpriteFrame("share.png");
        var feedbackPng = cc.spriteFrameCache.getSpriteFrame("feedback.png");

        var recordSprite = new cc.Sprite(recordPng);
        recordSprite.attr({x: this.width / 2 - 240, y: this.height / 2 });
        this.addChild(recordSprite, 2);

        var shareSprite = new cc.Sprite(sharePng);
        shareSprite.attr({ x: this.width / 2, y: this.height / 2 });
        this.addChild(shareSprite, 2);

        var feedbackSprite = new cc.Sprite(feedbackPng);
        feedbackSprite.attr({ x: this.width / 2 + 240, y: this.height / 2});
        this.addChild(feedbackSprite, 2);

        return true;
    }
});

// 创建场景
var hallScene = cc.Scene.extend({
    onEnter: function () {
        this._super();

        var hall = new hallLayer();
        this.addChild(hall);
    }
});