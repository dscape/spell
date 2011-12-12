#!/usr/bin/env node
var fs           = require('fs')
  , spell        = require('../../spell')
  , request      = require('../lib/request')
  , JSONStream   = require('../lib/JSONStream')
  , dict         = spell()
  , get_stream   =
    request('http://isaacs.couchone.com/registry/_all_docs?include_docs=true')
  , parse_stream = JSONStream.parse(['rows', /./, 'doc'])
  ;

get_stream.pipe(parse_stream);
parse_stream.on('data', function (module) {
  try {
  dict.load(JSON.stringify(module), {reset:false});
  if(module.name)
    dict.add_word(module.name, 10000); // a name is like a 10thousand words
  } catch (e) {
    console.log('!!! ', e);
    console.log('----', JSON.stringify(module));
  }
});
parse_stream.on('end', function () {
  console.log('> npm.json');
  fs.writeFileSync('npm.json', JSON.stringify(dict.export(),null,2));
});
