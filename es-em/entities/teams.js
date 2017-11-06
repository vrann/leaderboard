getEntity = function(logger) {
    return {
        EntityName: 'teams',
        InitialState: {},
        Actions: {
            UPSERT_TEAM: 'UPDATE_TEAM', //provided full set of data for the team, ignore members

            ADD_MEMBER: 'ADD_MEMBER', //provided just one member to add
            REMOVE_MEMBER: 'REMOVE_MEMBER', //provided one member to remove
            MERGE_MEMBERS: 'MERGE_MEMBERS', //provided set of members, merge them with the existing
            REWRITE_MEMBERS: 'REWRITE_MEMBERS', //provided full set of members
            
            CLEAR_STORAGE: 'CLEAR_STORAGE' //clear all data
        },

        addTeam: function(state, team) {
            if (!team.hasOwnProperty('id')) {
                throw 'Team must have id'
            }
            if (state.hasOwsProperty(team.id)) {
                return this.updateTeam(state, team)
            } else {
                state[team.id] = team;
                return Object.assign({}, state)
            }
        },

        updateTeam: function(state, team) {
            oldTeam = state[team.id]
            Object.keys(team).map(function(key, index) {
                switch (key) {
                    case 'members':
                        members = document.hasOwnProperty('members') ? document.members : [];
                        team.members.map(function(memberId){
                            if (!members.find(function(element) {return element == memberId})) {
                                members.push(memberId);
                            }
                        });
                        oldTeam.members = members;
                        break;
                    case 'description':
                        var regex = /.*Link:\s(.*)\./;
                        var parsed = regex.exec(updateData.description)
                        if (parsed !== null && parsed.length > 1) {
                            console.log(parsed[1])
                            oldTeam.link = parsed[1]    
                        }
                        break; 
                    default:
                        oldTeam[key] = team[key];
                        break;
                }
            })
        },

        addMembers: function(state, teamId, membersIds) {
            const stateTeam = state.hasOwnProperty(teamId) ? state[teamId] : {id: teamId}
            const members = state[teamId].hasOwnProperty('members') ? stateTeam.members : [];
            membersIds.map(memberId => {
                if (!members.find((element) => {return element == memberId})) {
                    members.push(memberId);
                }
            })
            state[teamId].members = members;
            return Object.assign({}, state)
        },

        addMember: function(state, teamId, memberId) {
            const stateTeam = state.hasOwnProperty(teamId) ? state[teamId] : {id: teamId}
            const members = stateTeam.hasOwnProperty('members') ? stateTeam.members : [];
            if (!members.find((element) => {return element == memberId})) {
                members.push(memberId);
            }
            stateTeam.members = members
            state[teamId] = stateTeam;
            return Object.assign({}, state)
        },

        removeMember: function(state, teamId, memberId) {
            const stateTeam = state.hasOwnProperty(teamId) ? state[teamId] : {id: teamId}
            const members = stateTeam.hasOwnProperty('members') ? stateTeam.members : [];
            newMembers = []
            if (!members.find((element) => {return element == memberId})) {
                newMembers.push(element);
            }
            stateTeam.members = members
            state[teamId] = stateTeam;
            return Object.assign({}, state)
        },

        reducer: function(state = this.InitialState, action) {
            switch (action.type) {
                case this.Actions.ADD_TEAM:
                    return this.addTeam(state, action.team)
                case this.Actions.ADD_MEMBER:
                    return this.addMember(state, action.team, action.member)
                case this.Actions.REMOVE_MEMBER:
                    return this.removeMember(state, action.team, action.member) 
                default:
                    return state;      
            }
        }
    }    
}
module.exports = getEntity

// const EntityName = 'teams'
// exports.EntityName = EntityName

// const Actions = {
//     ADD_TEAM: 'ADD_TEAM', //full set of data for the team, ignore members
//     ADD_MEMBER: 'ADD_MEMBER', //provided just one member to add
//     REMOVE_MEMBER: 'REMOVE_MEMBER', //provided one member to remove
//     UPDATE_MEMBERS: 'UPDATE_MEMBERS', //provided full set of members
//     UPDATE_TEAM: 'UPDATE_TEAM', //provided full set of data for the team, ignore members
//     CLEAR_STORAGE: 'CLEAR_STORAGE' //clear all data
// }
// exports.Actions = Actions

// function reducer(state = {'teams': {}}, action) {
//     switch (action.type) {
//         case Actions.ADD_TEAM:
//             state[EntityName][action.team.id] = action.team;
//             return Object.assign({}, state)
//         case Actions.REMOVE_MEMBER:

//         case Actions.ADD_MEMBER:
//             const stateTeam = state[EntityName].hasOwnProperty(action.team) ? state[EntityName][action.team] : {id: action.team}
//             const members = stateTeam.hasOwnProperty('members') ? stateTeam.members : [];
//             if (!members.find((element) => {return element == action.member})) {
//                 members.push(action.member);
//             }
//             stateTeam.members = members
//             state['teams'][action.team] = stateTeam;
//             return Object.assign({}, state)
//         // case Actions.UPDATE_TEAM    
//         //     // 'description':
//         //     var regex = /.*Link:\s(.*)\./;
//         //     var parsed = regex.exec(updateData.description)
//         //     if (parsed !== null && parsed.length > 1) {
//         //         console.log(parsed[1])
//         //         updateObject.link = parsed[1]    
//         //     } else {
//         //         updateObject.link = null
//         //     }
//         //     break; 
//     }

// }

// exports.reducer = reducer;

// function mergeMembers() {

// }

// function mapData() {

// }