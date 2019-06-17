/**
 * Created by Whoo on 2019/2/27.
 */
var logger = require("pomelo-logger").getLogger("test", __filename);
var roomNumber = [];
var tilesArray = [];

module.exports.generateRoomNumber = function(){
    var number = 0;

    do{
        number = Math.floor(Math.random() * (99999)) + 1;
        logger.info("-- number = %s; roomNumber = %j", number, roomNumber);
    }while(roomNumber.indexOf(number) !== -1);

    roomNumber.push(number);

    return number;
};

// [min, max]
module.exports.RandomNumBoth = function (Min,Max){
    var Range = Max - Min;
    var Rand = Math.random();
    var num = Min + Math.round(Rand * Range); //四舍五入
    return num;
};

module.exports.shuffleTiles = function () {
    var initTilesArray = [
        101,102,103,104,105,106,107,108,109,    //条
        111,112,113,114,115,116,117,118,119,
        121,122,123,124,125,126,127,128,129,
        131,132,133,134,135,136,137,138,139,
        /*201,202,203,204,205,206,207,208,209,    //万
        211,212,213,214,215,216,217,218,219,
        221,222,223,224,225,226,227,228,229,
        231,232,233,234,235,236,237,238,239,*/
        301,302,303,304,305,306,307,308,309,    //筒
        311,312,313,314,315,316,317,318,319,
        321,322,323,324,325,326,327,328,329,
        331,332,333,334,335,336,337,338,339,
        /*401,402,403,404,                        //风牌 1东 2南 3西 4北
        411,412,413,414,
        421,422,423,424,
        431,432,433,434,*/
        501,502,503,                            //箭牌 1中 2发 3白
        511,512,513,
        521,522,523,
        531,532,533
        /*601,602,603,604,                        //春夏秋冬
        611,612,613,614                         //梅兰竹菊*/
    ];

    if(tilesArray.length < 10) {
        tilesArray = initTilesArray;
    }

    tilesArray = shuffle(tilesArray);

    return tilesArray;
};

function shuffle(array) {
    var m = array.length, t, i;

    // 如果还剩有元素…
    while (m) {
        // 随机选取一个元素…
        i = Math.floor(Math.random() * m--);
        // 与当前元素进行交换
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}