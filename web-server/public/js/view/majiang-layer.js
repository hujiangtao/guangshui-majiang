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
        }, self);

        self.runAction(cc.sequence(action1, action2));
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


/*        var player = k1game.getCurrentPlayer();

        cc.spriteFrameCache.addSpriteFrames(res.right_mj_plist);
        cc.spriteFrameCache.addSpriteFrames(res.left_mj_plist);
        cc.spriteFrameCache.addSpriteFrames(res.myself_mj_plist);
        cc.spriteFrameCache.addSpriteFrames(res.empty_mj_plist);
        cc.spriteFrameCache.addSpriteFrames(res.opposite_mj_plist);

        this._shouPai = [];     //手牌牌堆
        this._chiPai = [];      //吃碰杠的牌堆
        this._qiPai = [];       //打出去的牌堆
        this._naPai = 0;       //从牌堆里拿到的牌
        /!**-----------------------------------------------------**!/

        for(var i = 0; i < player.titles.length; i ++){
            if (Math.floor(player.titles[i] / 100) === 1) {
                var num = player.titles[i] % 10;
                var majiang = new Mahjong(cc.spriteFrameCache.getSpriteFrame("M_bamboo_"+ num +".png"));
                majiang.initMajong(player.titles[i], "bamboo", num);
                majiang.paiDui = "shou";
                this._shouPai.push(majiang);
            }else if(Math.floor(player.titles[i] / 100) === 3){
                var num = player.titles[i] % 10;
                var majiang = new Mahjong(cc.spriteFrameCache.getSpriteFrame("M_dot_"+ num +".png"));
                majiang.initMajong(player.titles[i], "dot", num);
                majiang.paiDui = "shou";
                this._shouPai.push(majiang);
            }else if(Math.floor(player.titles[i] / 100) === 5){
                var num = player.titles[i] % 10;
                if(num === 1){
                    var majiang = new Mahjong(cc.spriteFrameCache.getSpriteFrame("M_red.png"));
                    majiang.initMajong(player.titles[i], "dragon", num);
                    majiang.paiDui = "shou";
                    this._shouPai.push(majiang);
                }else if(num === 2){
                    var majiang = new Mahjong(cc.spriteFrameCache.getSpriteFrame("M_green.png"));
                    majiang.initMajong(player.titles[i], "dragon", num);
                    majiang.paiDui = "shou";
                    this._shouPai.push(majiang);
                }else if(num === 3){
                    var majiang = new Mahjong(cc.spriteFrameCache.getSpriteFrame("M_white.png"));
                    majiang.initMajong(player.titles[i], "dragon", num);
                    majiang.paiDui = "shou";
                    this._shouPai.push(majiang);
                }else{
                    return false;
                }
            }else {
                return false;
            }
        }

        for(var i = 0; i < this._shouPai.length; i++){
            this._shouPai[i].attr({
                x: 150 + i * 75, y: 80
            });
            this._shouPai[i].setMJPos(150 + i * 75, 80);
            this.addChild(this._shouPai[i], 3);
        }

        var tmpTitles = player.bambooTitles.concat(player.dotTitles.concat(player.dragonTitles));
        console.log("sort titles: " + tmpTitles + "; titles length = " + tmpTitles.length);

        var self = this;

        var giveTitle = function (titleId) {
            player.naPai = titleId;

            var titleStr;
            var num = titleId % 10;
            var suit;
            if(Math.floor(titleId / 100) === 1){
                titleStr = "M_bamboo_" + (titleId % 10) + ".png";
                suit = "bamboo";
            }else if(Math.floor(titleId / 100) === 3){
                titleStr = "M_dot_"+ (titleId % 10) +".png";
                suit = "dot";
            }else if(Math.floor(titleId / 100) === 5 && titleId % 10 === 1){
                titleStr = "M_red.png";
                suit = "dragon";
            }else if(Math.floor(titleId / 100) === 5 && titleId % 10 === 2){
                titleStr = "M_green.png";
                suit = "dragon";
            }else if(Math.floor(titleId / 100) === 5 && titleId % 10 === 3){
                titleStr = "M_white.png";
                suit = "dragon";
            }

            self._naPai = new cc.Mahjong(cc.spriteFrameCache.getSpriteFrame(titleStr));
            majiang.initMajong(titleId, suit, num);
            self._naPai.attr({  x: (150 + self._shouPai.length * 75) + 30, y: 80  });
            self._naPai.paiDui = "na";
            self.addChild(self._naPai, 2);
        };


        var sortGameTitles = function (data) {
            if(data.code === 200){
                var action1 = cc.delayTime(1);

                var action2 = cc.callFunc(function () {
                    this.refresh();
                }, self);

                //牌覆倒
                var action3 = cc.callFunc(function () {
                    var len = this._shouPai.length;

                    for(var i = 0; i < len; i++){
                        this.removeChild(this._shouPai[i]);
                    }
                    this._shouPai.splice(0, len);

                    for(var j = 0; j < len; j++){
                        var majiang = new Mahjong(cc.spriteFrameCache.getSpriteFrame("e_mj_b_up.png"));
                        this._shouPai.push(majiang);
                    }

                    for(var i = 0; i < this._shouPai.length; i++){
                        this._shouPai[i].attr({
                            x: 150 + i * 75, y: 80, scaleX: 2.15, scaleY: 2.15
                        });
                        this._shouPai[i].setMJPos(150 + i * 75, 80);
                        this.addChild(this._shouPai[i], 3);
                    }

                }, self);

                var action4 = cc.callFunc(function () {
                    if(player.uid === player.getRoom().getToken()){
                        var route = "game.gameHandler.give";
                        pomelo.request(route, {token: player.getRoom().getToken()}, function (data) {
                            if(data.code === 500){
                                console.log(data.msg);
                            }else if(data.code === 200){
                                //自己拿到的牌
                                giveTitle(data.title);
                                var flag = player.reviewTitle(data.title);

                                if(flag){
                                    callOpt(["guo","hu"]);
                                }
                            }
                        });
                    }
                }, self);

                self.runAction(cc.sequence(action1, action3, action1, action2, action1, action4));

            }
        };

        var callOpt = function (args) {
            var optLyr = new operateTitleLyr(args);
            self.addChild(optLyr,5);
        };

        var route = "game.gameHandler.synchronous";
        pomelo.request(route, {titles: tmpTitles}, sortGameTitles);
        /!**-----------------------------------------------------**!/

            //左边的手牌
        var l_shouPai = [];
        for(var i = 0; i < 13; i++){
            var l_majiang = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("e_mj_left.png"));
            l_majiang.attr({ x: 240, y: 540 - i*25});
            l_shouPai.push(l_majiang);
            //this.addChild(l_majiang, 1+i);
            this.addChild(l_majiang, 1);
        }
        /!**-----------------------------------------------------**!/

            //右边的手牌
        var r_shouPai = [];
        for(var i = 0; i < 13; i++){
            var r_majiang = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("e_mj_right.png"));
            r_majiang.attr({ x: this.width - 240, y: 540 - i*25});
            r_shouPai.push(r_majiang);
            this.addChild(r_majiang, 1);
        }
        /!**-----------------------------------------------------**!/








        var self = this;
        var cb_playTitle = function (data) {
            if(data.player !== player.uid){
                if(data.player === player.room.players["up"]){
                    this.chupai(data.title, "left", self);
                }else if(data.player === player.room.players["down"]){
                    this.chupai(data.title, "right", self);
                }
            }


        };
        pomelo.on("playTitle", cb_playTitle);*/


        /*

        //自己的手牌牌堆
        do {
            var i = Math.floor( Math.random() * 10 );
            var y = 0;
            if(i > 0){
                y++;
                var majiang = new Mahjong(cc.spriteFrameCache.getSpriteFrame("M_dot_"+ i +".png"));
                majiang.initMajong(y, "dot", i );

                this._shouPai.push(majiang);
            }
        } while(this._shouPai.length < 7);

        for(var i = 0; i < this._shouPai.length; i++){
            this._shouPai[i].attr({
               x: 150 + i * 75, y: 80
            });
            this._shouPai[i].setMJPos(150 + i * 75, 80);
            this.addChild(this._shouPai[i], 3);
        }
        /!**-----------------------------------------------------**!/

        //自己拿到的牌
        this._naPai = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("M_bamboo_7.png"));
        this._naPai.attr({  x: (150 + this._shouPai.length * 75) + 30, y: 80  });
        this.addChild(this._naPai, 2);
        /!**-----------------------------------------------------**!/

        //自己碰杠的牌堆B_bamboo_2.png

        var peng = new PengGangSprite();
        peng.initMJPengGang("peng", "dot", 3);
        var gang = new PengGangSprite();
        gang.initMJPengGang("gang", "bamboo", 7);
        this._chiPai.push(peng);
        this._chiPai.push(gang);

        for(var i = 0; i < this._chiPai.length; i++){
            this._chiPai[i].attr({  x: (180 + this._shouPai.length * 75) + 150 + i * 58 * 3, y: 80  });
            this.addChild(this._chiPai[i], 2);
        }
        /!**-----------------------------------------------------**!/

        //自己打出的牌
        do {
            var i = Math.floor( Math.random() * 10 );
            var y = 0;
            if(i > 0){
                y++;
                var majiang = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("B_dot_"+ i +".png"));
                this._qiPai.push(majiang);
            }
        } while(this._qiPai.length < 18);

        for(var i = 0; i < this._qiPai.length; i++){
            if(i < 11){
                this._qiPai[i].attr({
                    x: this.width / 2 + (i - 5) * 44, y: 180,
                    scaleX: 0.8, scaleY: 0.8
                });
                this.addChild(this._qiPai[i], 2);
            } else if (i >= 11 && i < 22 ) {
                this._qiPai[i].attr({
                    x: this.width / 2 + (i - 16) * 44, y: 230,
                    scaleX: 0.8, scaleY: 0.8
                });
                this.addChild(this._qiPai[i], 1);
            } else
                return false;
        }
        /!**-----------------------------------------------------**!/



        //左边的拿到的牌
        var l_naPai = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("e_mj_left.png"));
        l_naPai.attr({ x: 240, y: 600});
        this.addChild(l_naPai, 1);
        /!**-----------------------------------------------------**!/

        //左边的碰杠牌堆
        for(var i = 0; i < 3; i++){
            var l_chiPai = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("L_bamboo_2.png"));
            l_chiPai.attr({ x: 250, y: (510 - l_shouPai.length * 25) - i * 25 });
            this.addChild(l_chiPai, 1)
        }

        for(i = 0; i < 4; i++ ){
            var l_chiPai = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("L_dot_9.png"));
            if(i < 3){
                l_chiPai.attr({ x: 250, y: (510 - l_shouPai.length * 25 - 3*25) - i * 25 });
                this.addChild(l_chiPai, 1);
            } else {
                l_chiPai.attr({ x: 250, y: (510 - l_shouPai.length * 25 - 3*25) - 15 });
                this.addChild(l_chiPai, 1);
            }
        }
        /!**-----------------------------------------------------**!/

        //左边打出的牌
        var l_qiPai = [];
        do {
            var i = Math.floor( Math.random() * 10 );
            var y = 0;
            if(i > 0){
                y++;
                var l_majiang = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("L_bamboo_"+ i +".png"));
                l_qiPai.push(l_majiang);
            }
        } while(l_qiPai.length < 18);

        cc.log("left qipai: " + l_qiPai.length);
        for(var i = 0; i < l_qiPai.length; i++){
            if(i < 11){
                l_qiPai[i].attr({
                    x: 320, y: this.height / 2 - (i -8 )* 25,
                });
                this.addChild(l_qiPai[i], 2);
            } else if (i >= 11 && i < 22 ) {
                l_qiPai[i].attr({
                    x: 368,  y: this.height / 2 - (i - 19) * 25
                });
                this.addChild(l_qiPai[i], 1);
            } else
                return false;
        }
        /!**-----------------------------------------------------**!/



        //右边的拿到的牌
        var r_naPai = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("e_mj_right.png"));
        r_naPai.attr({ x: this.width - 240, y: 600});
        this.addChild(r_naPai, 1);
        /!**-----------------------------------------------------**!/

        //右边的碰杠牌堆
        for(var i = 0; i < 3; i++){
            var r_chiPai = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("R_bamboo_5.png"));
            r_chiPai.attr({ x: this.width -250, y: (510 - l_shouPai.length * 25) - i * 25 });
            this.addChild(r_chiPai, 1)
        }

        for(i = 0; i < 4; i++ ){
            var r_chiPai = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("R_dot_2.png"));
            if(i < 3){
                r_chiPai.attr({ x: this.width - 250, y: (510 - l_shouPai.length * 25 - 3*25) - i * 25 });
                this.addChild(r_chiPai, 1);
            } else {
                r_chiPai.attr({ x: this.width - 250, y: (510 - l_shouPai.length * 25 - 3*25) - 15 });
                this.addChild(r_chiPai, 1);
            }
        }
        /!**-----------------------------------------------------**!/

        //右边打出的牌
        var r_qiPai = [];
        do {
            var i = Math.floor( Math.random() * 10 );
            var y = 0;
            if(i > 0){
                y++;
                var r_majiang = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("R_bamboo_"+ i +".png"));
                r_qiPai.push(r_majiang);
            }
        } while(r_qiPai.length < 18);

        for(var i = 0; i < r_qiPai.length; i++){
            if(i < 11){
                r_qiPai[i].attr({
                    x: this.width - 320, y: this.height / 2 - (i -8 )* 25
                });
                this.addChild(r_qiPai[i], 2);
            } else if (i >= 11 && i < 22 ) {
                r_qiPai[i].attr({
                    x: this.width - 368,  y: this.height / 2 - (i - 19) * 25
                });
                this.addChild(r_qiPai[i], 1);
            } else
                return false;
        }*/
        /**-----------------------------------------------------**/


    },











    chupai: function(title, position, that){
        var player = k1game.getCurrentPlayer();

        if(position === "myself"){
            player.chupai.push(title);

            for(var i = 0; i < player.chupai.length; i++){
                var titleStr;
                var num = player.chupai[i] % 10;
                var suit;
                if(Math.floor(player.chupai[i] / 100) === 1){
                    titleStr = "M_bamboo_" + num + ".png";
                    suit = "bamboo";
                }else if(Math.floor(player.chupai[i] / 100) === 3){
                    titleStr = "M_dot_"+ num +".png";
                    suit = "dot";
                }else if(Math.floor(player.chupai[i] / 100) === 5 && num === 1){
                    titleStr = "M_red.png";
                    suit = "dragon";
                }else if(Math.floor(player.chupai[i] / 100) === 5 && num === 2){
                    titleStr = "M_green.png";
                    suit = "dragon";
                }else if(Math.floor(player.chupai[i] / 100) === 5 && num === 3){
                    titleStr = "M_white.png";
                    suit = "dragon";
                }

                var majiang = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame(titleStr));
                that._qiPai.push(majiang);


            }

            for(var i = 0; i < that._qiPai.length; i++){
                if(i < 11){
                    that._qiPai[i].attr({
                        x: that.width / 2 + (i - 5) * 44, y: 180,
                        scaleX: 0.8, scaleY: 0.8
                    });
                    that.addChild(that._qiPai[i], 2);
                } else if (i >= 11 && i < 22 ) {
                    that._qiPai[i].attr({
                        x: that.width / 2 + (i - 16) * 44, y: 230,
                        scaleX: 0.8, scaleY: 0.8
                    });
                    that.addChild(that._qiPai[i], 1);
                } else
                    return false;
            }

        }else if( position === "left"){
            var l_qiPai = [];

            for(var i = 0; i < player.chupai.length; i++){
                var titleStr;
                var num = player.chupai[i] % 10;
                var suit;
                if(Math.floor(player.chupai[i] / 100) === 1){
                    titleStr = "M_bamboo_" + num + ".png";
                    suit = "bamboo";
                }else if(Math.floor(player.chupai[i] / 100) === 3){
                    titleStr = "M_dot_"+ num +".png";
                    suit = "dot";
                }else if(Math.floor(player.chupai[i] / 100) === 5 && num === 1){
                    titleStr = "M_red.png";
                    suit = "dragon";
                }else if(Math.floor(player.chupai[i] / 100) === 5 && num === 2){
                    titleStr = "M_green.png";
                    suit = "dragon";
                }else if(Math.floor(player.chupai[i] / 100) === 5 && num === 3){
                    titleStr = "M_white.png";
                    suit = "dragon";
                }

                var majiang = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame(titleStr));
                that._qiPai.push(majiang);


            }


            do {
                var i = Math.floor( Math.random() * 10 );
                var y = 0;
                if(i > 0){
                    y++;
                    var l_majiang = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("L_bamboo_"+ i +".png"));
                    l_qiPai.push(l_majiang);
                }
            } while(l_qiPai.length < 18);

            cc.log("left qipai: " + l_qiPai.length);
            for(var i = 0; i < l_qiPai.length; i++){
                if(i < 11){
                    l_qiPai[i].attr({
                        x: 320, y: this.height / 2 - (i -8 )* 25,
                    });
                    this.addChild(l_qiPai[i], 2);
                } else if (i >= 11 && i < 22 ) {
                    l_qiPai[i].attr({
                        x: 368,  y: this.height / 2 - (i - 19) * 25
                    });
                    this.addChild(l_qiPai[i], 1);
                } else
                    return false;
            }

        }else if(position === "right"){

        }
    }


});