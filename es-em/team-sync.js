'use strict';

const teamSyncFactory = function(github, logger) {
    return {
        sync: function(orgName) {
            return new Promise((resolve, reject) => {
                github.orgs.get({org: orgName})
                    .then(result => {
                        logger.log('info', 'result', result);
                        resolve();
                    })
                    .catch(reject)
            });
        },

        synchronize: function(orgName) {
            logger.log('info', 'team-sync::synchronize', 'Synchronization of Teams Started')
            //logger.log('info', 'team-sync::synchronize', github)
            function processOrg(orgResponse) {
                organization = orgResponse.data;
                logger.log('info', 'team-sync::synchronize::processOrg', 'Synchronization of Org Started')
                    
                // function processTeam(teamsResponse) {

                //         return new Promise(function(resolve, reject) {
                //             promises = [];
                //             teamsResponse.data.map(function(team) {
                //                 console.log('Team Name', team.name)
                //                 function processMembers(membersResponse) {
                //                     return new Promise(function(resolve, reject) {
                //                         this.processMembers(membersResponse, team).then(resolve).catch(reject)
                //                     }.bind(this))
                //                 }
                //                 promises.push(this.createTeam({team: team, organization: organization}))
                //                 promises.push(this.scrollingLoad(github.orgs.getTeamMembers, {id: team.id}, processMembers.bind(this)))
                //             }.bind(this))
                //             Promise.all(promises).then(resolve).catch(reject)
                //         }.bind(this))
                //     }.bind(this))      


                    function processTeams() {
                        return new Promise((resolve, reject) => {
                            resolve('Teams Processed')
                        })
                    }

                    github.orgs.getTeams({org: organization.login}).then(processResults = result => {
                        const promises = [];
                        processTeams(result).then(processed => {
                            logger.log('info', 'Processed Teams', processed)
                            if (github.hasNextPage(result)) {
                                logger.log('info', 'Process Next Page')
                                return github.getNextPage(result).then(processResults).catch(e => {
                                    logger.log('error', 'Loading Teams', e)
                                })
                            }
                        }).catch(e => {
                            logger.log('error', 'Processing Teams', e)
                        })
                    })

                }

                console.log(orgName)
                var repoRequest = {
                    owner: 'magento',
                    repo: 'magento2', 
                    state: 'closed',
                    sort: 'updated',
                    direction: 'desc'
                }
                github.orgs.get({org: orgName}).then(console.log).catch(console.log)
                github.pullRequests.getAll(repoRequest).then(console.log).catch(console.log)
            // github.orgs.get({org: orgName}).then(result => {
            //     console.log(result);
            //     logger.log('info', 'team-sync::synchronize', result)
            //     processOrg(result)
            // }).then(result => {
            //     logger.log('info', 'Orgs Request Processed Result', result)
            // }).catch(e => {
            //     logger.log('error', 'Retrieving Orgs', e)
            // })
        },
    }
}

exports.teamSyncFactory = teamSyncFactory;