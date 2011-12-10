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
    , spell
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
  function dictionary(dict_store) {
var default_dict = {}
  // if we have a dictionary already in disk use it
  , dict          = dict_store.get() || default_dict
  , noop          = function(){}
  , alphabet      = "abcdefghijklmnopqrstuvwxyz".split("")
  ;

function spell_store(cb) { dict_store.store(dict, cb); }

function spell_train(corpus,regex) {
  var match, word;
  regex         = regexp || /[a-z]+/g;
  corpus        = corpus.toLowerCase();
  while ((match = regex.exec(corpus))) {
    word        = match[0];
    spell_insert_word(word, 1);
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

function is_empty(object) { 
  for (var key in obj) { if (hasOwnProperty.call(obj, key)) return false; }
  return true;
}

function spell_order(candidates, min, max) {
  var ordered_candidates = []
    , current
    , i
    , j
    ;
  for(i=max; i>=min; i--) {
    if(candidates.hasOwnProperty(i)) {
      current = candidates[i];
      for (j in current) { 
        ordered_candidates.push({"word": current, "score": i});
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
 * @param {opts.done:function:optional} 
 *        function to call back when store is done
 *
 * @return void
 */
function spell_load(opts) {
  opts        = 'object' === typeof opts ? opts : {};
  opts.reset  = opts.reset  || true;
  opts.store  = opts.store  || true;
  opts.done   = opts.done   || noop;
  opts.corpus = opts.corpus || '';
  if(opts.reset) { dict  = default_dict; }
  if('object' === typeof opts.corpus) {
    for(var key in corpus) { spell_insert_word(key, opts.corpus[key]); }
  } else { spell_train(opts.corpus); }
  if(opts.store) { spell_store(opts.done); }
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
  dict[word] = 
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
  if (dict.hasOwnProperty(word)) { return word; }
  var edits1     = spell_edits(word)
    , candidates = {}
    , min
    , max
    , current_count
    ;
  function get_candidates(word) {
    if(dict.hasOwnProperty(word)) {
      current_count = dict[word];
      candidates[current_count] = candidates.hasOwnProperty(current_count) ?
        candidates[current_count].push(word) : [word];
      max = max ? (max < current_count ? current_count : max) : current_count;
      min = min ? (min > current_count ? min : current_count) : current_count;
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

return { reset       : spell_reset
       , load        : spell_load
       , add_word    : spell_add_word
       , remove_word : spell_remove_word
       , suggest     : spell_suggest
       };
}
})();