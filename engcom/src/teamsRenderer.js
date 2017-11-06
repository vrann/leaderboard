var teamsRendererFactory = function($scope) {
    return {
        renderTeams(teams, period, currentPeriod, size) {
            console.log(teams)
            //console.log('period', period)
            //console.log(teams);
            //$scope.$apply(function() {
                $scope['labelsTeam'] = [
                    "Team Name", 
                    //"Members", 
                    "Total Created", "Total Merged", "Total Created in Partners Org", "Total Created in Open Source", "Labels for Merged"
                    //"PRs Numbers", "Complexity", "Special Achievements", "Category", 
                    //"Total Points"
                ]

                teamInfo = {}
                //years = {}
                periods = {
                    all: {all: {alias: 'all', label: 'All'}},
                    months: {},
                    years: {},
                    quaters: {}
                };

                

                Object.keys(teams.teams).map(teamId => {
                    team = teams.teams[teamId]
                    
                    //console.log(team.commercePRs)
                    
                    getYears = function(team) {
                        team.months = {}
                        function processPeriods(key) {
                            var monthNames = ["January", "February", "March", "April", "May", "June",
                                "July", "August", "September", "October", "November", "December"
                            ];
                            if (team.hasOwnProperty(key)) {
                                Object.keys(team[key]).map(prNum => {
                                    pr = team[key][prNum];

                                    [pr.created_at, pr.merged_at].map(extractDate, this)

                                    function extractDate (date) {
                                        if (date !== null) {
                                            eventDate = new Date(date)
                                            month = eventDate.getFullYear() + "-" + (eventDate.getMonth() + 1)
                                            team.months[month] = true;
                                            year = eventDate.getFullYear();
                                            monthNumber = eventDate.getMonth();
                                            this.years[year] = {
                                                alias: year + '',
                                                label: year + ''
                                            }
                                            this.months[month] = {
                                                alias: month,
                                                label: monthNames[monthNumber] + " " + year
                                            }
                                            var quater = Math.ceil((monthNumber + 1) / 4) + 1;
                                            //console.log(year, month, monthNumber, quater, Math.floor((monthNumber + 1) / 4), (monthNumber + 1) / 4)
                                            this.quaters[year + '-' + quater] = {
                                                alias: year + '-' + quater,
                                                label: "Q" + quater + " " + year
                                            };
                                        }
                                    }
                                })
                            }   
                        }

                        

                        processPeriods.call(this, 'prs');
                        
                        //processPeriods.call(this, 'ossPRs');
                        //processPeriods.call(this, 'commercePRs'); 
                        
                    }
                    getYears.call(periods, team); 
                })
                
                function sort(obj) {
                    //console.log(Object.keys(this[obj]))
                    sortedKeys = Object.keys(this[obj]).sort(sortMonth).reverse();
                    sortedArray = []
                    for (var i = 0; i < sortedKeys.length; i++) {
                        sortedArray.push(this[obj][sortedKeys[i]])
                    }
                    this[obj] = sortedArray;
                }

                function sortMonth(a,b) {
                    firstMonthParts = a.split('-');
                    secondMonthParts = b.split('-');
                    return (firstMonthParts[0] - secondMonthParts[0]) == 0 ? 
                        firstMonthParts[1] - secondMonthParts[1] :
                        firstMonthParts[0] - secondMonthParts[0];
                }

                sort.call(periods, 'years')
                sort.call(periods, 'quaters')
                sort.call(periods, 'months')

                console.log(periods)
                
                getMonthString = function(month) {
                    if (month < 10) {
                        return '0' + month
                     } else {
                         return month;
                     }
                }
//is:pr is:merged is:closed author:ajpevers closed:2017-07-01..2017-09-31 
//is:pr                     author:ajpevers closed:2017-09-01..2017-09-30 
                getMonthsByRange = function(periodName, periodValue, resolver) {
                    if (resolver == undefined) {
                        resolver = function(month) {
                            return month;
                        }
                    }
                    result = []
                    switch (periodName) {
                        case 'year':
                            [...Array(12).keys()].map(month => {
                                result.push(periodValue + '-' + resolver(month + 1))
                            })
                            break;
                        case 'quater':
                            quaterParts = periodValue.split('-');
                            //console.log(quaterParts);
                            if ((quaterParts[0] == '2017') && (quaterParts[1] == 2)) {
                                startMonth = (quaterParts[1] - 1) * 3 + 1;
                                [...Array(2).keys()].map(month => {
                                    result.push(quaterParts[0] + '-' + resolver(month + startMonth))
                                })
                            } else if ((quaterParts[0] == '2017') && (quaterParts[1] == 3)) {
                                startMonth = 6;
                                [...Array(4).keys()].map(month => {
                                    result.push(quaterParts[0] + '-' + resolver(month + startMonth))
                                })
                            } else {
                                startMonth = (quaterParts[1] - 1) * 3 + 1;
                                [...Array(3).keys()].map(month => {
                                    result.push(quaterParts[0] + '-' + resolver(month + startMonth))
                                })
                            }
                            
                            break;
                        case 'month':    
                        default: 
                            monthParts = periodValue.split('-');
                            result = [monthParts[0] + '-' + resolver(monthParts[1])]
                    }
                    //console.log(result)
                    return result;
                }

                getDaysRange = function(periodName, periodValue) {
                    if (periodName == 'all') {
                        return "";
                    }
                    function daysInMonth(month,year) {
                        return new Date(year, month, 0).getDate();
                    }
                    var monthByrange = getMonthsByRange(periodName, periodValue, getMonthString)
                    lastMonth = monthByrange[monthByrange.length - 1];
                    monthParts = lastMonth.split('-');
                    daysInMonth(monthParts[1], monthParts[0])
                    
                    return monthByrange[0] + "-01" + ".." + lastMonth + "-" + daysInMonth(monthParts[1], monthParts[0])
                }

                months = []
                switch (period) {
                    case 'all':
                        $scope['periods'] = periods.all;
                        $scope['period'] = 'all';
                        $scope['currentPeriod'] = 'all';
                        $scope['selectedPeriod'] = currentPeriod
                        $scope['periodLabel'] = 'All'
                        months = 'all'
                        break;
                    case 'year':
                        if (currentPeriod == 'all') {
                            currentPeriod =  periods.years[0].alias
                            $scope['periodLabel'] = periods.years[0].label
                            $scope['selectedPeriod'] = currentPeriod
                        } else {
                            $scope['periodLabel'] = periods.years.find(year => {
                                return year.alias === currentPeriod
                            }).label
                        }
                        
                        $scope['periods'] = periods.years;
                        months = getMonthsByRange(period, currentPeriod)
                        break;
                    case 'month':
                        if (currentPeriod == 'all') {
                            currentPeriod =  periods.months[0].alias
                            $scope['periodLabel'] = periods.months[0].label
                            $scope['selectedPeriod'] = currentPeriod
                        } else {
                            $scope['periodLabel'] = periods.months.find(month => {
                                return month.alias === currentPeriod
                            }).label
                        }
                        
                        $scope['periods'] = periods.months;
                        months = getMonthsByRange(period, currentPeriod)
                        break;
                    case 'quater':
                        if (currentPeriod == 'all') {
                            currentPeriod =  periods.quaters[0].alias
                            $scope['periodLabel'] = periods.quaters[0].label
                            $scope['selectedPeriod'] = currentPeriod
                        } else {
                            $scope['periodLabel'] = periods.quaters.find(quater => {
                                return quater.alias === currentPeriod
                            }).label
                        }
                        $scope['periods'] = periods.quaters;
                        months = getMonthsByRange(period, currentPeriod)
                        break; 
                }   

                $scope['range'] = getDaysRange(period, currentPeriod);
                //console.log($scope['range']);

                totals = {
                    teams: 0,
                    members: 0,
                    prs: 0,
                    prsAccepted: 0,
                    commercePRs: 0,
                    ossPRs: 0,
                    points: 0
                }

                perMonth = {}

                sortableTeams = []
                for (teamId in teams.teams) {
                    totals.teams++;
                    totals.members += Object.keys(team.membersData).length
                    team = teams.teams[teamId]
                    team['prsNumberOSS'] = 0;
                    team['prsNumberTotal'] = 0
                    team['prsNumberAccepted'] = 0
                    team['prsNumberPartner'] = 0
                    team['points'] = 0
                    team['merged'] = {}
                    team['closed'] = {}
                    team['opened'] = {}
                    team['sum'] = 0;
                    team['labels'] = {}

                    if (period == 'all') {
                        months = Object.keys(team.months)
                    }
                    //console.log(team.membersData)

                    for (memberId in team.membersData) {
                        //console.log("pulls?q=is%3Apr+is%3Amerged+is%3Aclosed+author%3A" + team.membersData[memberId].login + ($scope['range'].length > 0 ? "+closed%3A" + $scope['range'] : ''));
                        team.membersData[memberId]['merged'] = {}
                        team.membersData[memberId]['closed'] = {}
                        team.membersData[memberId]['opened'] = {}
                        team.membersData[memberId]['mergedLink'] = "pulls?q=is%3Apr+is%3Amerged+is%3Aclosed+author%3A" + team.membersData[memberId].login + ($scope['range'].length > 0 ? "+closed%3A" + $scope['range'] : '')
                        team.membersData[memberId]['closedLink'] = "pulls?q=is%3Apr+is%3Aunmerged+is%3Aclosed+author%3A" + team.membersData[memberId].login + ($scope['range'].length > 0 ? "+closed%3A" + $scope['range'] : '')
                        team.membersData[memberId]['openedLink'] = "pulls?q=is%3Apr+author%3A" + team.membersData[memberId].login + ($scope['range'].length > 0 ? "+created%3A" + $scope['range'] : '')
                    }
                    //console.log(team.membersData);
                    //console.log(Object.keys(team.prs))
                    //console.log(team.name, team.months)
                    //months.map(month => {
                        if (!team.hasOwnProperty('prs')) {
                            return;
                        }
                        data = {
                            name: team.name,
                            oss: [],
                            partner: []
                        };
                        //console.log(team.prs)
                        Object.keys(team.prs).map(prId => {
                            pr = team.prs[prId]

                            function getDateMonth(date) {
                                eventDate = new Date(date)
                                eventDate = eventDate.getFullYear() + "-" + (eventDate.getMonth() + 1)
                                return eventDate
                            }

                            createdMonth = getDateMonth(pr.created_at)
                            mergedMonth = getDateMonth(pr.merged_at)
                            closeddMonth = getDateMonth(pr.closed_at)
                            
                            
                            
                            if (months.find(month => {
                                return month == getDateMonth(pr.created_at)
                            })) {
                                if (!perMonth.hasOwnProperty(createdMonth)) {
                                    perMonth[createdMonth] = {
                                        teams: 0,
                                        members: 0,
                                        prs: 0,
                                        prsAccepted: 0,
                                        commercePRs: 0,
                                        ossPRs: 0,
                                        points: 0,
                                        closed: 0
                                    }
                                }
                                team['prsNumberTotal']++
                                totals.prs++;
                                perMonth[getDateMonth(pr.created_at)].prs++;
                                if (pr.baseOrganisation == 'magento-partners') {
                                    data['partner'].push(
                                        pr.repo + "#" + pr.number
                                    );
                                    team['prsNumberPartner']++
                                    totals.commercePRs++;
                                    perMonth[getDateMonth(pr.created_at)].commercePRs++;
                                } else {
                                    data['oss'].push(
                                        pr.repo + "#" + pr.number
                                    );
                                    team['prsNumberOSS']++
                                    totals.ossPRs++;
                                    perMonth[getDateMonth(pr.created_at)].ossPRs++;
                                }
                                if (!team.membersData[pr.author]['opened'].hasOwnProperty(pr.repo)) {
                                    team.membersData[pr.author]['opened'][pr.repo] = 0;
                                }
                                team.membersData[pr.author]['opened'][pr.repo]++
                                team.opened[prId] = pr
                            }

                            if (pr.hasOwnProperty('merged_at') && pr.merged_at != null && months.find(month => {
                                return mergedMonth == month
                            })) {
                                if (!perMonth.hasOwnProperty(mergedMonth)) {
                                    perMonth[mergedMonth] = {
                                        teams: 0,
                                        members: 0,
                                        prs: 0,
                                        prsAccepted: 0,
                                        commercePRs: 0,
                                        ossPRs: 0,
                                        points: 0,
                                        closed: 0
                                    }
                                }
                                pr.labels.map(label => {
                                    if (!team.labels.hasOwnProperty(label.id)) {
                                        team.labels[label.id] = label;
                                        team.labels[label.id]['count'] = 1;
                                    } else {
                                        team.labels[label.id]['count']++;
                                    }
                                })
                                if (!team.membersData[pr.author]['merged'].hasOwnProperty(pr.repo)) {
                                    team.membersData[pr.author]['merged'][pr.repo] = 0;
                                }
                                team.membersData[pr.author]['merged'][pr.repo]++
                                team.merged[prId] = pr
                                team['prsNumberAccepted']++
                                totals.prsAccepted++
                                perMonth[mergedMonth].prsAccepted++;
                            } else if (pr.hasOwnProperty('closed_at') && pr.closed_at != null && months.find(month => {
                                return getDateMonth(pr.closed_at) == month
                            })) {
                                if (!perMonth.hasOwnProperty(closeddMonth)) {
                                    perMonth[closeddMonth] = {
                                        teams: 0,
                                        members: 0,
                                        prs: 0,
                                        prsAccepted: 0,
                                        commercePRs: 0,
                                        ossPRs: 0,
                                        points: 0,
                                        closed: 0
                                    }
                                }
                                
                                if (!team.membersData[pr.author]['closed'].hasOwnProperty(pr.repo)) {
                                    team.membersData[pr.author]['closed'][pr.repo] = 0;
                                }
                                team.membersData[pr.author]['closed'][pr.repo]++
                                team.closed[prId] = pr
                                perMonth[closeddMonth].closed++;
                            }
                        })
                        //console.log(data);
                    //})
                    totals.points += team['points'];
                    sortableTeams.push(team)
                    //console.log(team)
                }


                function sortObj(obj) {
                    //console.log(Object.keys(this[obj]))
                    sortedKeys = Object.keys(this[obj]).sort(sortMonth);
                    sortedArray = {}
                    for (var i = 0; i < sortedKeys.length; i++) {
                        sortedArray[sortedKeys[i]] = this[obj][sortedKeys[i]];
                    }
                    this[obj] = sortedArray;
                }

                totalPerMonth = {
                    perMonth: perMonth
                }

                sortObj.call(totalPerMonth, 'perMonth')

                sortableTeams.sort(function(a, b) {
                    return b.prsNumberAccepted - a.prsNumberAccepted;
                });

                //console.log($scope['periods']);
                //$scope['periods'] = getPeriods.call(years);
                if (size > -1) {
                    $scope['teamInfo'] = sortableTeams.slice(0, size);
                } else {
                    $scope['teamInfo'] = sortableTeams
                }
                
                $scope['teamInfo']['totals'] = totals;
                $scope['period'] = period;
                $scope['perMonth'] = totalPerMonth.perMonth;
                return $scope;
                //console.log($scope)
            //})
        }
    }
}

module.exports = teamsRendererFactory