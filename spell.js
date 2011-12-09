/* javascript spell checker based on
*  http://norvig.com/spell-correct.html
 *
 * copyright 2011 nuno job <nunojob.com> (oO)--',--
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
  // dictionary is a object with two functions
  // `get` to retrieve a stored dictionary from disk/memory
  // `store` to store a dictionary from disk/memory
  function dict(dictionary) {
var default_spell = {}
  // if we have a dictionary already in disk use it
  , spell         = dictionary.get() || default_spell
  , noop          = function(){}
  ;

function spell_store(cb) { dictionary.store(spell, cb); }

function spell_train(corpus,regex) {
  var match, word;
  regex         = regexp || /[a-z]+/g;
  corpus        = corpus.toLowerCase();
  while ((match = regex.exec(corpus))) {
    word              = match[0];
    spell_insert_word(word);
  }
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
  if(opts.reset) { spell  = default_spell; }
  if('object' === typeof opts.corpus) {
    for(var key in corpus) { spell_insert_word(key, opts.corpus[key]); }
  } else { spell.train(opts.corpus); }
  if(opts.store) { spell_store(opts.done); }
}

/*
 * insert_word
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
  spell[word] = spell[word] ? spell[word] + opts.count : opts.count;
  if(opts.store) { spell_store(opts.done); }
}

/*
 * removes
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
  if (spell[word]) { delete spell[word]; }
  if(opts.store) { spell_store(opts.done); }
}

function spell_suggest(word) {
  
}

return { reset       : spell_reset
       , load        : spell_load
       , add_word    : spell_add_word
       , remove_word : spell_remove_word
       , suggest     : spell_suggest
       };
}
})();