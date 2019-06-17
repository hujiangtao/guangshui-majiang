/**----------------------------------------------------------------
 * 骰子动画
 *
 * 游戏开始时掷骰子的动画
 ----------------------------------------------------------------**/
var diceAnimationSprite = cc.Sprite.extend({
    _cbTarget: null,
    _afterTheEndCallback: null,

    onEnter: function(){
        this._super();

        var animation = new cc.Animation();
        for (var i = 2; i <= 27; i++) {
            var frameName = "dice_"+ i + "_png";
            animation.addSpriteFrameWithFile(res[frameName]);
        }
        animation.setDelayPerUnit(0.1);
        //animation.setRestoreOriginalFrame(true);

        var animAction = cc.animate(animation);
        var removeDiceAnim = new cc.removeSelf(animAction);
        var finish = cc.callFunc(this._afterTheEndCallback, this._cbTarget);

        var action = cc.sequence(animAction, removeDiceAnim, finish);

        this.runAction(action);
    },

    onExit: function(){
        cc.log("animation exit.");
    },

    setAfterTheEndCallback: function(cb, target){
        this._afterTheEndCallback = cb;
        this._cbTarget = target;
    }

});