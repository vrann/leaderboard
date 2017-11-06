var esFactory = require('./esFactory.js');

var teamsLoaderFactory = function(host) {
    client = esFactory(host)
    var loader = {
        membersIds: [],
        teams: {},
        teamsCount: 0,
        prsIds: [],
        prsToTeamsMap: {},
        membersCount: 0,
        prsCount: 0,
        ossCount: 0,
        ossPRs: {merged:{}, opened:{}, closed:{}},
        commercePRs: {merged:{}, opened:{}, closed:{}},
        partnersCount: 0,
        teamsExclude: {2334741: true, 2334746: true, 2376162: true, 2390707: true, 2395533: true, 2397855: true, 2442900: true, 2434065: true},
        membersExclude: {},
        getTeams: function() {
            return new Promise((resolve, reject) => {
                return client.loadData({
                    index: 'github-teams',
                    type: 'github-team',
                    size: 1000,
                    body: {
                        "query":{"match_all":{}}
                    }    
                }, response => {
                    
                        try {
                            response.hits.hits.forEach(
                                hit => {
                                    this.teamsCount++
                                    team = hit._source
                                    team.membersData = {};
                                    team.prs = [];
                                    team.membersNumber = 0;
                                    team.prsNumberTotal = 0
                                    team.prsNumberPartner = 0
                                    team.prsNumberOSS = 0
                                    team.prsNumberAccepted = 0
                                    team.complexity = []
                                    team.achievement = []
                                    team.expertise = []
                                    team.points = 0

                                    if (!this.teamsExclude.hasOwnProperty(team.id)) {
                                        this.membersIds = this.membersIds.concat(team.members);
                                        this.teams[hit._source.id] = team
                                    } else {
                                        team.members.map((memberId) => {
                                            this.membersExclude[memberId] = true
                                        })
                                    }
                                })
                            } catch (e) {
                                reject(e)
                            }   
                        
                }, hitsTotal => {
                    return hitsTotal > this.teamsCount
                }).then(resolve).catch(reject)
            })
            .then(result => {
                return new Promise((resolve, reject) => {
                    try {
                        //console.log(this.membersIds)
                        return client.loadData({
                            index: 'github-members',
                            type: 'github-member',
                            size: 1000,
                            body: {
                                "query":{
                                    "terms":{"id": this.membersIds}
                                }
                            }    
                        }, response => {
                                try {
                                    response.hits.hits.forEach(
                                        hit => {
                                            //console.log(this.teams)
                                            this.membersCount++;
                                            member = hit._source
                                            //console.log(this.membersExclude)
                                            if (!this.membersExclude.hasOwnProperty(member.id)) {
                                                //console.log(member);
                                                memberTeams = []
                                                member.teams.map(team => {
                                                    if (this.teams.hasOwnProperty(team.id)) {
                                                        this.teams[team.id].membersData[member.id] = member;
                                                        this.teams[team.id].membersNumber++;
                                                        memberTeams.push(team.id);
                                                    } else {
                                                        console.log("No such team " + team.id);
                                                    }
                                                });
                                                member.prs.map(prId => {
                                                    this.prsToTeamsMap.hasOwnProperty(prId) ? this.prsToTeamsMap[prId].concat(memberTeams) : this.prsToTeamsMap[prId] = memberTeams
                                                    this.prsIds.push(prId)
                                                });
                                            }    
                                        }
                                    );
                                } catch (e) {
                                    reject(e)
                                }
                                
                        }, hitsTotal => {
                            return hitsTotal > this.membersCount
                        }).then(resolve).catch(reject)
                    } catch (e) {
                        reject(e)
                    }
                })
            }).then(
                result => {
                    function addPrOSSvsCommerce(pr) {
                        /* init object */
                        if (!this.hasOwnProperty('prsNumberTotal')) {
                            this.prsNumberTotal = 0
                        }
                        if (!this.hasOwnProperty('prsNumberPartner')) {
                            this.prsNumberPartner = 0
                        }
                        if (!this.hasOwnProperty('prsNumberOSS')) {
                            this.prsNumberOSS = 0
                        }
                        if (!this.hasOwnProperty('prsNumberAccepted')) {
                            this.prsNumberAccepted = 0
                        }
                        if (!this.hasOwnProperty('commercePRs')) {
                            this.commercePRs = {}
                        }
                        if (!this.hasOwnProperty('ossPRs')) {
                            this.ossPRs = {}
                        }

                        function addPrMergedvsOpened(pr) {
                            /* init object */
                            if (!this.hasOwnProperty('merged')) {
                                this.merged = {}
                            }
                            if (!this.hasOwnProperty('closed')) {
                                this.closed = {}
                            }
                            if (!this.hasOwnProperty('opened')) {
                                this.opened = {}
                            }
                            
                            /* assign PRs */
                            if (pr.hasOwnProperty('merged_at') && pr.merged_at != null) {
                                this.merged[pr.id] = pr
                                this.prsNumberAccepted++;
                            } else if (pr.hasOwnProperty('closed_at') && pr.closed_at != null) {
                                this.closed[pr.id] = pr
                            } else {
                                this.opened[pr.id] = pr
                            }
                        }

                        /* assign PRs */
                        this.prsNumberTotal++
                        switch (pr.baseOrganisation) {
                            case 'magento-partners':
                                this.prsNumberPartner++;
                                addPrMergedvsOpened.call(this.commercePRs, pr)
                                addPrMergedvsOpened.call(this, pr)
                                break;
                            case 'magento':
                            default:
                                this.prsNumberOSS++;
                                addPrMergedvsOpened.call(this.ossPRs, pr)
                                addPrMergedvsOpened.call(this, pr)
                                break;
                        }
                    }
                    
                    return new Promise((resolve, reject) => {
                        try {
                            return client.loadData({
                                index: 'github-prs-metadata',
                                type: 'github-pr-metadata',
                                size: 1000,
                                body: {
                                    "query": {
                                        "bool": 
                                            {"must": [{
                                                "terms": {
                                                    "id": this.prsIds
                                                }
                                            }, 
                                            {"range" : {
                                                "created_at" : {
                                                    //"gte" : "2017-07-01",
                                                    //"lt" :  "2017-07-01||+3M/d"
                                                    "from": "2017-05-01",
                                                    "to": "2017-09-01"
                                                }
                                            }
                                        }]}
                                    }
                                }    
                            }, response => {
                                response.hits.hits.forEach(
                                    hit => {
                                        pr = hit._source
                                        this.prsCount++
                                        this.prsToTeamsMap[pr.id].map(teamId => {
                                            addPrOSSvsCommerce.call(this.teams[teamId].membersData[pr.user_id], pr)
                                            addPrOSSvsCommerce.call(this.teams[teamId], pr)
                                            addPrOSSvsCommerce.call(this, pr)
                                        })
                                    }
                                );  
                            }, hitsTotal => {
                                return hitsTotal > this.prsCount
                            }).then(result => {
                                resolve({teams: this.teams, totals: {
                                    teams: Object.keys(this.teams).length,
                                    prs: this.prsCount,
                                    members: this.membersCount,
                                    ossPRs: Object.keys(this.ossPRs.merged).length + Object.keys(this.ossPRs.opened).length + Object.keys(this.ossPRs.closed).length,
                                    commercePRs: Object.keys(this.commercePRs.merged).length + Object.keys(this.commercePRs.opened).length + Object.keys(this.commercePRs.closed).length
                                }})
                            }).catch(reject)
                        } catch (e) {
                            reject(e)
                        }
                    })
                }    
            )
        }
    }
    return loader;
}
module.exports = teamsLoaderFactory;