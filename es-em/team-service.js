'use strict'

const teamsEntity = require('./entities/teams.js')

function getTeamService(store, logger) {
    return {
        const actions = teamsEntity.getEntity(logger).Actions

        upsertTeam: function() {
            store.dispatch(actions.UPSERT_TEAM);
        },
        //should be called from batch sync
        rewriteMembers: function() {
            store.dispatch(actions.REWRITE_MEMBERS);
        },
        //should be called from webhook
        mergeMembers: function() {
            store.dispatch(actions.MERGE_MEMBERS);
        },
        addMember: function() {
            store.dispatch(actions.ADD_MEMBER);
        },
        removeMember: function() {
            store.dispatch(actions.REMOVE_MEMBER);
        }
    }
}

exports.getTeamService = getTeamService;