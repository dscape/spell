# spell

`spell` is a dictionary module for `node.js`. for an explanation of the algorithm, performance, expectations, and techniques used please read [this article][norvig] 

# installation

## node.js

1. install [npm]
2. `npm install spell`
3. `var spell = require('spell');`

## browser

1. minimize spell.js
2. load it into your webpage

# usage

## basics

``` js
// instantiate a new dictionary
var dict = spell();
// load text into dictionary so we can train the dictionary to know
// which words exists and which ones are more frequent than others
dict.load("I am going to the park with Theo today. It's going to be the bomb");
console.log(dict.suggest('thew'));
```

normally you would generate the dictionary once and then re-use it so this code is unlikely  and serves for demonstration purposes only. this should log:

``` js
[{"word": "the", "score": 2}, {"word": "theo", "score": 1}]
```

as there are two occurrences of the word `the` and one of the word `theo`

feeling lucky?

``` js
dict.lucky('thew');
```

returns

``` js
"the"
```

you can also `add` and `remove` words from the dictionary:

``` js
dict.remove_word('park');
dict.add_word('nuno');
```

and you can `reset` the dictionary, making it empty:

``` js
dict.reset();
```

if you want to export the dictionary:

``` js
dict.export();
```

## advanced

when loading you can provide a compiled dictionary instead of free form text

``` js
dict.load(
  { corpus: 
    { "I"     : 1
    , "am"    : 1
    , "going" : 1
    , "to"    : 2
    , "the"   : 1
    , "park"  : 1
    }
  }
);
```

you can also provide options:

* `reset`, defaults to true, meaning it will reset the dictionary before running load
* `store`, defaults to true, meaning it will store the dictionary after running load
* `after_store`, defaults to empty function, the callback function to run after `store` is done

e.g. to add text to an existing `dict` you could do:

``` js
dict.load("Better yet, chocolate", { reset: false } );
```

finally when adding words you can optionally give it a score:

``` js
dict.add_word('beer', {score: 100});
```

if you are working with words that include punctuation in your dictionary you might need to override the alphabet that is being used. e.g. you might want to add `.` & `@` if you have a dictionary of email address. you can do that by:

``` js
// instantiate a new dictionary
var dict = spell();
// load text into dictionary so we can train the dictionary to know
// which words exists and which ones are more frequent than others
dict.load("nuno@dino.saur pedro@space.ship");
console.log(dict.suggest('nuno@dino.sau',
  "abcdefghijklmnopqrstuvwxyz.@".split("")
));
```

## storage

by default `dict` is stored in process (memory) for each dictionary instance you create. however if you feel like storing the dictionary externally, or use a shared dictionary, you can:

an example using `localStorage`:

``` js
var dict = spell(
  { "get"   : function () { 
                JSON.parse(window.localStorage.getItem('dict')); 
              }
  , "store" : function (dict,after_store) { 
                window.localStorage.setItem('dict', JSON.stringify(dict));
              }
  }
);
```

# roadmap

check [issues]

# contribute

everyone is welcome to contribute. patches, bug-fixes, new features

1. create an [issue][issues] so the community can comment on your idea
2. fork `spell`
3. create a new branch `git checkout -b my_branch`
4. create tests for the changes you made
5. make sure you pass both existing and newly inserted tests
6. commit your changes
7. push to your branch `git push origin my_branch`
8. create an pull request

# meta

* code: `git clone git://github.com/dscape/spell.git`
* home: <http://github.com/dscape/spell>
* bugs: <http://github.com/dscape/spell/issues>
* build: [![build status](https://secure.travis-ci.org/dscape/spell.png)](http://travis-ci.org/dscape/spell)

`(oO)--',-` in [caos]

<a name="license"/>
# license

copyright 2012 nuno job <nunojob.com> `(oO)--',--`

licensed under the apache license, version 2.0 (the "license");
you may not use this file except in compliance with the license.
you may obtain a copy of the license at

    http://www.apache.org/licenses/LICENSE-2.0

unless required by applicable law or agreed to in writing, software
distributed under the license is distributed on an "as is" basis,
without warranties or conditions of any kind, either express or implied.
see the license for the specific language governing permissions and
limitations under the license

[npm]: http://npmjs.org
[issues]: http://github.com/dscape/spell/issues
[caos]: http://caos.di.uminho.pt/
[norvig]: http://norvig.com/spell-correct.html
