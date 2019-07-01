/**----------------------------------------------------------------
 * 麻将精灵
 *
 *
 ----------------------------------------------------------------**/
var Mahjong = cc.Sprite.extend({
    majiang: null,

    mjPosX: 0,
    mjPosY: 0,
    beginAction: null,
    mjActionStatus: 0,
    touchMahjongListener: null,
    checkMahjongListener: null,
    paiDui: null,

    ctor: function(mj){
        cc.spriteFrameCache.addSpriteFrames(res.right_mj_plist);
        cc.spriteFrameCache.addSpriteFrames(res.left_mj_plist);
        cc.spriteFrameCache.addSpriteFrames(res.myself_mj_plist);
        cc.spriteFrameCache.addSpriteFrames(res.empty_mj_plist);
        cc.spriteFrameCache.addSpriteFrames(res.opposite_mj_plist);

        var picStr = "";
        if(mj.suit === "bamboo"){
            picStr = "M_bamboo_"+ mj.points +".png";
        }else if(mj.suit === "dot"){
            picStr = "M_dot_"+ mj.points +".png";
        }else if(mj.suit === "dragon" && mj.name === "zhong"){
            picStr = "M_red.png"
        }else if(mj.suit === "dragon" && mj.name === "fa"){
            picStr = "M_green.png"
        }else if(mj.suit === "dragon" && mj.name === "bai"){
            picStr = "M_white.png"
        }

        this._super(cc.spriteFrameCache.getSpriteFrame(picStr));

        this.majiang = mj;
        this.setMJPosition();
        mj.setView(this);           //在controller中注册麻将sprite
    },

    setMJPosition: function(){
        this.attr({ x: 150 + this.majiang.postion * 75, y: 80 });

        this.mjPosX = this.x;
        this.mjPosY = this.y;
    },

    onEnter: function(){
        this._super();

        this.addMahjongListener();
    },

    moveToNewPosition: function(){

    },

    addMahjongListener: function(){
        var self = this;

        if( 'touches' in cc.sys.capabilities ) {
            this.touchMahjongListener = cc.EventListener.create({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                onTouchMoved: function(touch, event){
                    var target = event.getCurrentTarget();
                    var pos = touch.getLocation();

                    if(target.mjActionStatus === 0 && cc.rectContainsPoint(target.getBoundingBox(), pos)) {
                        cc.eventManager.pauseTarget(target, true);
                        target.mjActionStatus = 1;
                        var mjMoveUpAction = cc.moveTo(0.2, cc.p(target.mjPosX, target.mjPosY + 50));
                        var mjMoveUpFinished = cc.callFunc(function(){
                            this.mjActionStatus = 2;
                            cc.eventManager.resumeTarget(target, true);
                        },target);
                        var upAction = cc.sequence(mjMoveUpAction, mjMoveUpFinished);
                        target.runAction(upAction);
                    }

                    if(target.mjActionStatus === 2 && !(cc.rectContainsPoint(target.getBoundingBox(), pos))) {
                        cc.eventManager.pauseTarget(target, true);
                        target.mjActionStatus = 1;
                        var mjMoveDownAction = cc.moveTo(0.2, cc.p(target.mjPosX, target.mjPosY));
                        var mjMoveDownFinished = cc.callFunc(function(){
                            this.mjActionStatus = 0;
                            cc.eventManager.resumeTarget(target, true);
                        }, target);
                        var downAction = cc.sequence(mjMoveDownAction, mjMoveDownFinished);
                        target.runAction(downAction);
                    }
                }
            });
            cc.eventManager.addListener(this.touchMahjongListener, this);
        } else if ('mouse' in cc.sys.capabilities){
            cc.log("mouse in capabilities");

            this.touchMahjongListener = cc.EventListener.create({
                event: cc.EventListener.MOUSE,
                onMouseMove: function(event){
                    var pos = event.getLocation();
                    var target = event.getCurrentTarget();

                    //mjActionStatus：0，麻将处于原位，没有运动；检测到状态0时，检查碰撞是否为真，为真则弹起
                    //mjActionStatus：1，麻将处于运动状态；检测到状态1时，不做操作
                    //mjActionStatus：2，麻将处于上弹位置，没有运动；检测到状态2时，检测碰撞为假，则弹回到原位置

                    if(target.mjActionStatus === 0 && cc.rectContainsPoint(target.getBoundingBox(), pos)) {
                        cc.eventManager.pauseTarget(target, true);
                        target.mjActionStatus = 1;
                        var mjMoveUpAction = cc.moveTo(0.2, cc.p(target.mjPosX, target.mjPosY + 50));
                        var mjMoveUpFinished = cc.callFunc(function(){
                            this.mjActionStatus = 2;
                            cc.eventManager.resumeTarget(target, true);
                        },target);
                        var upAction = cc.sequence(mjMoveUpAction, mjMoveUpFinished);
                        target.runAction(upAction);
                    }

                    if(target.mjActionStatus === 2 && !(cc.rectContainsPoint(target.getBoundingBox(), pos))) {
                        cc.eventManager.pauseTarget(target, true);
                        target.mjActionStatus = 1;
                        var mjMoveDownAction = cc.moveTo(0.2, cc.p(target.mjPosX, target.mjPosY));
                        var mjMoveDownFinished = cc.callFunc(function(){
                            this.mjActionStatus = 0;
                            cc.eventManager.resumeTarget(target, true);
                        }, target);
                        var downAction = cc.sequence(mjMoveDownAction, mjMoveDownFinished);
                        target.runAction(downAction);
                    }
                }
            });
            cc.eventManager.addListener(this.touchMahjongListener, this);

            /*this.checkMahjongListener = cc.EventListener.create({
                event: cc.EventListener.MOUSE,
                onMouseUp: function (event) {
                    var pos = event.getLocation();
                    var target = event.getCurrentTarget();

                    if(cc.rectContainsPoint(target.getBoundingBox(), pos)){
                        //牌打出，给服务器传递信息; 服务器返回信息，将牌传递到牌堆; 整理牌堆，计算是否听牌

                        var route = "game.gameHandler.play";
                        pomelo.request(route, {title: this._mahjongId, paiDui: this.paiDui}, cb);

                        var cb = function (data) {
                            var targetParent = target.getParent();
                            if(this.paiDui === "shou"){
                                for(var i = 0; i < player.tiles.length; i++){
                                    if(player.tiles[i] === self._mahjongId){
                                        player.tiles.splice(i, 1, player.naPai);
                                    }
                                }

                                player.sortTiles();
                            }
                            targetParent.chupai(self._mahjongId, "myself", targetParent);
                            target.removeFromParent();

                            targetParent.refresh();
                        }




                    }
                }
            });
            cc.eventManager.addListener(this.checkMahjongListener, this);*/



        } else {
            cc.log("touches NOT in capabilities");
        }

    }
});