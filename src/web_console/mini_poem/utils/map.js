/**
 * Created by Strawmanbobi
 * 2014-03-14
 */

var Map = function() {
    this.elements = [];
};

Map.prototype.size = function() {
    return this.elements.length;
};

Map.prototype.isEmpty = function() {
    return (this.elements.length < 1);
};

Map.prototype.clear = function() {
    this.elements = [];
};

Map.prototype.put = function(_key, _value) {
    this.elements.push( {
        key : _key,
        value : _value
    });
};

Map.prototype.remove = function(_key) {
    var bln = false;
    try {
        for (i = 0; i < this.elements.length; i++) {
            if (this.elements[i].key == _key) {
                this.elements.splice(i, 1);
                return true;
            }
        }
    } catch (e) {
        bln = false;
    }
    return bln;
};

Map.prototype.get = function(_key) {
    try {
        for (i = 0; i < this.elements.length; i++) {
            if (this.elements[i].key == _key) {
                return this.elements[i].value;
            }
        }
    } catch (e) {
        return null;
    }
};

Map.prototype.set = function(_key, _value) {
    for(i = 0; i < this.elements.length; i++) {
        if (this.elements[i].key == _key) {
            this.elements[i].value = _value;
            return;
        }
    }
    this.elements.push({
        key : _key,
        value : _value
    });
};

Map.prototype.element = function(_index) {
    if (_index < 0 || _index >= this.elements.length) {
        return null;
    }
    return this.elements[_index];
};

Map.prototype.containsKey = function(_key) {
    var bln = false;
    try {
        for (i = 0; i < this.elements.length; i++) {
            if (this.elements[i].key == _key) {
                bln = true;
            }
        }
    } catch (e) {
        bln = false;
    }
    return bln;
};

Map.prototype.containsValue = function(_value) {
    var bln = false;
    try {
        for (i = 0; i < this.elements.length; i++) {
            if (this.elements[i].value == _value) {
                bln = true;
            }
        }
    } catch (e) {
        bln = false;
    }
    return bln;
};

Map.prototype.values = function() {
    var arr = [];
    for (i = 0; i < this.elements.length; i++) {
        arr.push(this.elements[i].value);
    }
    return arr;
};

Map.prototype.keys = function() {
    var arr = [];
    for (i = 0; i < this.elements.length; i++) {
        arr.push(this.elements[i].key);
    }
    return arr;
};

module.exports = Map;