if (!spell) { // node 
  var spell  = require('../spell.js')
    , assert = require('assert')
    , fs     = require('fs')
    , big    = JSON.parse(fs.readFileSync(__dirname + '/resources/big.json'))
    , PERF1  = require('./resources/perf1')
    , PERF2  = require('./resources/perf2')
    ;
} else {
  var big = BIG;
}

function quality(name) {
  var dict      = spell()
    , n         = 0
    , bad       = 0
    , unknown   = 0
    , tests     = (name === '2') ? PERF2 : PERF1
    , target
    , start
    , exported
    ;

  dict.load({ corpus: big });
  exported = dict['export']().corpus;

  for (target in tests) {
    if (tests.hasOwnProperty(target)) {
      var wrongs = tests[target];
      wrongs.split(/\s+/).forEach(function(wrong) {
        n++;
        var w = dict.lucky(wrong);
        if (w !== target) {
          bad++;
          if (!exported.hasOwnProperty(target)) {
            unknown++;
          }
        }
      });
    }
  }

  return { "bad": bad, "n": n, "unknown" : unknown };
}

describe('spell', function(){
  var readme;

  readme = spell();
  readme.load("I am going to the park with Theo today." +
              "It's going to be the bomb.");

  describe('#export()', function(){
    it('[readme] should be export the load', function() {
      var exported = readme["export"]().corpus;
      assert(exported.i         === 1);
      assert(exported.am        === 1);
      assert(exported.going     === 2);
      assert(exported.to        === 2);
      assert(exported.the       === 2);
      assert(exported.park      === 1);
      assert(exported.be        === 1);
      assert(exported.bomb      === 1);
      assert(exported.theo      === 1);
      assert(exported["with"]   === 1);
    });
  });

  describe('#load()', function(){
    it('[readme] should be able to read json', function() {
      var dict = spell()
        , exported
        ;
      dict.load(
        { corpus: 
          { "I"     : 1
          , "am"    : 1
          , "going" : 1
          , "to"    : 2
          , "the"   : 1
          , "park"  : 1
          }
      });
      exported = dict["export"]().corpus;
      assert(exported.i     === 1);
      assert(exported.am    === 1);
      assert(exported.going === 1);
      assert(exported.to    === 2);
      assert(exported.the   === 1);
      assert(exported.park  === 1);
    });
    it('[readme] load without reseting', function() {
      var dict = spell()
        , exported
        ;
      dict.load("One Two Three.");
      dict.load({"corpus": "four", "reset": false });
      exported = dict["export"]().corpus;
      assert(exported.one   === 1);
      assert(exported.two   === 1);
      assert(exported.three === 1);
      assert(exported.four  === 1);
    });
    it('[iso] load and export should work together', function () {
      var dict    = spell()
        , another = spell()
        , exported
        ;
      dict.load({"corpus": "four"});
      another.load(dict['export']());
      assert(JSON.stringify(another['export']() === dict['export']()));
    });
    it('[readme] load with reseting', function() {
      var dict = spell()
        , exported
        ;
      dict.load("One Two Three.");
      dict.load({"corpus": "four", "reset": true });
      exported = dict["export"]().corpus;
      assert(exported.one   !== 1);
      assert(exported.two   !== 1);
      assert(exported.three !== 1);
      assert(exported.four  === 1);
    });
    it('[readme] load with first param string', function() {
      var dict = spell()
        , exported
        ;
      dict.load("One Two Three.");
      dict.load("four", { "reset": false });
      exported = dict["export"]().corpus;
      assert(exported.one   === 1);
      assert(exported.two   === 1);
      assert(exported.three === 1);
      assert(exported.four  === 1);
    });
  });

  describe('#add_word()', function(){
    it('[readme] basic usage', function() {
      var dict = spell()
        , exported
        ;
      dict.load("One Two Three.");
      dict.add_word("Four");
      exported = dict["export"]().corpus;
      assert(exported.one   === 1);
      assert(exported.two   === 1);
      assert(exported.three === 1);
      assert(exported.four  === 1);
    });
    it('[readme] setting score', function() {
      var dict = spell()
        , exported
        ;
      dict.add_word("Four", {score: 500});
      exported = dict["export"]().corpus;
      assert(exported.four  === 500);
    });
    it('[readme] add word with integer', function() {
      var dict = spell()
        , exported
        ;
      dict.add_word("test", 500);
      exported = dict["export"]().corpus;
      assert(exported.test === 500);
    });
    it('[readme] add word with string', function() {
      var dict = spell()
        , exported
        ;
      dict.add_word("test", "500");
      exported = dict["export"]().corpus;
      assert(exported.test === 500);
    });
  });

  describe('#remove_word()', function(){
    it('[readme] removing word', function() {
      var dict = spell()
        , exported
        ;
      dict.load('the game');
      dict.remove_word("the");
      exported = dict["export"]().corpus;
      assert(exported.game  === 1);
      assert(exported.the   === undefined);
    });
  });

  describe('#reset()', function(){
    it('[readme] reset should clean contents of dict', function() {
      var dict = spell()
        , exported
        ;
      dict.load({corpus: readme["export"]()});
      dict.reset();
      exported = JSON.stringify(dict["export"]().corpus);
      assert(exported   === '{}');
    });
  });

  describe('#suggest()', function(){
    it('[readme] `suggest` `the` for `thew`', function() {
      var suggest = readme.suggest("thew");
      assert(suggest[0].word  === "the");
      assert(suggest[0].score === 2);
      assert(suggest[1].word  === "theo");
      assert(suggest[1].score === 1);
    });
    it('[readme] correct word that exists should return the word', function(){
      var suggest = readme.suggest("the");
      assert(suggest[0].word  === "the");
      assert(suggest[0].score === 2);
      assert(suggest.length   === 1);
    });
    it('[readme] first `suggest` should match `lucky`', function(){
      var suggest = readme.suggest("thew")
        , lucky   = readme.lucky("the")
        ;
      assert(suggest[0].word  === readme.lucky("the"));
    });
    it('[npm] should be able to suggest w/ customer alphabets', function () {
      var npm     = spell()
        , suggest
        ;
      npm.load({corpus: {"uglify": 1, "uglify-js": 1}});
      suggest = npm.suggest('uglifyjs',
        "abcdefghijklmnopqrstuvwxyz-".split(""));
      assert(suggest[0]. word === 'uglify-js');
      assert(suggest[0].score === 1);
    });
  });

  describe('#lucky()', function(){
    it('[readme] with empty dict', function() {
      var dict    = spell()
        , lucky = dict.lucky("testing")
        ;
      assert(lucky  === undefined);
    });
  });

  describe('#storage', function () {
    it('[readme] should be able to store and load from storage', function(){
      var err
        , dict
        , dict_clone
        , dict_not_clone
        , exported
        , exported_not_clone
        , node       = (typeof exports !== 'undefined')
        , global_var = node ? global : window
        , storage    =
          { "get"   : function () {
                try         { return JSON.parse(global_var._test_spell); }
                catch (err) { return {}; }
              }
          , "store" : function (dict,after_store) {
              try          { global_var._test_spell = JSON.stringify(dict); }
              catch (err)  { return {}; }
              }
          }
        ;
      dict           = spell(storage);
      dict.load("tucano second skin", {store: true});
      dict_clone     = spell(storage);
      dict_not_clone = spell();
      exported           = dict_clone["export"]().corpus;
      exported_not_clone = dict_not_clone["export"]().corpus;
      assert(exported.tucano   === 1);
      assert(exported.second   === 1);
      assert(exported.skin     === 1);
      assert(exported_not_clone.tucano   !== 1);
      assert(exported_not_clone.second   !== 1);
      assert(exported_not_clone.skin     !== 1);
      delete global_var._test_spell; // clean up
    });
  });

  describe('#quality', function(){
    it('[perf1] less than 68 bad, 15 unknown', function() {
      var results = quality('1');
      assert(results.bad     <    69);
      assert(results.unknown <    16);
      assert(results.n       === 270);
    });
    it('[perf2] less than 130 bad, 43 unknown', function() {
      var results = quality('2');
      assert(results.bad     <   131);
      assert(results.unknown <    44);
      assert(results.n       === 400);
    });
  });
});