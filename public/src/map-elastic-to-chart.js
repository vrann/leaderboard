function ElasticToChartsMapper($scope) {
    this.$scope = $scope;
}

function ElasticToChartsMapper($scope, alias, clickHandler) {
    return {
        createMapper: function(config) {
            $scope.$apply(function() {
                $scope.type = 'StackedBar';
                $scope['series'+alias] = ['Opened', 'Merged', 'Rejected', 'By Maintainers'];
                
                $scope['options'+alias] = {
                    responsive: true,
                    legend: {
                        display: true,
                        // labels: {
                        //     fontColor: 'rgb(255, 99, 132)'
                        // }
                    },
                    onClick: clickHandler,
                };
                
                var mergedPRs = {};
                var closedPrs = {};
                var chartData = {
                    labels: config.aggregations.opened_per_month.opened_per_month.buckets.map(function(a) {return a.key_as_string;}),
                    opened: config.aggregations.opened_per_month.opened_per_month.buckets.map(function(a) {return a.doc_count;}),
                    merged: config.aggregations.merged_per_month.merged_per_month.buckets.map(function(a) {mergedPRs[a.key_as_string] = a.doc_count; return a.doc_count;}),
                    closed: config.aggregations.closed_per_month.closed_per_month.buckets.map(function(a) {return a.doc_count - mergedPRs[a.key_as_string];}),
                    community: []
                }
                var community = {}
                config.aggregations.community_closed_per_month.numbers.buckets.map(function(a) {
                    community[a.key_as_string] = a.doc_count;
                });
                
                function cut(obj, count) {
                    return {
                        labels: obj.labels.slice(Math.max(obj.labels.length - count, 0)),
                        opened: obj.opened.slice(Math.max(obj.opened.length - count, 0)),
                        merged: obj.merged.slice(Math.max(obj.merged.length - count, 0)),
                        closed: obj.closed.slice(Math.max(obj.closed.length - count, 0)),
                        community: []
                    }
                }
                var cutData = cut(chartData, 8);
                //console.log(chartData.opened.slice(1));
                //console.log(cutData);
                
                cutData.labels.map(function(a) {
                    if (a in community) {
                        cutData.community.push(community[a])
                    } else {
                        cutData.community.push(0)
                    }
                });
                
                $scope['labels'+alias] = cutData.labels
                $scope['data'+alias] = [cutData.opened,cutData.merged,cutData.closed,cutData.community];
            });
        },
        contributorsMapper: function(config) {
            $scope.$apply(function() {
                $scope.type = 'StackedBar';
                $scope['series'+alias] = ['1st', '2nd', '3d'];
                
                $scope['options'+alias] = {
                    onClick: clickHandler,
                    multiTooltipTemplate: "<%= datasetLabel %> - <%= value %>",
                    tooltips: {
                        callbacks: {
                            beforeLabel: function(tooltipItem, data) {
                                //console.log(data);
                                //console.log(tooltipItem);
                                return contributors[tooltipItem.xLabel][tooltipItem.datasetIndex];
                            }
                        }
                    }
                };
                
                var chartData = {
                    labels: config.aggregations.contributor_per_month.buckets.map(function(a) {return a.key_as_string;}),
                    top0: [],
                    top1: [],
                    top2: []
                    //top2: config.aggregations.merged_per_month.buckets.map(function(a) {return a.doc_count;}),
                    //top3: config.aggregations.closed_per_month.buckets.map(function(a) {return a.doc_count;}),
                    
                }
                var contributors = {};
                config.aggregations.contributor_per_month.buckets.map(function(a) {
                    var obj = {};
                    contributors[a.key_as_string] = [];
                    for (i = 0; i < 3; i++) {
                        if (i > a.user.buckets.length -1) {
                            chartData["top" + i].push(0);
                            contributors[a.key_as_string].push("NaN");
                        } else {
                            chartData["top" + i].push(a.user.buckets[i].doc_count);
                            contributors[a.key_as_string].push(a.user.buckets[i].key);
                        }
                        
                        //obj[a.user.buckets[i].key] = a.user.buckets[i].doc_count;
                    }    
                    //return obj;
                });

                function cut(obj, count) {
                    return {
                        labels: obj.labels.slice(Math.max(obj.labels.length - count, 1)),
                        top0: obj.top0.slice(Math.max(obj.top0.length - count, 1)),
                        top1: obj.top1.slice(Math.max(obj.top1.length - count, 1)),
                        top2: obj.top2.slice(Math.max(obj.top2.length - count, 1)),
                    }
                }
                var cutData = cut(chartData, 8)
                $scope['labels'+alias] = cutData.labels
                $scope['data'+alias] = [cutData.top0, cutData.top1, cutData.top2];

                //console.log($scope);
            })    
        },
        teamsMapper: function(teamsData) {
            var series = [];
            var data = [];
            var teamInfo = []
            $scope.$apply(function() {
                var teams = [];
                Object.keys(teamsData).map(function(key, index) {
                    team = teamsData[key];
                    //console.log(team)
                    info = {
                        id: team.id,
                        teamPRs: [],
                        name: team.name,
                        membersNumber: team.membersData.length,
                        prsNumberTotal: team.prs.length,
                        prsNumberPartner: 0,
                        prsNumberOSS: 0,
                        complexity: [],
                        achievement: [],
                        expertise: [],
                        points: 0
                    }

                    labelGroups = {
                        complexity: {bug: 1, simple: 1, advanced: 1, complex: 1},
                        achievement: {'API Coverage': 1, testing: 1},
                        expertise: {Catalog: 1, API: 1}
                    }

                    function addLabel(dataSection, label) {
                        if (index = dataSection.findIndex(function(element) {return element.id == label.id}) == -1) {
                            label.count = 1;
                            dataSection.push(label)
                        } else {
                            dataSection[index].count ++;
                        }
                    }

                    team.prs.map(function(pr) {
                        //console.log(pr)
                        info.teamPRs.push(
                            {
                                number: pr.baseOrganisation + '/' + pr.baseRepo + '#' + pr.number,
                                uri: pr.baseOrganisation + '/' + pr.baseRepo + '/pull/' + pr.number,
                                authorName: team.membersData[pr.user_id].login,
                                authorImg: team.membersData[pr.user_id].avatar_url
                            }
                        )
                        switch (pr.baseOrganisation) {
                            case 'magento-partners':
                                info.prsNumberPartner++;
                                info.points = info.points+5;
                                break;
                            case 'magento':
                                info.prsNumberOSS++;
                                info.points = info.points+5;
                                break;
                            default:
                                info.points = info.points+5;
                                break;
                        }
                        //console.log(pr);
                        if (pr.labels) {
                            pr.labels.map(function(label) {
                                if ((keyIndex = Object.keys(labelGroups).findIndex(
                                            function (key, index, arr) {
                                                return labelGroups[key].hasOwnProperty(label.name);
                                            }    
                                        )) != -1
                                    ) {
                                    addLabel(info[Object.keys(labelGroups)[keyIndex]], label);
                                }
                            });
                        }
                    })
                    teamInfo.push(info);
                    //teams.push({id: team.id, name: team.name});
                    //data.push([team.name, team.membersData.length, team.prs.length, 0, 0, 0, 0, 0, 0]);
                });
                // var teamNames = teams.reduce(function(names, team) {
                //     names.push(team.name)
                //     return names
                // }, [])
                // console.log(teams, teamNames);
                // teamNames.map(function(name){
                //     data.push([name, 0, 0]);
                // })

                //$scope['series'+alias] = series;
                $scope['labels'+alias] = ["Team Name", "Members", "PRs Opened", "PRs Accepted", "PRs Partners", "PRs Open Source", "PRs Numbers", "Complexity", "Special Achievements", "Category", "Total Points"]
                //$scope['data'+alias] = data;
                $scope['teamInfo'] = teamInfo;
                
                //  console.log($scope['teamInfo']);
            })
        }   
    }
}



module.exports = ElasticToChartsMapper;