/* javascript spell checker based on
*  http://norvig.com/spell-correct.html
 *
 * copyright 2011 nuno job       <nunojob.com> (oO)--',--
 *                pedro teixeira <metaduck.com>
 *
 * licensed under the apache license, version 2.0 (the "license");
 * you may not use this file except in compliance with the license.
 * you may obtain a copy of the license at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * unless required by applicable law or agreed to in writing, software
 * distributed under the license is distributed on an "as is" basis,
 * without warranties or conditions of any kind, either express or implied.
 * see the license for the specific language governing permissions and
 * limitations under the license.
 */
(function () {
  var root            = this
    , previous_spell  = root.spell
    ;

  /*
   * dictionary
   *
   * creates a dictionary given a place to store
   *
   * @param {dict_store:object:required} 
   *        object that implements two functions
   *          `get` to retrieve a stored dictionary from disk/memory
   *          `store` to store a dictionary from disk/memory
   *
   * @return {object} a dictionary module
   */
  var spell = function dictionary(dict_store) {
var default_dict = {}
  // if we have a dictionary already in store use it
  , dict          = dict_store && typeof dict_store.get === 'function' ?
      dict_store.get() : default_dict
  , noop          = function(){}
  , alphabet      = "abcdefghijklmnopqrstuvwxyz".split("")
  ;

function spell_store(cb) { 
  if (dict_store && typeof dict_store.store === 'function') {
    dict_store.store(dict, cb);
  }
}

function spell_train(corpus,regex) {
  var match, word;
  regex         = regex || /[a-z]+/g;
  corpus        = corpus.toLowerCase();
  while ((match = regex.exec(corpus))) {
    word        = match[0];
    spell_add_word(word, 1);
  }
}

function spell_edits(word) {
  var edits = []
    , i
    , j
    ;
  for (i=0; i < word.length; i++) {  // deletion
    edits.push(word.slice(0, i) + word.slice(i+1));
  }
  for (i=0; i < word.length-1; i++) { // transposition
    edits.push( word.slice(0, i) + word.slice(i+1, i+2) + 
      word.slice(i, i+1) + word.slice(i+2));
  }
  for (i=0; i < word.length; i++) {  // alteration
    for(j in alphabet) { 
      edits.push(word.slice(0, i) + alphabet[j] + word.slice(i+1)); 
    }
  }
  for (i=0; i <= word.length; i++) { // insertion
    for(j in alphabet) { 
      edits.push(word.slice(0, i) + alphabet[j] + word.slice(i));
    }
  }
  return edits;
}

function is_empty(obj) { 
  for (var key in obj) { if (obj.hasOwnProperty(key)) return false; }
  return true;
}

function spell_order(candidates, min, max) {
  var ordered_candidates = []
    , current
    , i
    , w
    ;
  for(i=max; i>=min; i--) {
    if(candidates.hasOwnProperty(i)) {
      current = candidates[i];
      for (w in current) {
        if(current.hasOwnProperty(w)) {
          ordered_candidates.push({"word": w, "score": i});
        }
      }
    }
  }
  return ordered_candidates;
}

/*
 * reset
 *
 * resets the dictionary.
 *
 * e.g.
 * spell.reset();
 *
 * @return void
 */
function spell_reset() { return spell_load({reset: true}); }

/*
 * load
 *
 * loads a free form corpus dictionary.
 *
 * e.g.
 * spell.load({'dog': 1, 'cat': 2});
 * spell.load('dog cat cat');
 *
 * @param {opts.corpus:string|object:optional} 
 *        corpus string to initialize to
 * @param {opts.reset:boolean:optional}
 *        whether you want to reset the existing dictionary or just append
 *        to what already exists
 * @param {opts.store:boolean:optional}
 *        decide if you want to use storage
 * @param {opts.after_store:function:optional} 
 *        function to call back when store is done
 *
 * @return void
 */
function spell_load(opts) {
  if ('string' === typeof opts) { opts = {corpus: opts }; }
  opts               = 'object' === typeof opts ? opts : {};
  opts.reset         = opts.reset         || true;
  opts.store         = opts.store         || true;
  opts.after_store   = opts.after_store   || noop;
  opts.corpus        = opts.corpus        || '';
  if(opts.reset) { dict  = default_dict; }
  if('object' === typeof opts.corpus) {
    for(var key in corpus) { spell_add_word(key, opts.corpus[key]); }
  } else { spell_train(opts.corpus); }
  if(opts.store) { spell_store(opts.after_store); }
}

/*
 * add word
 *
 * loads a word into the dictionary
 *
 * e.g.
 * spell.insert_word('dog', 5);
 *
 * @param {word:string:required} 
 *        the word you want to add
 * @param {opts.count:int:optional}
 *        the number of times the word appears in a text, defaults to one
 * @param {opts.store:boolean:optional}
 *        decide if you want to use storage
 * @param {opts.done:function:optional} 
 *        function to call back when store is done
 *
 * @return void
 */
function spell_add_word(word, opts) {
  opts        = 'object' === typeof opts ? opts : {};
  opts.count  = opts.count  || 1;
  opts.store  = opts.store  || true;
  opts.done   = opts.done   || noop;
  word        = word.toLowerCase();
  dict[word]  = 
    dict.hasOwnProperty(word) ? dict[word] + opts.count : opts.count;
  if(opts.store) { spell_store(opts.done); }
}

/*
 * remove word
 *
 * removes word from the dictionary
 *
 * e.g.
 * spell.remove_word('dog');
 *
 * @param {word:string:required} 
 *        the word you want to add
 * @param {opts.store:boolean:optional}
 *        decide if you want to use storage
 * @param {opts.done:function:optional} 
 *        function to call back when store is done
 *
 * @return void
 */
function spell_remove_word(word,opts) {
  opts        = 'object' === typeof opts ? opts : {};
  opts.store  = opts.store  || true;
  opts.done   = opts.done   || noop;
  if (dict.hasOwnProperty(word)) { delete dict[word]; }
  if(opts.store) { spell_store(opts.done); }
}

/*
 * suggest
 *
 * returns spelling sugestions for a given word
 *
 * e.g.
 * spell.suggest('speling');
 *
 * @param {word:string:required} 
 *        the word you want to spell check
 *
 * @return {array} ordered array containing json objects such as
 *                 [{"word": "spelling", "score": 10}]
 */
function spell_suggest(word) {
  if (dict.hasOwnProperty(word)) {
    return [{"word":word, "score": dict[word]}]; 
  }
  var edits1     = spell_edits(word)
    , candidates = {}
    , min
    , max
    , current_count
    ;
  function get_candidates(word) {
    if(dict.hasOwnProperty(word)) {
      current_count = dict[word];
      if (candidates.hasOwnProperty(current_count)) {
        candidates[current_count][word] = true;
      } else {
        candidates[current_count] = {};
        candidates[current_count][word] = true;
      }
      max = max ? (max < current_count ? current_count : max) : current_count;
      min = min ? (min > current_count ? current_count : min) : current_count;
    }
  }
  edits1.forEach(get_candidates);
  if(!is_empty(candidates)) { return spell_order(candidates,min,max); }
  edits1.forEach(function(edit1){
    spell_edits(edit1).forEach(get_candidates);
  });
  if(!is_empty(candidates)) { return spell_order(candidates,min,max); }
  return []; // no suggestions
}

/*
 * feeling lucky
 *
 * returns the first spelling correction for a word
 *
 * e.g.
 * spell.lucky('speling');
 *
 * @param {word:string:required} 
 *        the word you want to spell check
 *
 * @return {string} the most likely match
 */
function spell_lucky(word) {
  var suggest = spell_suggest(word)[0];
  if(suggest.hasOwnProperty("word")) {
    return suggest.word;
  }
  return;
}

/*
 * export
 *
 * exports the dictionary
 *
 * e.g.
 * spell.export();
 *
 * @return {json} dictionary
 */
function spell_export(word) {
  return dict;
}

return { reset       : spell_reset
       , load        : spell_load
       , "export"    : spell_export
       , add_word    : spell_add_word
       , remove_word : spell_remove_word
       , suggest     : spell_suggest
       , lucky       : spell_lucky
       };
  };

  spell._previous = previous_spell;
  if (typeof exports !== 'undefined') { // nodejs
    spell.platform     = { name: "node.js", version: process.version };
    spell.version      = JSON.parse(
      require('fs').readFileSync(__dirname + "/package.json")).version;
    spell.path         = __dirname;
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = spell;
    }
    exports.spell = spell;
  } else { // browser
    // browser detection is possible in the future
    spell.platform     = { name: "browser" };
    spell.version      = "0.0.1";
    if (typeof define === 'function' && define.amd) {
      define('spell', function() { return spell; });
    } 
    else {
      root.spell = spell; 
    }
  }
})();