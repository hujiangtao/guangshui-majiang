/**----------------------------------------------------------------
 * 碰杠精灵
 *
 * 碰牌或者杠牌时的精灵组合
 ----------------------------------------------------------------**/
var PengGangSprite = cc.Sprite.extend({
    pg_suit: null,
    pg_suit_number: null,
    PengGang: null,

    initMJPengGang: function(penggang, suit, number){
        this.pg_suit = suit;
        this.pg_suit_number = number;
        this.PengGang = penggang;
    },

    onEnter: function(){
        this._super();

        switch(this.PengGang){
            case "peng":
                for(var i = 0; i < 3; i++){
                    var pengMJ = new cc.Sprite(
                        cc.spriteFrameCache.getSpriteFrame("B_" + this.pg_suit + "_" + this.pg_suit_number +".png"));
                    pengMJ.attr({  x: i * 55, y: 0  });
                    this.addChild(pengMJ, 2);
                }
                break;
            case "gang":
                for(var i = 0; i < 4; i++){
                    var gangMJ = new cc.Sprite(
                        cc.spriteFrameCache.getSpriteFrame("B_"+this.pg_suit+"_"+ this.pg_suit_number +".png"));

                    if(i < 3){
                        gangMJ.attr({ x: i * 55, y: 0 });
                    } else {
                        gangMJ.attr({ x: 55, y: 20 });
                    }
                    this.addChild(gangMJ, 2);
                }
                break;
        }
    }
});
