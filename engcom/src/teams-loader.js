var teamsLoaderFactory = function(client) {
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
        teamsExclude: {
            2184566: true,
            2106893: true,
            2488073: true,
            2334746: true,
            2254617: true,
            2442883: true,
            2434065: true,
            2395533: true,
            2486341: true,
            2488061: true,
            2488130: true,
            2376162: true,
            2397855: true,
            2488115: true,
            2334741: true,
            2488156: true,
            1638535: true,
            2486342: true,
            2395090: true,
            2458982: true,
            2032477: true,
            2390707: true,
            2442900: true,
            2488096: true, 
            2250941: true
        },
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
                                    if (!team.hasOwnProperty('organization') || team.organization.login !== 'magento-partners') {
                                        return;
                                    }

                                    function reshapeTeam() {
                                        return {
                                            membersData: {},
                                            prs: {},
                                            mergedPRs: {},
                                            membersNumber: 0,
                                            prsNumberTotal: 0,
                                            prsNumberPartner: 0,
                                            prsNumberOSS: 0,
                                            prsNumberAccepted: 0,
                                            complexity: [],
                                            achievement: [],
                                            expertise: [],
                                            points: 0,
                                            name: this.name,
                                            id: this.id,
                                            link: this.hasOwnProperty('link') ? this.link : null,
                                        }
                                    }

                                    if (!this.teamsExclude.hasOwnProperty(team.id)) {
                                        this.membersIds = this.membersIds.concat(team.members);
                                        this.teams[team.id] = reshapeTeam.call(team)
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
                                                        this.teams[team.id].membersData[member.id] = {
                                                            login: member.login, 
                                                            id: member.id, 
                                                            avatar_url:member.avatar_url
                                                        };
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
                        // if (!this.hasOwnProperty('prsNumberTotal')) {
                        //     this.prsNumberTotal = 0
                        // }
                        // if (!this.hasOwnProperty('prsNumberPartner')) {
                        //     this.prsNumberPartner = 0
                        // }
                        // if (!this.hasOwnProperty('prsNumberOSS')) {
                        //     this.prsNumberOSS = 0
                        // }
                        // if (!this.hasOwnProperty('prsNumberAccepted')) {
                        //     this.prsNumberAccepted = 0
                        // }
                        // if (!this.hasOwnProperty('commercePRs')) {
                        //     this.commercePRs = {}
                        // }
                        // if (!this.hasOwnProperty('ossPRs')) {
                        //     this.ossPRs = {}
                        // }
                        

                        function getPRInfo() {
                            return {
                                number:this.number, 
                                baseOrganisation: this.baseOrganisation, 
                                baseRepo: this.baseRepo,
                                repo: this.baseOrganisation + '/' + this.baseRepo,
                                labels: this.labels,
                                author: this.user_id,
                                merged_at: this.merged_at,
                                closed_at: this.closed_at,
                                created_at: this.created_at
                            }
                        }

                        function addPrMergedvsOpened(pr) {
                            /* init object */
                            // if (!this.hasOwnProperty('merged')) {
                            //     this.merged = {}
                            // }
                            // if (!this.hasOwnProperty('closed')) {
                            //     this.closed = {}
                            // }
                            // if (!this.hasOwnProperty('opened')) {
                            //     this.opened = {}
                            // }
                            // if (!this.hasOwnProperty('prsNumberAccepted')) {
                            //     this.prsNumberAccepted = 0
                            // }
                            
                            /* assign PRs */
                            // if (pr.hasOwnProperty('merged_at') && pr.merged_at != null) {
                            //     this.merged[pr.id] = getPRInfo.call(pr)
                            //     this.prsNumberAccepted++;
                            // } else if (pr.hasOwnProperty('closed_at') && pr.closed_at != null) {
                            //     this.closed[pr.id] = getPRInfo.call(pr)
                            // } else {
                            //     this.opened[pr.id] = getPRInfo.call(pr)
                            // }

                        }

                        function getPRMonth() {
                            createdDate = new Date(this.created_at)
                            return createdDate.getFullYear() + "-" + (createdDate.getMonth() + 1)
                        }

                        function getPRMergedMonth() {
                            mergedDate = new Date(this.merged_at)
                            return mergedDate.getFullYear() + "-" + (mergedDate.getMonth() + 1)
                        }

                        /* assign PRs */
                        this.prsNumberTotal++
                        monthly = getPRMonth.call(pr)
                        if (!this.hasOwnProperty('prs')) {
                            this.prs = {}
                        }
                        // if (!this.prs.hasOwnProperty(monthly)) {
                        //     this.prs[monthly] = {}
                        // }
                        this.prs[pr.id] = getPRInfo.call(pr)
                        //addPrMergedvsOpened.call(this.prs[monthly], pr)
                        //console.log(this.prs[monthly])
                        // switch (pr.baseOrganisation) {
                        //     case 'magento-partners':
                        //         this.prsNumberPartner++;
                        //         addPrMergedvsOpened.call(this.commercePRs[monthly], pr)
                        //         //addPrMergedvsOpened.call(this, pr)
                        //         break;
                        //     case 'magento':
                        //     default:
                        //         this.prsNumberOSS++;
                        //         this.ossPRs[monthly] = {}
                        //         addPrMergedvsOpened.call(this.ossPRs[monthly], pr)
                        //         //addPrMergedvsOpened.call(this, pr)
                        //         break;
                        // }
                    }
                    console.log(this.prsIds)

                    chunkSize = 100; //24;
                    chunksNumber = Math.ceil(this.prsIds.length / chunkSize)

                    chunks = []
                    promises = [];
                    [...Array(chunksNumber).keys()].map(currentChunk => {
                        start = currentChunk * chunkSize
                        slice = this.prsIds.slice(start, start + chunkSize);
                        promises.push(
                            client.loadData({
                                index: 'github-prs-metadata',
                                type: 'github-pr-metadata',
                                size: 1000,
                                explain: true,
                                body: {
                                    "query": {
                                        "bool": 
                                            {"must": [{
                                                "terms": {
                                                    "id": slice
                                                }
                                            }
                                        ]}
                                    }
                                }
                            }, response => {
                                response.hits.hits.forEach(
                                    hit => {
                                        pr = hit._source
                                        this.prsCount++
                                        this.prsToTeamsMap[pr.id].map(teamId => {
                                            addPrOSSvsCommerce.call(this.teams[teamId], pr)
                                        })
                                    }
                                );  
                            }, hitsTotal => {
                                return hitsTotal > this.prsCount
                            })
                        )
                    })    
                    return new Promise((resolve, reject) => {
                        try {
                            Promise.all(promises).then(result => {
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

                    // return new Promise((resolve, reject) => {
                    //     try {
                    //         return client.loadData({
                    //             index: 'github-prs-metadata',
                    //             type: 'github-pr-metadata',
                    //             size: 1000,
                    //             explain: true,
                    //             body: {
                    //                 "query": {
                    //                     "bool": 
                    //                         {"must": [{
                    //                             "terms": {
                    //                                 "id": this.prsIds
                    //                             }
                    //                         }
                    //                         //, 
                    //                         // {"range" : {
                    //                         //     "created_at" : {
                    //                         //         //"gte" : "2017-07-01",
                    //                         //         //"lt" :  "2017-07-01||+3M/d"
                    //                         //         "from": "2017-08-01",
                    //                         //         "to": "2017-09-01"
                    //                         //     }
                    //                         // }
                    //                         // }
                    //                 ]}
                    //                 }
                    //             }
                    //         }, response => {
                    //             //console.log('prs loaded');
                    //             response.hits.hits.forEach(
                    //                 hit => {
                    //                     pr = hit._source
                    //                     this.prsCount++
                    //                     this.prsToTeamsMap[pr.id].map(teamId => {
                    //                         //addPrOSSvsCommerce.call(this.teams[teamId].membersData[pr.user_id], pr)
                    //                         addPrOSSvsCommerce.call(this.teams[teamId], pr)
                    //                         //addPrOSSvsCommerce.call(this, pr)
                    //                     })
                    //                 }
                    //             );  
                    //         }, hitsTotal => {
                    //             return hitsTotal > this.prsCount
                    //         }).then(result => {
                    //             resolve({teams: this.teams, totals: {
                    //                 teams: Object.keys(this.teams).length,
                    //                 prs: this.prsCount,
                    //                 members: this.membersCount,
                    //                 ossPRs: Object.keys(this.ossPRs.merged).length + Object.keys(this.ossPRs.opened).length + Object.keys(this.ossPRs.closed).length,
                    //                 commercePRs: Object.keys(this.commercePRs.merged).length + Object.keys(this.commercePRs.opened).length + Object.keys(this.commercePRs.closed).length
                    //             }})
                    //         }).catch(reject)
                    //     } catch (e) {
                    //         reject(e)
                    //     }
                    // })
                }    
            )
        }
    }
    return loader;
}
module.exports = teamsLoaderFactory;