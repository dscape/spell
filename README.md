# spell

`spell` is a dictionary module for `node.js`. for an explanation of the algorithm, performance, expectations, and techniques used used please read [this article][norvig]

# installation

## node.js

1. install [npm]
2. `npm install spell`
3. `var spell = require('spell')`

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
dict.load('I am going to the park today. It's going to be great');
console.log(dict.suggest('te'));
```

should return

``` js
[{"word": "to", "score": 2}, {"word": "be", "score": "1"}]
```

as there are two occurrences of the word `to` and one of the word `be`

you can also `add` and `remove` words from the dictionary:

``` js
dict.remove_word('park');
dict.add_word('nuno');
```

and you can `reset` the dictionary, making it empty:

``` js
dict.reset();
```

## advanced

talk about giving a dictionary instead of words
talk about giving a weight to add word

## storage

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

[npm]: http://npmjs.org
[issues]: http://github.com/dscape/nano/issues
[caos]: http://caos.di.uminho.pt/
[norvig]: http://norvig.com/spell-correct.html