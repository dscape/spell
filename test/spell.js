if (!spell) { // node 
  var spell  = require('../spell.js')
    , assert = require('assert')
    ;
}

describe('spell', function(){
  var corpora = 
      { readme : "I am going to the park today. It's going to be great" }
    , readme
    ;

  readme = spell();
  readme.load("I am going to the park with Theo today." +
              "It's going to be the bomb.");

  describe('#export()', function(){
    it('[readme] should be export the load', function() {
      var exported = readme["export"]();
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
      exported = dict["export"]();
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
      exported = dict["export"]();
      assert(exported.one   === 1);
      assert(exported.two   === 1);
      assert(exported.three === 1);
      assert(exported.four  === 1);
    });
    it('[readme] load with reseting', function() {
      var dict = spell()
        , exported
        ;
      dict.load("One Two Three.");
      dict.load({"corpus": "four", "reset": true });
      exported = dict["export"]();
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
      exported = dict["export"]();
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
      exported = dict["export"]();
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
      exported = dict["export"]();
      assert(exported.four  === 500);
    });
    it('[readme] add word with integer', function() {
      var dict = spell()
        , exported
        ;
      dict.add_word("test", 500);
      exported = dict["export"]();
      assert(exported.test === 500);
    });
    it('[readme] add word with string', function() {
      var dict = spell()
        , exported
        ;
      dict.add_word("test", "500");
      exported = dict["export"]();
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
      exported = dict["export"]();
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
      exported = JSON.stringify(dict["export"]());
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
  });
});