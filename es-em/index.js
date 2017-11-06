'use strict';

const entityStoreFactory = require('./entityStore');
const winston = require('winston')

const logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({
        //json: true,
        colorize: true,
        level: 'debug',
        prettyPrint: function ( object ){
            return JSON.stringify(object);
        }
      })
    ]
  });

  
//const entities = require('./entityMap');
const teamEntity = require('./entities/teams.js')(logger)
const entities = {}
entities[teamEntity.EntityName] = teamEntity;
//logger.log('info', 'Loaded Entities', entities)    

const store = entityStoreFactory.getEntityStore(entities, logger)

try {
    store.dispatch({
        type: "ADD_TEAM",
        team: {id: 1, name: 'test'}
    });
    
    store.dispatch({
        type: "ADD_TEAM",
        team: { name: 'test1'}
    });
} catch (e) {
    logger.log('error', 'Team Entity', e);
}
