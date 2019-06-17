/**----------------------------------------------------------------
 * 游戏player icon层
 * icon层的位置应该是被动传入，根据位置显示聊天、准备等Label的位置
 * 不同；
 ----------------------------------------------------------------**/
var gamePlayerLayer = cc.Layer.extend({
    _seatPosition: -1,
    _name: null,
    player: null,

    setSeatPosition: function(seatPosition){
        this._seatPosition = seatPosition;
    },

    getSeatPosition: function(){
        return this._seatPosition;
    },

    setName: function(name){
        this._name = name;
    },

    onRemoveFromParent: function(){
        var self = this;
        self.removeFromParent();
    },

    setPlayer: function(player){
        this.player = player;
    },

    deletePlayer: function(){
        this.player = null;
    },

    onEnter: function(){
        this._super();

        var zUserSprite = new cc.Sprite(res.Z_user_png);
        zUserSprite.x = this.width / 2;
        zUserSprite.y = this.height / 2;
        this.addChild(zUserSprite, 2);

        var zUserIconSprite = new cc.Sprite(res.Z_nobody_png);
        zUserIconSprite.x = this.width / 2;
        zUserIconSprite.y = this.height / 2;
        this.addChild(zUserIconSprite, 2);

        var zUserNameBgSprite = new cc.Scale9Sprite(res.Z_money_frame_png, cc.rect(0, 0,86, 27), cc.rect(20,13,46,1));
        zUserNameBgSprite.x = this.width / 2;
        zUserNameBgSprite.y = -20;
        zUserNameBgSprite.width = 150;
        zUserNameBgSprite.height = 30;
        this.addChild(zUserNameBgSprite, 2);

        var zUserNameLabel = new cc.LabelTTF(this.player.id, "宋体", 28);
        zUserNameLabel.x = this.width / 2;
        zUserNameLabel.y = -20;
        this.addChild(zUserNameLabel, 2);

        var zUserScoreLabel = new cc.LabelTTF("1000", "Arial", 28);
        zUserScoreLabel.x = this.width / 2;
        zUserScoreLabel.y = - 55;
        zUserScoreLabel.color = cc.color(255,255,0);
        this.addChild(zUserScoreLabel, 2);
        /**-----------------------------------------------------**/

            //聊天信息；这里的聊天是在游戏开始前的聊天显示，这里应该跟事件配合起来；当客户端收到一个聊天信息，
            //在相应的玩家icon旁显示出来，3秒后或者本人的下一条信息到来时这条消息消失。
        var messageStatus = true;
        if(messageStatus == true){
            if(this._seatPosition == MY_SEAT || this._seatPosition == LEFT_SEAT){
                //当前玩家和左方玩家聊天框
                var lChatBackgroundSprite = new cc.Scale9Sprite(res.ld_chatbg_png, cc.rect(0, 0, 120, 66), cc.rect(45, 15, 60, 21));
                lChatBackgroundSprite.attr({
                    width: 240,
                    height: 112,
                    x: 80,
                    y: 90,
                    anchorX: 0,
                    anchorY: 0
                });
                this.addChild(lChatBackgroundSprite, 2);
                //当前玩家及左方玩家聊天文字
                var lChatLabel = new cc.LabelTTF("我一定打你个\n落花流水！！", "宋体", 36);
                lChatLabel.attr({
                    x: 90,
                    y: 115,
                    color: cc.color(120,20,20),
                    anchorX: 0,
                    anchorY: 0
                });
                this.addChild(lChatLabel, 2);

            }else if(this._seatPosition == RIGHT_SEAT) {
                //右方玩家聊天框
                var rChatBackgroundSprite = new cc.Scale9Sprite(res.rd_chatbg_png, cc.rect(0, 0, 156, 66), cc.rect(15, 15, 96, 21));
                rChatBackgroundSprite.attr({
                    width: 240,
                    height: 112,
                    x: 0,
                    y: 150,
                    anchorX: 1,
                    anchorY: 1
                });
                this.addChild(rChatBackgroundSprite, 2);
                //右方玩家聊天文字
                var rChatLabel = new cc.LabelTTF("我一定打你个\n落花流水！！", "宋体", 36);
                rChatLabel.attr({
                    color: cc.color(120,20,20),
                    x: -10,
                    y: 140,
                    anchorX: 1,
                    anchorY: 1
                });
                this.addChild(rChatLabel, 2);
            }else if(this._seatPosition == FRONT_SEAT) {
                //前方玩家聊天框
                var fChatBackgroundSprite = new cc.Scale9Sprite(res.rd_chatbg_png, cc.rect(0, 0, 156, 66), cc.rect(15, 15, 96, 21));
                fChatBackgroundSprite.attr({
                    width: 240,
                    height: 112,
                    x: 0,
                    y: 150,
                    anchorX: 1,
                    anchorY: 1
                });
                this.addChild(fChatBackgroundSprite, 2);
                //前方玩家聊天文字
                var fChatLabel = new cc.LabelTTF("我一定打你个\n落花流水！！", "宋体", 36);
                fChatLabel.attr({
                    color: cc.color(120,20,20),
                    x: -10,
                    y: 140,
                    anchorX: 1,
                    anchorY: 1
                });
                this.addChild(fChatLabel, 2);
            } else {
                return false;
            }
        }

    }

});