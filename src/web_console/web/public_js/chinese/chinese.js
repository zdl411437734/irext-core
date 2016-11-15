function Trie(key) {
  this.key = key;
  this.value;
}

Trie.prototype.put = function (name, value) {

  var node = this,
    nameLength = name.length,
    i = 0,
    currentLetter;

  for (i = 0; i < nameLength; i++) {
    currentLetter = name[i];
    node = node[currentLetter] || (node[currentLetter] = new Trie(currentLetter));
  }

  node.value = value;
  node.name = name;

};

Trie.prototype.get = function (name) {
  var node = this,
    nameLength = name.length,
    i, node;

  for (i = 0; i < nameLength; i++) {
    if (!(node = node[name[i]])) break;
  }

  return (i === nameLength) ? node.value : null;
};

function Chinese() {
}

Chinese.prototype.loaded = await("dict-loaded");
Chinese.prototype.dictionary = new Trie();

Chinese.prototype.toEnglish = function(value) {
  var entry = this.getFirstMatchingEntry(value);

  if(entry) {
    return entry["en"];
  }
  return null;
};

Chinese.prototype.toPinyin = function(value) {
  var result = "";
  var pos = 0;

  while(true) {
    var currentChar = value[pos];
    if(!currentChar) {
      break;
    }

    if(!(currentChar.charCodeAt(0) >= 19968 && currentChar.charCodeAt(0) <= 64041)) {
      // It's not a chinese character
      result += currentChar;
      pos += 1;
    }
    else {
      // It's a chinese character. start by trying to find a long word match,
      // and if it fails, all the way down to a single hanzi.
      var match = null;
      var match_length = 0;

      for(var j = 4; j > 0; j--) {
        match = this.getFirstMatchingEntry(value.substring(pos, pos + j));
        match_length = j;
        if(match) {
          break;
        }
      }

      if(match && match["pin"]) {
        result += match["pin"].replace(/\s/g, '');
        pos += match_length;
      }
      else {
        result += currentChar;
        pos += 1;
      }
    }
  }

  return result;
};

Chinese.prototype.toTraditional = function(value) {
  var entry = this.getFirstMatchingEntry(value);

  if(!entry) {
    return null;
  }

  return entry["trad"];
}

Chinese.prototype.toSimplified = function(value) {
  var entry = this.getFirstMatchingEntry(value);

  if(!entry) {
    return null;
  }

  return entry["simp"];
}

Chinese.prototype.determineBeginningWord = function(value) {
  for(var i = value.length; i > 0; i--) {
    var entry = this.getFirstMatchingEntry(value.substring(0, i));
    if(entry) {
      return i;
    }
  }

  return 0;
}

Chinese.prototype.getFirstMatchingEntry = function(value) {
  return this.dictionary.get(value + "0");
}

Chinese.prototype.getMatchingEntries = function(value) {
  var results = new Array();
  var index = 0;
  while(true) {
    var entry = this.dictionary.get(value + index.toString());
    if(!entry) {
      break;
    }

    results.push(entry);
    index += 1;
  }

  return results;
}


$.get('src/cedict_ts.u8', function(myContentFile) {
  var lines = myContentFile.split("\r\n");

  // Build a simple Trie structure
  for(var i = 0; i < lines.length; i++) {
    // Skip empty lines and comments
    if(!lines[i] || lines[i] === "" || lines[i].substring(0, 1) === "#") {
      continue;
    }

    // CC-CEDICT format:
    // Traditional Simplified [pin1 yin1] /English equivalent 1/equivalent 2/
    var line_data = {};

    // Parse the dictionary entry into its respective parts
    var results = [];
    results = lines[i].split(" ", 2);
    line_data["trad"] = results[0] ;
    line_data["simp"] = results[1];

    lines[i] = lines[i].substring(lines[i].indexOf("[") + 1, lines[i].length);

    line_data["pin"] = lines[i].substring(0, lines[i].indexOf("]"));
    line_data["en"] = lines[i].substring(lines[i].indexOf("/") + 1, lines[i].lastIndexOf("/"));

    var existingCountSimplified = 0;
    if(Chinese.prototype.dictionary.get(line_data["simp"] + "0")) {
      existingCountSimplified = Chinese.prototype.getMatchingEntries(line_data["simp"]).length;
    }
    Chinese.prototype.dictionary.put(line_data["simp"] + existingCountSimplified.toString(), line_data);

    if(line_data["simp"] !== line_data["trad"] + "0") {
      // also add lookup for this entry via trad word
      var existingCountTraditional = 0;
      if(Chinese.prototype.dictionary.get(line_data["trad"])) {
        existingCountTraditional = Chinese.prototype.getMatchingEntries(line_data["trad"]).length;
      }

      Chinese.prototype.dictionary.put(line_data["trad"] + existingCountTraditional.toString(), line_data);
    }
  }

  Chinese.prototype.loaded.keep("dict-loaded");
}, 'text');
