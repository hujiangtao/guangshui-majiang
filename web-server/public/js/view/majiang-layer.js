/**----------------------------------------------------------------
 * 麻将层
 *
 * 游戏开始，开始打牌。
 ----------------------------------------------------------------**/
var majiangLayer = cc.Layer.extend({
    currentPlayer: null,
    room: null,
    _shouPai: null,
    _naPai: null,
    _chiPai: null,
    _qiPai: null,

    ctor: function(){
        this._super();

        var controller = window.k1controller;
        this.currentPlayer = controller.getCurrentPlayer();
        this.room = this.currentPlayer.room;
    },

    timer: function(){
        var self = this;

        var action1 = cc.delayTime(1);

        var action2 = cc.callFunc(function () {
            this.currentPlayer.tiles.sortTiles();
            this.currentPlayer.tiles.shou.traverseType();
        }, self);

        // 庄家先发牌
        var action3 = cc.callFunc(function(){

        }, self);

        if(this.currentPlayer.isDealer){
            self.runAction(cc.sequence(action1, action2, action1, action3));
        }else{
            self.runAction(cc.sequence(action1, action2));
        }
    },

    onEnter: function(){
        this._super();

        var currentNode = this.currentPlayer.tiles.shou.header;
        var shoupai = [];

        do {
            for(var k = 0, len = currentNode.tiles.length; k < len; k++){
                var majiang = new Mahjong(currentNode.tiles[k]);
                shoupai.push(majiang);
            }
            currentNode = currentNode.next;
        }while (currentNode !== null);

        for(var i = 0, len = shoupai.length; i < len; i ++){
            this.addChild(shoupai[i]);
        }

        this.timer();
    },

    chupai: function(tile, position, that){
    }

});