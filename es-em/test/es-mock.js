'use strict'

function getClient() {
    return {
        get: function(request) {
            return new Promise((resolve, reject) => {

            })
        },
        bulk: function(request) {
            return new Promise((resolve, reject) => {
                
            })
        },
        indices: {
            exists: function(request) {
                return new Promise((resolve, reject) => {
                    
                })
            }
        },
        exists: function(request) {
            return new Promise((resolve, reject) => {
                
            })
        }
    }
}

exports.getClient = getClient;