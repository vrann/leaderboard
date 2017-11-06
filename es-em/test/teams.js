/*
 * Copyright 2012 Cloud9 IDE, Inc.
 *
 * This product includes software developed by
 * Cloud9 IDE, Inc (http://c9.io).
 *
 * Author: Mike de Boer <info@mikedeboer.nl>
 */

"use strict";

var getEntity = require("../entities/teams.js")
var assert = require('assert');
const winston = require('winston')

var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({
        json: true,
        colorize: true,
        level: 'error'
      })
    ]
  });

describe('Teams Entity', function() {
    var entity = {}

    before(function() {
        entity = getEntity(logger)
      });
  
    describe('Actions', function() {
    it('Actions should contain CLEAR_STORAGE action', function() {
      assert.equal('CLEAR_STORAGE', entity.Actions.CLEAR_STORAGE);
    });
  });
  describe('EntityName', function() {
    it('Entity should have name', function() {
      assert.equal('teams', entity.EntityName);
    });
  });
  describe('Reducer', function() {
      it('Add member should modify members array of the object and add only new member', function() {
        var state = {}
        state[entity.EntityName] = {
            1: {
                id: 1, name: 'Test', code: 'Test', members: [1, 2, 3]
            }
        }
        var membersAction = {
            type: entity.Actions.ADD_MEMBER,
            team: 1,
            member: 4
        }
        var expected = {
            teams: {
                1: {
                    id: 1, name: 'Test', code: 'Test', members: [1, 2, 3, 4]
                }
            }    
        }
        assert.deepEqual(entity.reducer(state, membersAction), expected);
      }),
      it('Add member to empty team should create team with member', function() {
        var state = {}
        state[entity.EntityName] = {
        }
        var membersAction = {
            type: entity.Actions.ADD_MEMBER,
            team: 1,
            member: 4
        }
        var expected = {
            teams: {
                1: {
                    id: 1, members: [4]
                }
            }    
        }
        assert.deepEqual(entity.reducer(state, membersAction), expected);
      }),
      it('Add team should add member', function() {
        var state = {}
        state[entity.EntityName] = {
        }
        var membersAction = {
            type: entity.Actions.ADD_TEAM,
            team: {
                id: 1, name: 'Test', code: 'Test', members: [1, 2, 3, 4]
            }
        }
        var expected = {
            teams: {
                1: {
                    id: 1, name: 'Test', code: 'Test', members: [1, 2, 3, 4]
                }
            }    
        }
        assert.deepEqual(entity.reducer(state, membersAction), expected);
      })
  })
});