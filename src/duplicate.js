duplicate = function(original) {
    // make a copy of anything
    if(original == undefined
        || original.constructor == Number
        || original.constructor == Boolean
        || original.constructor == Symbol) {
        return original;
    } else if(original.constructor == String) {
        return original.slice();
    } else if( original.constructor == Array) {
        var arr = original.slice();
        for(var i in arr) {
            arr[i] = duplicate(arr[i]);
        }
        return arr;
    } else if( typeof original == "object") {
        return new original.constructor(original);
    }
    throw "duplicate failed for:" + original
}

module.exports = duplicate;
