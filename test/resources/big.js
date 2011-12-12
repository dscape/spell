#!/usr/bin/env node
var fs    = require('fs')
  , spell = require('../../spell')
  , big   = fs.readFileSync('big.txt').toString()
  , dict  = spell()
  ;

dict.load(big);
fs.writeFileSync('big.json', JSON.stringify(dict.export(),null,2));