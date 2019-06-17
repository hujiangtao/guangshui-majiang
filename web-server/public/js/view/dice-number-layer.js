/**----------------------------------------------------------------
 * 骰子结果
 *
 * 骰子的结果
 ----------------------------------------------------------------**/
var DiceNumberLayer = cc.Layer.extend({
    _first: 0,
    _second: 0,
    _confirmCallback: null,

    setNumber: function(number1, number2){
        this._first = number1;
        this._second = number2;
    },

    onEnter: function(){
        this._super();

        cc.log("dice animation: " + this._first + " and " + this._second );

        if(this._first >= 1 || this._first <= 6){
            var firstDiceSprite = new cc.Sprite(res["dice"+ this._first +"_png"]);
            firstDiceSprite.attr({  x: this.width / 2 - 120, y: this.height / 2 - 30  });
            this.addChild(firstDiceSprite, 2);
        } else {
            return false;
        }

        if(this._second >= 1 || this._second <= 6){
            var secondDiceSprite = new cc.Sprite(res["dice"+ this._second +"_png"]);
            secondDiceSprite.attr({  x: this.width / 2 + 20, y: this.height / 2 -30 });
            this.addChild(secondDiceSprite, 2);
        } else {
            return false;
        }
        /**-----------------------------------------------------**/

        var btnConfirmPng = cc.spriteFrameCache.getSpriteFrame("btn_agree.png");

        //确认按钮，可能会被事件管理器代替
        var beginConfirmItem = new cc.MenuItemImage(btnConfirmPng, btnConfirmPng, function(){
            cc.log("begin game confirm button");
            this._confirmCallback();


        }, this);

        var beginConfirmBtn = new cc.Menu(beginConfirmItem);
        beginConfirmBtn.attr({  x: this.width - 300, y: 100  });
        this.addChild(beginConfirmBtn, 2);

        var action1 = cc.delayTime(1);
        var action2 = cc.callFunc(this._confirmCallback, this);

        this.runAction(cc.sequence(action1, action2));
    },

    setConfirmBtnCallback: function(cb){
        if(typeof cb === "function") {
            this._confirmCallback = cb;
        } else
            return false;
    }
});