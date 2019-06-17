/**
 ** radio item继承cc.MenuItemToggle，它只是一个Radio按钮，不包括Label
 * Radio item的动作将影响同一个Radio容器中的item的状态
 * */
var RadioButtonItem = cc.MenuItemToggle.extend({
    _radioStatus: false,
    _indexOfRadioButton: -1,
    _className: "Radio button item",

    //此处重载；在Radio按钮中触及的按钮应该是激活状态而不是转换状态，因此只有当按钮由false转换至true时，按钮的状态才
    // 改变。
    activate: function(){
        if (this._enabled && (this.getSelectedIndex() === 0)){
            this.setSelectedIndex(1);
            //this.setRadioStatus(true);

            this.parent.setDefaultIndexOfArray(this.getRadioItemIndex());
            //所在Radio按钮组的item的状态
            this.toggleButton();

        }
        cc.MenuItem.prototype.activate.call(this);
    },

    //Radio按钮组，当一个按钮状态转换时，更改其他的radio按钮item的状态。
    //Radio按钮的触发事件是radio item触发的，因此触发事件后更改radiao的其他item的状态由触发raido item的函数执行
    toggleButton: function(){
        var indexArray = this.parent.getMarkedIndexArray();
        var allArray = this.parent.getChildren();

        for(var i = 0; i < indexArray.length; i++){
            var y = indexArray[i];
            //可能有问题，涉及到this
            if(y != this._indexOfRadioButton){
                allArray[y].setSelectedIndex(0);
                //allArray[y].setRadioStatus(false);
                cc.log("index " +allArray[y].getRadioItemIndex() +  " status is " + allArray[y].getRadioStatus());
            }
        }

        cc.log("default index " + this.parent.getDefaultIndexOfArray());

    },

    setSelectedIndex: function (SelectedIndex) {
        if (SelectedIndex !== this._selectedIndex) {
            this._selectedIndex = SelectedIndex;
            var currItem = this.getChildByTag(cc.CURRENT_ITEM);
            if (currItem)
                currItem.removeFromParent(false);

            var item = this.subItems[this._selectedIndex];
            this.addChild(item, 0, cc.CURRENT_ITEM);
            var w = item.width, h = item.height;
            this.width = w;
            this.height = h;
            item.setPosition(w / 2, h / 2);

            //修改Radio状态
            if(SelectedIndex === 1){
                this.setRadioStatus(true);
            } else if (SelectedIndex === 0) {
                this.setRadioStatus(false);
            }
        }
    },

    setRadioStatus: function(status){
        this._radioStatus = status;
    },

    getRadioStatus: function(){
        return this._radioStatus;
    },

    setRadioItemIndex: function(index){
        this._indexOfRadioButton = index;
    },

    getRadioItemIndex: function(){
        return this._indexOfRadioButton;
    }
});