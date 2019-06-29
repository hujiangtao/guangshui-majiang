/**----------------------------------------------------------------
 * 操作层
 *
 * 过、胡、亮、碰、杠
 ----------------------------------------------------------------**/
var operateTileLyr = cc.Layer.extend({
    ctor: function (args) {
        this._super();

        var args = args || {};
        var enabled = args;

        var guoItem = new cc.MenuItemFont("过", function () {

        }, this);
        guoItem.setEnabled(false);
        guoItem.setFontName("黑体");
        guoItem.setFontSize(72);
        guoItem.color = cc.color(120,20,20);
        guoItem.attr({x: this.width/2 - 70, y: -150});

        var huItem = new cc.MenuItemFont("胡", function () {

        }, this);
        huItem.setEnabled(false);
        huItem.setFontName("黑体");
        huItem.setFontSize(72);
        huItem.color = cc.color(120,20,20);
        huItem.attr({x: this.width/2 - 140, y: -150});

        var liangItem = new cc.MenuItemFont("亮", function () {

        }, this);
        liangItem.setEnabled(false);
        liangItem.setFontName("黑体");
        liangItem.setFontSize(72);
        liangItem.color = cc.color(120,20,20);
        liangItem.attr({x: this.width/2 - 210, y: -150});

        var pengItem = new cc.MenuItemFont("碰", function () {

        }, this);
        pengItem.setEnabled(false);
        pengItem.setFontName("黑体");
        pengItem.setFontSize(72);
        pengItem.color = cc.color(120,20,20);
        pengItem.attr({x: this.width/2 - 280, y: -150});

        var gangItem = new cc.MenuItemFont("杠", function () {

        }, this);
        gangItem.setEnabled(false);
        gangItem.setFontName("黑体");
        gangItem.setFontSize(72);
        gangItem.color = cc.color(120,20,20);
        gangItem.attr({x: this.width/2 - 350, y: -150});

        for(var i = 0; i < enabled.length; i++){
            switch (enabled[i]) {
                case "guo":
                    guoItem.setEnabled(true);
                    break;
                case "hu":
                    huItem.setEnabled(true);
                    break;
                case "liang":
                    liangItem.setEnabled(true);
                    break;
                case "peng":
                    pengItem.setEnabled(true);
                    break;
                case "gang":
                    gangItem.setEnabled(true);
                    break;
                default:
                    break;
            }
        }


        var operateMenu = new cc.Menu(guoItem, huItem, liangItem, pengItem, gangItem);
        operateMenu.attr({x: this.width / 2, y: this.height / 2});
        this.addChild(operateMenu);
    }
});
