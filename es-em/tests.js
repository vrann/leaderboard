var counter = require("./index.js");
var redux = require("redux");
const winston = require('winston')


function teamReducer(state = {}, action) {
    switch (action.type) {
    case 'ADD_TEAM':
        state[action.data.id] = action.data;
        return state;
    case 'ADD_MEMBER':
        return state;
    case 'REMOVE_MEMBER':
        return state;        
    case 'UPDATE_MEMBERS':
        state[action.data.id].members = action.data.members
        return state;
    case 'UPDATE_DATA':
        //update all but members
        return state;    
    case 'CLEAR_STORAGE':
        return {}    
    default:
        return state;
    }
  }


var team = redux.createStore(teamReducer)

team.subscribe(() =>
    console.log(team.getState())
  )

  team.dispatch({ type: 'ADD_TEAM', data: {id: 0, name: 'Cool', members: []} })
// 1
team.dispatch({ type: 'UPDATE_MEMBERS', data: {id: 0, name: 'Cool', members: [1, 2]}})
// 2
//store.dispatch({ type: 'DECREMENT' })

console.log(team.getState())

winston.level = 'debug' 

var logger = new winston.Logger({
    level: 'info',
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({ filename: 'somefile.log' })
    ]
  });

winston.log('info', 'Hello log files!', team.getState())




