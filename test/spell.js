if (!spell) { var spell = require('../spell.js') }

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
      var exported;
      exported = readme["export"]();
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