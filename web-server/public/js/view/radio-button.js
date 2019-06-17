/**
 * Radio按钮容器，继承cc.Menu
 * 保存容器中Radio item的相关信息
 * 包括容器中哪些item是radio item和选中的item
 * */
var RadioButton = cc.Menu.extend({
    _className: "Radio Button",
    _markedIndexArray: null,
    _defaultRadioIndex: -1,

    markRadioItem: function(markedIndexArray,defaultIndex){
        this._markedIndexArray = markedIndexArray;
        this._defaultRadioIndex = defaultIndex;

        //将Radio item的在menu中的index设置各个item的对象属性中
        for(var i = 0; i < this._markedIndexArray.length; i++){
            var y = this._markedIndexArray[i];
            this._children[y].setRadioItemIndex(y);
        }

        //初始化Radio按钮的item，设置defaultIndex的item为true，其他的为false
        this._children[defaultIndex].toggleButton();
    },

    getMarkedIndexArray: function(){
        return this._markedIndexArray;
    },

    getDefaultIndexOfArray: function(){
        return this._defaultRadioIndex;
    },

    setDefaultIndexOfArray: function(defaultIndex){
        this._defaultRadioIndex = defaultIndex;
    }
});