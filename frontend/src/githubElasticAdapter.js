const elasticsearch = require ('elasticsearch-browser');

function esFactory(host, index, $scope) {
    var client = elasticsearch.Client({
        host: host,
        //log: 'trace'
    });
    client.ping({
        // ping usually has a 3000ms timeout
        requestTimeout: Infinity
    }, function (error) {
        if (error) {
            console.trace('elasticsearch cluster is down!');
        } else {
            //console.log('All is well');
        }
    });

    return githubElasticAdapter(index, client);
}

function scrollingSearch(connection, config, processor, data) {
    config.scroll = '60s';
    config._source = true;
    items = [];
    connection.search(config)
    .then(function getMoreUntilDone(response) {
        response.hits.hits.forEach(function (hit) {
            items.push(hit._source);
        });
        if (response.hits.total > items.length) {
            // ask elasticsearch for the next set of hits from this search
            connection.scroll({
                body: {
                    scroll_id: response._scroll_id
                },
                scroll: '60s'
            }).then(getMoreUntilDone);
        } else {
            processor(items, data);
            return items;
        }
    }).catch(function(e){
        console.log(e)
    })
}

function githubElasticAdapter (index, connection) {

    return {
        loadPullRequests: function (handler, interval, intervalValue) {
            console.log(interval);
            var aggregateInterval = "month";
            var aggregateFormat = "yyyy-MM";
            var filter = {"match_all":{}};
            if (interval === "week") {
                aggregateInterval = "week";
                aggregateFormat = "yyyy-MM w";
                filter = {
                    "range" : {
                        "closed_at" : {
                            "gte" : intervalValue,
                            "lt" :  intervalValue+"||+1M/d"
                        }
                    }
                }
            } else if (interval === "day") {
                aggregateInterval = "day";
                aggregateFormat = "yyyy-MM-dd";
                filter = {
                    "range" : {
                        "closed_at" : {
                            "gte" : intervalValue,
                            "lt" :  intervalValue+"||+1w/d"
                        }
                    }
                }
            }
            filter["byField"] = function(field) {
                if (this.range) {
                    var newFilter = {
                        "range": {}
                    };
                    newFilter.range[field] = this.range.closed_at;
                    return newFilter;
                } else {
                    return this;
                }
            }
            connection.search({
                index: index,
                _source: true,
                body: {
                    "query":
                    {
                        "match_all":{}
                    },
                    "aggs" : {
                        "community_closed_per_month" : {
                            "filter" : {
                                "bool": {
                                    "should": [
                                        { "term": { "assignee.login": "davidalger" }},
                                        { "term": { "assignee.login": "orlangur" }},
                                        { "term": { "assignee.login": "miguelbalparda" }},
                                        { "term": { "assignee.login": "avoelkl" }},
                                        { "term": { "assignee.login": "fooman" }},
                                        { "term": { "assignee.login": "mzeis" }},
                                        { "term": { "assignee.login": "schmengler" }},
                                        { "term": { "assignee.login": "vinai" }},
                                        { "term": { "assignee.login": "schmengler" }},
                                        { "term": { "assignee.login": "dmanners" }}
                                    ],
                                    "must": [
                                        filter.byField("closed_at")
                                    ]
                                }
                            },
                            "aggs": {
                                "numbers": {
                                    "date_histogram" : {
                                        "field" : "closed_at",
                                        "interval" : aggregateInterval,
                                        "format" : aggregateFormat
                                    }
                                }
                            }       
                        },
                        "closed_per_month" : {
                            "filter" : filter.byField("closed_at"),
                            "aggs": {
                                "closed_per_month": {
                                    "date_histogram" : {
                                        "field" : "closed_at",
                                        "interval" : aggregateInterval,
                                        "format" : aggregateFormat
                                    }
                                }    
                            }  
                        },
                        "merged_per_month" : {
                            "filter" : filter.byField("merged_at"),
                            "aggs": {
                                "merged_per_month": {
                                    "date_histogram" : {
                                        "field" : "merged_at",
                                        "interval" : aggregateInterval,
                                        "format" : aggregateFormat
                                    }
                                }
                            }       
                        },
                        "opened_per_month" : {
                            "filter" : filter.byField("created_at"),
                            "aggs": {
                                "opened_per_month": {
                                    "date_histogram" : {
                                        "field" : "created_at",
                                        "interval" : aggregateInterval,
                                        "format" : aggregateFormat
                                    }
                                }    
                            }    
                        }
                    }
                }
            }).then(function (response) {
                //console.log(response);
                handler(response);
            }).catch(function(e) {
                console.log(e);
            })
        },
        loadContributors: function(handler) {
            connection.search({
                index: index,
                size: 0,
                _source: true,
                body: {
                    "query":
                    {
                        "match_all":{}
                    },
                    "aggs" : {
                        "contributor_per_month": {
                            "date_histogram" : {
                                "field" : "merged_at",
                                "interval" : "month",
                                "format" : "yyyy-MM"
                            },
                            "aggs": {
                                "user" : {
                                    "terms" : { "field" : "user.login", "size": 100},
                                }
                            }
                        },
                    }
                }
            }).then(function (response) {
                //console.log(response);
                handler(response);
            }).catch(function(e) {
                console.log(e);
            })
        },
        loadTeams: function(handler) {
            connection.search({
                index: 'github-prs',
                //_source: true,
                body: {
                    "query":
                    {
                        //match_all: {}
                        "term" : { "state" : "closed" }
                    }
                }
            }).then(function(response) {
                // console.log({
                //     index: 'github-prs',
                //     _source: true,
                //     body: {
                //         "query":
                //         {
                //             "term" : { "status" : "closed" }
                //         }
                //     }
                // })
                console.log(response)
            }).catch(function(e) {
                console.log(e)
            });

            scrollingSearch(
                connection, 
                {
                    index: index,
                    body: {
                        "query":
                        {
                            
                            "match_all":{}
                            // "terms":{
                            //     "id": [2408558, 2390729]
                            // }
                        }
                    }    
                    // body: {
                    //     "query":
                    //     {
                    //         "match_all":{}
                    //     }
                    // }
                },
                processTeams
            );

            function processTeams(items, data) {
                teamIds = []
                membersToLoad = []
                var teams = items.reduce(function(teamsStorage, team) {
                    team.membersData = [];
                    membersToLoad = membersToLoad.concat(team.members);
                    console.log(membersToLoad, team.members);
                    team.prs = [];
                    teamsStorage[team.id] = team
                    return teamsStorage
                }, {})

                members = scrollingSearch(
                    connection, 
                    {
                        index: 'github-members',
                        body: {
                            "query":
                            {
                            "terms":{
                                    "id": membersToLoad
                                }
                            }
                        }
                    },
                    processMembersResponse
                );

                function processMembersResponse(membersResponse) {
                    var prsToLoad = []
                    var prsToTeamsMap = {};
                    membersResponse.map(function(member) {
                        memberTeams = []
                        console.log(member.id, member.prs);
                        member.teams.map(function(team) {
                            if (teams.hasOwnProperty(team.id)) {
                                teams[team.id].membersData.push(member);
                                memberTeams.push(team.id);
                            } else {
                                console.log("No such team " + team.id);
                            }
                        });

                        member.prs.map(function(prId){
                            prsToTeamsMap.hasOwnProperty(prId) ? prsToTeamsMap[prId].concat(memberTeams) : prsToTeamsMap[prId] = memberTeams
                            prsToLoad.push(prId)
                        });
                    });
                    console.log(prsToTeamsMap);

                    members = scrollingSearch(
                        connection, 
                        {
                            index: 'github-prs-metadata',
                            body: {
                                "query":
                                {
                                    "terms":{
                                        "id": prsToLoad
                                    }
                                }
                            }
                        },
                        processPRMetadata,
                        {
                            teams: teams,
                            prsToTeamsMap: prsToTeamsMap
                        }
                    );

                    function processPRMetadata(items, data) {
                        items.map(function(pr) {
                            data.prsToTeamsMap[pr.id].map(function(teamId) {
                                data.teams[teamId].prs.push(pr);
                            })
                        })

                        console.log(teams);
                        handler(teams);
                    }
                }
            }
        }
    }   
}
module.exports = esFactory;