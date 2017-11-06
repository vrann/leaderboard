"use strict";

const teamSync = require("../team-sync.js")
const assert = require('assert');
const winston = require('winston')
const githubBuilder = require('../github-builder.js')

var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({
        colorize: true,
        level: 'debug',
        prettyPrint: function ( object ){
            return JSON.stringify(object);
        }
      })
    ]
  });

  const gitHubToken = process.env.GIT_HUB_KEY;
  const github = githubBuilder(gitHubToken)

  teamSync.teamSyncFactory(github, logger).sync('magento-partners').then(result => {
    logger.log('info', 'done', result)
  }).catch(e => {
    logger.log('error', 'e', e)
  })


// describe('Teams Entity', function() {
//   var entity = {}

//     before(function() {
//       entity = teamSync.teamSyncFactory(github, logger)
//     });

//     describe('Actions', function() {
//       it('Actions should contain CLEAR_STORAGE action', function(done) {
//           entity.sync('magento-partners').then(done()).catch(fail())
//       });
//   });
// });