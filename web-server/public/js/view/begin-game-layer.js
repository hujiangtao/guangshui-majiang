/**----------------------------------------------------------------
 * 游戏层
 *
 * 游戏所在的层
 ----------------------------------------------------------------**/
var BeginGameLayer = cc.Layer.extend({

    _diceNumberLayer: null,

    setDiceNumbersLyr: function(layer){
        this._diceNumberLayer = layer;
    },

    onEnter: function(){
        this._super();

        var player_myself = new gamePlayerLayer();
        player_myself.attr({
            width: 100,
            height: 100,
            x: 100,
            y: 210
        });
        this.addChild(player_myself, 1);

        //骰子动作
        var animationOfDice = new diceAnimationSprite();
        animationOfDice.attr({  x: this.width / 2, y: this.height /2  });

        //骰子结果
        var self = this;
        var numberOfDice = this._diceNumberLayer;
        // numberOfDice.setNumber(this.number1, this.number2);
        numberOfDice.attr({  x: 0, y: 0  });

        var majiangLyr = new majiangLayer();
        majiangLyr.attr({  x: 0, y: 0  });

        //设置骰子结果Layer中的确定按钮的回调函数
        numberOfDice.setConfirmBtnCallback(function(){
            self.removeChild(numberOfDice);
            numberOfDice = null;

            //清除骰子结果Layer后添加麻将层
            self.addChild(majiangLyr, 1);
        });

        //骰子动作结束之后的回调函数
        animationOfDice.setAfterTheEndCallback(function(){
            //添加骰子记过层
            this.addChild(numberOfDice, 1);

            //移除骰子动画
            this.removeChild(animationOfDice);
            animationOfDice = null;
        }, this);

        this.addChild(animationOfDice, 1);

    }
});