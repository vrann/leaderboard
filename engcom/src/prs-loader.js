var prsLoaderFactory = function(client) {
    var loader = {
        getMonthsByRange: function(periodName, periodValue, resolver) {
            if (resolver == undefined) {
                resolver = function(month) {
                    return month;
                }
            }
            result = []
            switch (periodName) {
                case '12months':
                    var startDate = new Date(periodValue);
                    
                    startMonth = startDate.getMonth() + 1;
                    startDate.setFullYear(startDate.getFullYear() - 1);
                    
                    [...Array(12 - startDate.getMonth()).keys()].map(monthIncrement => {
                        result.push(startDate.getFullYear() + '-'  + (startMonth + monthIncrement))
                    });
                    [...Array(startMonth).keys()].map(monthIncrement => {
                        result.push((startDate.getFullYear() + 1) + '-' + (1 + monthIncrement) )
                    });
                    break;
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
        },

        getPrsStatistic: function(repositories) {
            var result = {
                prsCount: 0,
                created: {},
                contributorsFirstMonth: {},
                firstTimeContributors: {},
                contributorsPerMonth: {},
                merged: {},
                rejected: {},
            }
            return new Promise((resolve, reject) => {
                try {
                    
                    client.loadData({
                        index: 'github-prs-metadata',
                        type: 'github-pr-metadata',
                        size: 1000,
                        body: {
                            "query": {
                                "match_all":{}
                            }
                        }
                    }, response => {
                        response.hits.hits.forEach(
                            hit => {
                                pr = hit._source
                                result.prsCount++
                                repository = pr.baseOrganisation + '/' + pr.baseRepo
                                if (repositories.indexOf(repository) != -1) {
                                    console.log(repositories, repository)
                                //if (repository == 'magento/magento2' || repository == 'magento-partners/magento2ce' || repository == 'magento-partners/magento2ee' || repository == 'magento-engcom/msi') {
                                    createdDate = new Date(pr.created_at)
                                    createdMonth = createdDate.getFullYear() + "-" + (createdDate.getMonth() + 1)
                                    if (!result.created.hasOwnProperty(createdMonth)) {
                                        result.created[createdMonth] = {count: 1, prs:[pr]};
                                    } else {
                                        result.created[createdMonth].count++;
                                        result.created[createdMonth].prs.push(pr)
                                    }
                                    

                                    if (pr.merged_at !== null) {
                                        mergedDate = new Date(pr.merged_at)
                                        mergeMonth = mergedDate.getFullYear() + "-" + (mergedDate.getMonth() + 1)
                                        if (!result.merged.hasOwnProperty(mergeMonth)) {
                                            result.merged[mergeMonth] = {count: 1, prs:[pr]};
                                        } else {
                                            result.merged[mergeMonth].count++;
                                            result.merged[mergeMonth].prs.push(pr)
                                        }
                                    } else if (pr.closed_at !== null) {
                                        closedDate = new Date(pr.closed_at)
                                        closingMonth = closedDate.getFullYear() + "-" + (closedDate.getMonth() + 1)
                                        if (!result.rejected.hasOwnProperty(closingMonth)) {
                                            result.rejected[closingMonth] = {count: 1, prs:[pr]};
                                        } else {
                                            result.rejected[closingMonth].count++;
                                            result.rejected[closingMonth].prs.push(pr)
                                        }
                                    }
                                    

                                    
                                    contributor = pr.user_id
                                    if (!result.contributorsPerMonth.hasOwnProperty(createdMonth)) {
                                        result.contributorsPerMonth[createdMonth] = {}
                                    }
                                    
                                    if (!result.contributorsPerMonth[createdMonth].hasOwnProperty(contributor)) {
                                        result.contributorsPerMonth[createdMonth][contributor] = true;
                                    }
                                    
                                    if (!result.contributorsFirstMonth.hasOwnProperty(contributor)) {
                                        result.contributorsFirstMonth[contributor] = createdMonth;
                                        if (!result.firstTimeContributors.hasOwnProperty(createdMonth)) {
                                            result.firstTimeContributors[createdMonth] = 1;
                                        } else {
                                            result.firstTimeContributors[createdMonth]++;
                                        }
                                    } else if (new Date(result.contributorsFirstMonth[contributor]) > new Date(createdMonth)) {
                                        //oldMonth = this.contributorsFirstMonth[contributor].getFullYear() + "-" + (this.contributorsFirstMonth[contributor].getMonth() + 1)
                                        result.firstTimeContributors[result.contributorsFirstMonth[contributor]]--;

                                        if (!result.firstTimeContributors.hasOwnProperty(createdMonth)) {
                                            result.firstTimeContributors[createdMonth] = 1;
                                        } else {
                                            result.firstTimeContributors[createdMonth]++;
                                        }
                                        result.contributorsFirstMonth[contributor] = createdMonth;
                                    }
                                }
                            }
                        );
                    }, hitsTotal => {
                        return hitsTotal > result.prsCount
                    }).then(res => {
                        console.log(result)
                        function sortMonth(a,b) {
                            firstMonthParts = a.split('-');
                            secondMonthParts = b.split('-');
                            return (firstMonthParts[0] - secondMonthParts[0]) == 0 ? 
                                firstMonthParts[1] - secondMonthParts[1] :
                                firstMonthParts[0] - secondMonthParts[0];
                        }
                        now = new Date()
                        currentMonth = now.getFullYear() + "-" + (now.getMonth() + 1)
                        months = this.getMonthsByRange('12months', new Date()); //Object.keys(this.created).sort(sortMonth);
                        
                        outstanding = {}
                        processed = {};
                        processed.total = 0;
                        result.merged.total = 0;
                        result.rejected.total = 0;
                        result.created.total = 0;
                        result.firstTimeContributors.total = 0;
                        contributors = {}
                        contributors.total = 0;
                        rate = {};
                        
                        result.contributorsPerMonth.all = {}
                        months.map(month => {
                            processed[month] = 0;
                            if (result.created.hasOwnProperty(month)) {
                                //leftover = leftover + this.created[month].count;
                                result.created.total += result.created[month].count
                            } else {
                                result.created[month] = {count: 0}
                            }
                             
                            if (result.rejected.hasOwnProperty(month)) {
                                //leftover = leftover - this.rejected[month].count;
                                processed[month] += result.rejected[month].count
                                processed.total += result.rejected[month].count;
                                result.rejected.total += result.rejected[month].count;
                            } else {
                                result.rejected[month] = {count: 0}
                            }

                            if (result.merged.hasOwnProperty(month)) {
                                //leftover = leftover - this.merged[month].count;
                                processed[month] += result.merged[month].count
                                processed.total += result.merged[month].count;
                                result.merged.total += result.merged[month].count;
                                rate[month] = round((result.merged[month].count / processed[month]) * 100, 2)
                            } else {
                                rate[month] = 0;
                                result.merged[month] = {count: 0}
                            }
                            
                            if (result.firstTimeContributors.hasOwnProperty(month)) {
                                result.firstTimeContributors.total += result.firstTimeContributors[month]
                            } else {
                                result.firstTimeContributors[month] = 0
                            }
                            
                            if (result.contributorsPerMonth.hasOwnProperty(month)) {
                                contributors[month] = Object.keys(result.contributorsPerMonth[month]).length
                                Object.keys(result.contributorsPerMonth[month]).map(contributorId => {
                                    result.contributorsPerMonth.all[contributorId] = true;
                                })
                            } else {
                                contributors[month] = 0;
                            }
                            //outstanding.total += leftover
                            //outstanding[month] = leftover
                        })

                        leftover = 0;
                        Object.keys(result.created).sort(sortMonth).map(month => {
                            if (month == 'total') {
                                return;
                            }
                            if (result.created.hasOwnProperty(month)) {
                                leftover += result.created[month].count;
                                console.log(result.created[month], result.created[month].count)
                            }
                            if (result.rejected.hasOwnProperty(month)) {
                                leftover -= result.rejected[month].count;
                                console.log(result.rejected[month], result.rejected[month].count)
                            }
                            if (result.merged.hasOwnProperty(month)) {
                                leftover -= result.merged[month].count;
                                console.log(result.merged[month], result.merged[month].count)
                            }
                            outstanding[month] = leftover
                        })
                        outstanding.total = outstanding[currentMonth]

                        contributors.total = Object.keys(result.contributorsPerMonth['all']).length

                        function round(value, decimals) {
                            return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
                        }

                        rate.total = round((result.merged.total / processed.total) * 100, 2)

                        resolve(
                            {
                                range: months,
                                processed: processed,
                                rate: rate,
                                created: result.created,
                                merged: result.merged,
                                rejected: result.rejected,
                                firstTimeContributors: result.firstTimeContributors,
                                contributors: contributors,
                                outstanding: outstanding
                            }
                        )
                    }).catch(error => {
                        reject(error)
                    })
                } catch (e) {
                    reject(e)
                }
            })
        }
    }
        
    return loader;
}
module.exports = prsLoaderFactory;