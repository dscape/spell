#!/usr/bin/env node
var spell    = require('../spell.js')
  , fs       = require('fs')
  , dict     = spell()
  , set1     = require('./resources/perf1')
  , set2     = require('./resources/perf2')
  , n        = 0
  , bad      = 0
  , unknown  = 0
  , start
  , tests    = process.argv[2] === '2' ? set2 : set1
  , exported
  ;

dict.load(
  {corpus: JSON.parse(fs.readFileSync(__dirname + '/resources/big.json')) });
exported = dict.export();
start    = new Date();

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

console.log(
  { "bad"     : bad
  , "n"       : n
  , "bias"    : 0
  , "pct"     : ((100-100*bad/n)).toFixed(0)
  , "unknown" : unknown
  , "secs"    : ((new Date()-start)/1000).toFixed(0)
  }
);