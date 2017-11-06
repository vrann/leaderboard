var prsLoaderFactory = function(client) {
    var loader = {
        prsCount: 0,
        created: {},
        contributorsFirstMonth: {},
        firstTimeContributors: {},
        contributorsPerMonth: {},
        merged: {},
        rejected: {},

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
            console.log(repositories)
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
                                this.prsCount++
                                repository = pr.baseOrganisation + '/' + pr.baseRepo
                                if (repositories.indexOf(repository) != -1) {
                                //if (repository == 'magento/magento2' || repository == 'magento-partners/magento2ce' || repository == 'magento-partners/magento2ee' || repository == 'magento-engcom/msi') {
                                    createdDate = new Date(pr.created_at)
                                    createdMonth = createdDate.getFullYear() + "-" + (createdDate.getMonth() + 1)
                                    if (!this.created.hasOwnProperty(createdMonth)) {
                                        this.created[createdMonth] = {count: 1, prs:[pr]};
                                    } else {
                                        this.created[createdMonth].count++;
                                        this.created[createdMonth].prs.push(pr)
                                    }
                                    

                                    if (pr.merged_at !== null) {
                                        mergedDate = new Date(pr.merged_at)
                                        mergeMonth = mergedDate.getFullYear() + "-" + (mergedDate.getMonth() + 1)
                                        if (!this.merged.hasOwnProperty(mergeMonth)) {
                                            this.merged[mergeMonth] = {count: 1, prs:[pr]};
                                        } else {
                                            this.merged[mergeMonth].count++;
                                            this.merged[mergeMonth].prs.push(pr)
                                        }
                                    } else if (pr.closed_at !== null) {
                                        closedDate = new Date(pr.closed_at)
                                        closingMonth = closedDate.getFullYear() + "-" + (closedDate.getMonth() + 1)
                                        if (!this.rejected.hasOwnProperty(closingMonth)) {
                                            this.rejected[closingMonth] = {count: 1, prs:[pr]};
                                        } else {
                                            this.rejected[closingMonth].count++;
                                            this.rejected[closingMonth].prs.push(pr)
                                        }
                                    }
                                    

                                    
                                    contributor = pr.user_id
                                    if (!this.contributorsPerMonth.hasOwnProperty(createdMonth)) {
                                        this.contributorsPerMonth[createdMonth] = {}
                                    }
                                    
                                    if (!this.contributorsPerMonth[createdMonth].hasOwnProperty(contributor)) {
                                        this.contributorsPerMonth[createdMonth][contributor] = true;
                                    }
                                    
                                    if (!this.contributorsFirstMonth.hasOwnProperty(contributor)) {
                                        this.contributorsFirstMonth[contributor] = createdMonth;
                                        if (!this.firstTimeContributors.hasOwnProperty(createdMonth)) {
                                            this.firstTimeContributors[createdMonth] = 1;
                                        } else {
                                            this.firstTimeContributors[createdMonth]++;
                                        }
                                    } else if (new Date(this.contributorsFirstMonth[contributor]) > new Date(createdMonth)) {
                                        //oldMonth = this.contributorsFirstMonth[contributor].getFullYear() + "-" + (this.contributorsFirstMonth[contributor].getMonth() + 1)
                                        this.firstTimeContributors[this.contributorsFirstMonth[contributor]]--;

                                        if (!this.firstTimeContributors.hasOwnProperty(createdMonth)) {
                                            this.firstTimeContributors[createdMonth] = 1;
                                        } else {
                                            this.firstTimeContributors[createdMonth]++;
                                        }
                                        this.contributorsFirstMonth[contributor] = createdMonth;
                                    }
                                }
                            }
                        );  
                    }, hitsTotal => {
                        return hitsTotal > this.prsCount
                    }).then(result => {
                        function sortMonth(a,b) {
                            firstMonthParts = a.split('-');
                            secondMonthParts = b.split('-');
                            return (firstMonthParts[0] - secondMonthParts[0]) == 0 ? 
                                firstMonthParts[1] - secondMonthParts[1] :
                                firstMonthParts[0] - secondMonthParts[0];
                        }
                        now = new Date()
                        currentMonth = now.getFullYear() + "-" + (now.getMonth() + 1)
                        console.log(Object.keys(this));
                        months = this.getMonthsByRange('12months', new Date()); //Object.keys(this.created).sort(sortMonth);
                        console.log(months);
                        leftover = 0;
                        outstanding = {}
                        processed = {};
                        processed.total = 0;
                        this.merged.total = 0;
                        this.rejected.total = 0;
                        this.created.total = 0;
                        this.firstTimeContributors.total = 0;
                        contributors = {}
                        contributors.total = 0;
                        rate = {};
                        Object.keys(this.created).sort(sortMonth).map(month => {
                            leftover += this.created[month].count;
                            console.log(month, this.created[month].count);
                            //console.log(this.created[month].count, this.rejected[month].count)
                            if (this.rejected.hasOwnProperty(month)) {
                                leftover -= this.rejected[month].count;
                                console.log(month, this.rejected[month].count)
                            }
                            if (this.merged.hasOwnProperty(month)) {
                                leftover -= this.merged[month].count;
                                console.log(month, this.merged[month].count)
                            }
                            console.log(leftover)
                            outstanding[month] = leftover
                        })
                        outstanding.total = outstanding[currentMonth]
                        this.contributorsPerMonth.all = {}
                        months.map(month => {
                            processed[month] = 0;
                            if (this.created.hasOwnProperty(month)) {
                                //leftover = leftover + this.created[month].count;
                                this.created.total += this.created[month].count
                            }
                             
                            if (this.rejected.hasOwnProperty(month)) {
                                console.log(this.rejected[month]);
                                //leftover = leftover - this.rejected[month].count;
                                processed[month] += this.rejected[month].count
                                processed.total += this.rejected[month].count;
                                this.rejected.total += this.rejected[month].count;
                            }

                            if (this.merged.hasOwnProperty(month)) {
                                console.log(this.merged[month]);
                                //leftover = leftover - this.merged[month].count;
                                processed[month] += this.merged[month].count
                                processed.total += this.merged[month].count;
                                this.merged.total += this.merged[month].count;
                                rate[month] = round((this.merged[month].count / processed[month]) * 100, 2)
                            } else {
                                rate[month] = 0;
                            }
                            
                            if (this.firstTimeContributors.hasOwnProperty(month)) {
                                this.firstTimeContributors.total += this.firstTimeContributors[month]
                            }
                            
                            if (this.contributorsPerMonth.hasOwnProperty(month)) {
                                contributors[month] = Object.keys(this.contributorsPerMonth[month]).length
                                Object.keys(this.contributorsPerMonth[month]).map(contributorId => {
                                    this.contributorsPerMonth.all[contributorId] = true;
                                })
                            }
                            //outstanding.total += leftover
                            //outstanding[month] = leftover
                        })

                        contributors.total = Object.keys(this.contributorsPerMonth['all']).length

                        function round(value, decimals) {
                            return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
                        }

                        rate.total = round((this.merged.total / processed.total) * 100, 2)

                        resolve(
                            {
                                range: months,
                                processed: processed,
                                rate: rate,
                                created: this.created,
                                merged: this.merged,
                                rejected: this.rejected,
                                firstTimeContributors: this.firstTimeContributors,
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