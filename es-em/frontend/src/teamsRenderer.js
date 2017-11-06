var teamsRendererFactory = function($scope) {
    return {
        renderTeams(teams, period, currentPeriod, size) {
            //console.log('period', period)
            //console.log(teams);
            //$scope.$apply(function() {
                $scope['labelsTeam'] = [
                    "Team Name", 
                    //"Members", 
                    "Total", "Accepted", "Partners Program", "Open Source", 
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
                                            //console.log(month)
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
                                            var quater = Math.floor((monthNumber + 1) / 4) + 1;
                                            //console.log(year, month, monthNumber, quater)
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
                        //console.log(team.months)
                        //processPeriods.call(this, 'ossPRs');
                        //processPeriods.call(this, 'commercePRs'); 
                        
                    }
                    getYears.call(periods, team);
                    
                })

                function sort(obj) {
                    //console.log(Object.keys(this[obj]))
                    sortedKeys = Object.keys(this[obj]).sort().reverse();
                    sortedArray = []
                    for (var i = 0; i < sortedKeys.length; i++) {
                        sortedArray.push(this[obj][sortedKeys[i]])
                    }
                    this[obj] = sortedArray;
                }

                sort.call(periods, 'years')
                sort.call(periods, 'quaters')
                sort.call(periods, 'months')

                getMonthsByRange = function(periodName, periodValue) {
                    result = []
                    switch (periodName) {
                        case 'year':
                            [...Array(12).keys()].map(month => {
                                result.push(periodValue + '-' + (month + 1))
                            })
                            break;
                        case 'quater':
                            quaterParts = periodValue.split('-');
                            startMonth = (quaterParts[1] - 1) * 3 + 1;
                            [...Array(3).keys()].map(month => {
                                result.push(quaterParts[0] + '-' + (month + startMonth))
                            })
                            break;
                        case 'month':    
                        default: 
                            result = [periodValue]
                    }
                    //console.log(result)
                    return result;
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

                totals = {
                    teams: 0,
                    members: 0,
                    prs: 0,
                    prsAccepted: 0,
                    commercePRs: 0,
                    ossPRs: 0,
                    points: 0
                }

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

                    if (period == 'all') {
                        months = Object.keys(team.months)
                    }
                    //console.log(team.membersData)
                    for (memberId in team.membersData) {
                        team.membersData[memberId]['merged'] = {}
                        team.membersData[memberId]['closed'] = {}
                        team.membersData[memberId]['opened'] = {}
                    }
                    //console.log(Object.keys(team.prs))
                    //console.log(team.name, team.months)
                    //months.map(month => {
                        if (!team.hasOwnProperty('prs')) {
                            return;
                        }
                        //console.log(team.prs)
                        Object.keys(team.prs).map(prId => {
                            pr = team.prs[prId]

                            function getDateMonth(date) {
                                eventDate = new Date(date)
                                eventDate = eventDate.getFullYear() + "-" + (eventDate.getMonth() + 1)
                                return eventDate
                            }


                            if (months.find(month => {
                                return month == getDateMonth(pr.created_at)
                            })) {
                                team['prsNumberTotal']++
                                totals.prs++;
                                if (pr.baseOrganisation == 'magento-partners') {
                                    team['prsNumberPartner']++
                                    totals.commercePRs++;
                                } else {
                                    team['prsNumberOSS']++
                                    totals.ossPRs++;
                                }    
                            }
                            
                            /* assign PRs */
                            if (pr.hasOwnProperty('merged_at') && pr.merged_at != null && months.find(month => {
                                return getDateMonth(pr.merged_at) == month
                            })) {
                                team.membersData[pr.author]['merged'][prId] = pr
                                team.merged[prId] = pr
                                team['prsNumberAccepted']++
                                totals.prsAccepted++
                            } else if (pr.hasOwnProperty('closed_at') && pr.closed_at != null && months.find(month => {
                                return getDateMonth(pr.closed_at) == month
                            })) {
                                team.membersData[pr.author]['closed'][prId] = pr
                                team.closed[prId] = pr
                            } else if (getDateMonth(pr.created_at) == month) {
                                team.membersData[pr.author]['opened'][prId] = pr
                                team.opened[prId] = pr
                            }
                        })
                    //})
                    totals.points += team['points'];
                    sortableTeams.push(team)
                    //console.log(team)
                }
                sortableTeams.sort(function(a, b) {
                    return b.prsNumberTotal - a.prsNumberTotal;
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
                
                //console.log($scope['period'])
            //})
        }
    }
}

module.exports = teamsRendererFactory