'use strict';

const redux = require("redux");

function getEntityStore(entities, logger) {
    const reducers = {}
    Object.keys(entities).map(entityName => {
        reducers[entityName] = entities[entityName].reducer.bind(entities[entityName]);
    })
    const rootReducer = redux.combineReducers(reducers)
    const store = redux.createStore(rootReducer);
    store.subscribe(() => {
        logger.info('info', 'Redux Store event', store.getState())
    })
    return store;
}

exports.getEntityStore = getEntityStore;