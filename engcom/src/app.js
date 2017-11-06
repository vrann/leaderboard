
//import 'angular';
//import 'angular-ui-router';
//import 'ui-router-extras';
import 'chart.js'
import 'angular-chart.js';
//import elasticsearch from 'elasticsearch-browser';
import 'angular-ui-bootstrap';
//import ElasticToChartsMapper from './map-elastic-to-chart.js'
//import esFactory from './githubElasticAdapter.js'
//import 'jquery'
//import "bootstrap/dist/css/bootstrap.min.css"
//import "bootstrap"
import "bootstrap/less/bootstrap.less"
import "./../less/typography.less"
import "./../less/universal.less"
import "./../less/partners.less"
import teamsLoaderFactory from "./teams-loader.js"
import prsLoaderFactory from "./prs-loader.js"
import EsBuilder from "./esBuilder.js"
import teamsRendererFactory from "./teamsRenderer.js"


'use strict';
var app = angular.module('gitStatUI', ['ui.bootstrap', "chart.js"]);
var esEndpoint = 'http://localhost:9200' 
//var esEndpoint = 'https://search-magento-partners-kxrre3hdvezhngpgs7myrcmr7a.us-east-1.es.amazonaws.com'


var client = EsBuilder(esEndpoint)
var teamsLoader = teamsLoaderFactory(client)
var prsLoader = prsLoaderFactory(client)

app.factory('TeamDataFactory', function() {
    var cache = {};
    return {
        getTeams: function(period, selectedPeriod, size) {
            return new Promise((resolve, reject) => {
                try {
                    //var period = scope.elementPeriod ? scope.elementPeriod : 'quater'
                    var key = period + ':' + selectedPeriod +':'+ size;
                    console.log(key)
                    if (cache.hasOwnProperty(key)) {
                        console.log('resolved from cache')
                        resolve(cache[key])
                    } else {
                        if (cache.hasOwnProperty('esresponse')) {
                            console.log('esresponse from cache')
                            result = {}
                            result = teamsRendererFactory(result).renderTeams(cache['esresponse'], period, selectedPeriod, size)
                            //console.log(result);
                            cache[key] = result;
                            resolve(cache[key])
                        } else {
                            teamsLoader.getTeams().then(response => {
                                cache['esresponse'] = response;
                                var result = {};
                                teamsRendererFactory(result).renderTeams(response, period, selectedPeriod, size)
                                cache[key] = result;
                                resolve(cache[key])
                            }).catch(reject)
                        }
                    }
                } catch (e) {
                    reject(e)
                }
                
            })
        }
    }
});


app.config((ChartJsProvider) => {
    ChartJsProvider.setOptions('Line', {
        colours: [
            {
              fillColor: "rgba(224, 108, 112, 1)",
              strokeColor: "rgba(207,100,103,1)"
            },
            {
              fillColor: 'rgba(144, 185, 18, 1)',
              strokeColor: 'rgba(47, 132, 71, 1)',
              highlightFill: 'rgba(47, 132, 71, 1)',
              highlightStroke: 'rgba(47, 132, 71, 1)'
            },
            {
              fillColor: 'rgba(144, 185, 18, 1)',
              strokeColor: 'rgba(47, 132, 71, 1)',
              highlightFill: 'rgba(47, 132, 71, 1)',
              highlightStroke: 'rgba(47, 132, 71, 1)'
            },
            {
              fillColor: 'rgba(144, 185, 18, 1)',
              strokeColor: 'rgba(47, 132, 71, 1)',
              highlightFill: 'rgba(47, 132, 71, 1)',
              highlightStroke: 'rgba(47, 132, 71, 1)'
            }
          ]
        //colors: ['#97BBCD', '#DCDCDC', '#F7464A', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360']
    });
    // ChartJsProvider.setOptions({onAnimationComplete: () => {
    //     alert('test1');
    //     console.log('black');
    //     this.datasets[0].points[2].fillColor = "black";
    //     this.update()
    // }}); 
});

var teamTemplateUrl = require('ngtemplate-loader!html-loader!./widgets/teams.html');

app.directive('teamElement', function () {
    return {
        templateUrl: teamTemplateUrl,
        link: function($scope, element, attributes) {
            $scope.gridSize = attributes.size
            $scope.showSelect = attributes.showselect
            $scope.showButton = attributes.showbutton
            $scope.showSizeSelector = attributes.showsizeselector
            $scope.elementPeriod = attributes.period
        }
    }
});

var teamChartTemplateUrl = require('ngtemplate-loader!html-loader!./widgets/charts.html');
app.directive('teamChartElement', function () {
    return {
        templateUrl: teamChartTemplateUrl,
        link: function($scope, element, attributes) {
            $scope.gridSize = attributes.size
            $scope.showSelect = attributes.showselect
            $scope.showButton = attributes.showbutton
            $scope.showSizeSelector = attributes.showsizeselector
            $scope.elementPeriod = attributes.period
        }
    }
});

var contributorsTemplateUrl = require('ngtemplate-loader!html-loader!./widgets/contributors.html');

app.directive('openSourceElement', function () {
    return {
        templateUrl: contributorsTemplateUrl,

        link: function($scope, element, attributes) {
            $scope.gridSize = attributes.size
            $scope.showSelect = attributes.showselect
            $scope.showButton = attributes.showbutton
            $scope.showSizeSelector = attributes.showsizeselector
            $scope.elementPeriod = attributes.period
        }
    }
});    

app.controller('PrChartController', ['$scope', 'TeamDataFactory' , function ($scope, TeamDataFactory) {
    //$http.get('https://s3.amazonaws.com/public.magento.com/partners.leaderboard-monthly-test.js')
    //teamsLoader.getTeams().then(response => {
        
        var period = $scope.elementPeriod ? $scope.elementPeriod : 'quater'
        TeamDataFactory.getTeams(period, 'all', -1).then(response => {
            console.log('resolved!', response)
            Object.keys(response).map(key => {
                $scope[key] = response[key];
            })
            $scope.$apply(drawChart);  
        })
        
        //teamsRendererFactory($scope).renderTeams(response, period, 'all', -1)  
        
        
        //console.log('data', $scope.periods);
        // $scope.labels = $scope.periods.reduce((result, element) => {
        //     result.push(element.label);
        //     return result;
        // }, [])

        $scope.setTeamsPeriod = function(period, alias) {
            TeamDataFactory.getTeams(period, 'all', $scope.gridSize).then(response => {
                console.log('resolved!', response)
                Object.keys(response).map(key => {
                    $scope[key] = response[key];
                })
                $scope.$apply(drawChart);  
            })
            // teamsRendererFactory($scope).renderTeams(response, period, 'all', $scope.gridSize)
            // drawChart();
        }

        $scope.setTeamsPeriodElement = function(period, currentPeriod) {
            //teamsRendererFactory($scope).renderTeams(response, period, currentPeriod, $scope.gridSize)
            $scope.selectedPeriod = $scope.currentPeriod
            //drawChart();

            TeamDataFactory.getTeams(period, currentPeriod, $scope.gridSize).then(response => {
                console.log('resolved!', response)
                Object.keys(response).map(key => {
                    $scope[key] = response[key];
                })
                $scope.$apply(drawChart);  
            })
        }
        $scope.setSize = function(size) {
            $scope.gridSize = size;
            // teamsRendererFactory($scope).renderTeams(response, period, currentPeriod, size)
            // drawChart();

            TeamDataFactory.getTeams(period, currentPeriod, size).then(response => {
                console.log('resolved!', response)
                Object.keys(response).map(key => {
                    $scope[key] = response[key];
                })
                $scope.$apply(drawChart);  
            })
        }
        

        function drawChart() {
            $scope.labels = Object.keys($scope.perMonth);//["January", "February", "March", "April", "May", "June", "July"];

            data = {
              prs: [],
              //prsAccepted: [],
              //commercePRs: [],
              //ossPRs: [],
              //closed: []
          };
            Object.keys($scope.perMonth).map(month => {
              Object.keys(data).map(totalKey => {
                  $scope.perMonth[month][totalKey]
                  data[totalKey].push($scope.perMonth[month][totalKey]);
              })
            })

            $scope.series = Object.keys(data) //['Series A', 'Series B'];
            $scope.data = [];
            Object.keys(data).map(totalKey => {
              $scope.data.push(data[totalKey])
            })

            //console.log(points, evt);
            
          //   [
          //     [65, 59, 80, 81, 56, 55, 40],
          //     [28, 48, 40, 19, 86, 27, 90]
          //   ];
            $scope.onClick = function (points, evt) {
              console.log(points, evt);
            };
            $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
            $scope.options = {
              scales: {
                yAxes: [
                  {
                    id: 'y-axis-1',
                    type: 'linear',
                    display: true,
                    position: 'left'
                  },
                  {
                    id: 'y-axis-2',
                    type: 'linear',
                    display: true,
                    position: 'right'
                  }
                ]
              }
            };
      }
    //})
}])

app.controller('TeamsController', ['$scope', '$http', 'TeamDataFactory', function ($scope, $http, TeamDataFactory) {
    var period = $scope.elementPeriod ? $scope.elementPeriod : 'quater'
    if ($scope['gridSize'] == undefined) {
        $scope['gridSize'] = -1;
    }
    TeamDataFactory.getTeams(period, 'all', $scope['gridSize']).then(response => {
        console.log('resolved!', response)
        $scope.$apply(() => {
            Object.keys(response).map(key => {
                $scope[key] = response[key];
            })
        });  
    })

    //teamsLoader.getTeams().then(response => {
    //$http.get('https://s3.amazonaws.com/public.magento.com/partners.leaderboard-monthly-test.js').then(response => {
        $scope.setTeamsPeriodSelect = function(period, alias) {
            $scope.currentPeriod = $scope.selectedPeriod
            //teamsRendererFactory($scope).renderTeams(response, period, $scope.selectedPeriod, $scope.gridSize)
            TeamDataFactory.getTeams(period, $scope.selectedPeriod, $scope.gridSize).then(response => {
                console.log('resolved!', response)
                $scope.$apply(() => {
                    Object.keys(response).map(key => {
                        $scope[key] = response[key];
                    })
                });  
            })
        }

        // $scope.$apply(() => {
        //     $scope.keys = Object.keys
        //     $scope.response = response
        //     var period = $scope.elementPeriod ? $scope.elementPeriod : 'quater'
        //     if ($scope['gridSize'] == undefined) {
        //         $scope['gridSize'] = -1;
        //     }
        //     teamsRendererFactory($scope).renderTeams(response, period, 'all', $scope.gridSize)
        // })
          
        
        $scope.setTeamsPeriod = function(period, alias) {
            //teamsRendererFactory($scope).renderTeams(response, period, 'all', $scope.gridSize)
            TeamDataFactory.getTeams(period, 'all', $scope.gridSize).then(response => {
                console.log('resolved!', response)
                $scope.$apply(() => {
                    Object.keys(response).map(key => {
                        $scope[key] = response[key];
                    })
                });  
            })
        }

        $scope.setTeamsPeriodElement = function(period, currentPeriod) {
            //teamsRendererFactory($scope).renderTeams(response, period, currentPeriod, $scope.gridSize)
            TeamDataFactory.getTeams(period, currentPeriod, $scope.gridSize).then(response => {
                console.log('resolved!', response)
                $scope.$apply(() => {
                    Object.keys(response).map(key => {
                        $scope[key] = response[key];
                    })
                });  
            })
            $scope.selectedPeriod = $scope.currentPeriod
        }
        $scope.setSize = function(size) {
            $scope.gridSize = size;
            //teamsRendererFactory($scope).renderTeams(response, period, currentPeriod, size)
            TeamDataFactory.getTeams(period, currentPeriod, size).then(response => {
                console.log('resolved!', response)
                $scope.$apply(() => {
                    Object.keys(response).map(key => {
                        $scope[key] = response[key];
                    })
                });  
            })
        }
      //}).catch(e => {console.log('Error:', e)})
}]);

app.controller('OpenSourceController', ['$scope', '$http', function ($scope, $http) {
    $http.get('https://s3.amazonaws.com/public.magento.com/leadersboard.js').then(response => {
        
        var structure = response.data;
        //console.log(structure)
        $scope.types = Object.keys(structure);
        var type = $scope.types[0]
        $scope.data = {}
        //$scope.types.map(type => {
            var current = structure[type].periods[structure[type].periods.length - 1]
            $scope.data[type] = {
                current: current,
                contributors: structure[type].contributors[current.value],
                periods: structure[type].periods,
                selected: current.value
            }    
        //})

        $scope.setPeriod = function(period) {
            var current = structure[period].periods.find(element => {
                return element.value === $scope.data[period].selected
            })
            $scope.data[period] = {
                current: current,
                contributors: structure[period].contributors[current.value],
                periods: structure[period].periods,
                selected: current.value
            }
        }

        $scope.setCurrentPeriod = function(period) {
            $scope.data = {}
            var current = structure[period].periods[structure[period].periods.length - 1]
            $scope.data[period] = {
                current: current,
                contributors: structure[period].contributors[current.value],
                periods: structure[period].periods,
                selected: current.value
            }
        }
    }).catch(console.log)
    
}]);


var prsTemplateUrl = require('ngtemplate-loader!html-loader!./widgets/prs.html');

app.directive('prsElement', function () {
    return {
        templateUrl: prsTemplateUrl,

        link: function($scope, element, attributes) {
        }
    }
});  

app.controller('PRsController', ['$scope', function ($scope) {
    // var client = EsBuilder(esEndpoint)
    // client.loadData({
    //     index: 'github-prs',
    //     type: 'github-pr',
    //     size: 1000,
    //     body: {
    //         "query":{"term":{"state": "open"}}
    //     }    
    // }, response => {
    //     //$scope.$apply(function() {
    //         $scope.prs = response.hits.hits;
    //     //})
    //     //console.log($scope);
    // }, hitsTotal => {
    //     return false;
    // })
}]);

var statisticTemplateUrl = require('ngtemplate-loader!html-loader!./widgets/statistic.html');

app.directive('statisticElement', function () {
    return {
        templateUrl: statisticTemplateUrl,
        restrict: 'E',
        scope: {
            repositories: '=',
        },
        controller: 'EngcomController'
    }
}); 

app.controller('EngcomController', ['$scope', '$attrs', function ($scope, $attrs) {
    prsLoader.getPrsStatistic($attrs.repositories.split(';')).then(response => {
        //console.log('resolved!', response)

        $scope.$apply(() => {

            // $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
            // $scope.series = ['Series A', 'Series B'];
            // $scope.data = [
            //   [65, 59, 80, 81, 56, 55, 40],
            //   [28, 48, 40, 19, 86, 27, 90]
            // ];
            // $scope.onClick = function (points, evt) {
            //   console.log(points, evt);
            // };
            // $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
            // $scope.options = {
            //   scales: {
            //     yAxes: [
            //       {
            //         id: 'y-axis-1',
            //         type: 'linear',
            //         display: true,
            //         position: 'left'
            //       },
            //       {
            //         id: 'y-axis-2',
            //         type: 'linear',
            //         display: true,
            //         position: 'right'
            //       }
            //     ]
            //   }
            // };
        //});    


            
            var printCounts = function(countsObject, range) {
                var values = []
                range.map(function(month) {
                    values.push(countsObject[month].count)
                })
                console.log('frontend', values);
                return values;
            }
            
            var printElements = function(countsObject, range) {
                var values = []
                range.map(function(month) {
                    values.push(countsObject[month])
                })
                return values;
            }
    
            var printArray = function(arrayInput) {
                return arrayInput;
            }
            Object.keys(response).map(key => {
                $scope[key] = response[key];
            })

            $scope.labels = printArray($scope.range)
            $scope.series = ['Created', 'Processed', 'Outstanding'] //['Series A', 'Series B'];
            $scope.data = [];
            $scope.data.push(printCounts($scope.created, $scope.range))
            $scope.data.push(printElements($scope.processed, $scope.range))
            $scope.data.push(printElements($scope.outstanding, $scope.range))

            //$scope.colors = ["rgba(159,204,0,0.5)","rgba(250,109,33,0.7)","#000000"];
            $scope.options = {

                      elements: {
                        // line: {
                        //   borderWidth: 2,
                        //   fill: false
                        // },
                        // point: {
                        //   radius: 10
                        // }
                      },
                      scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero:true
                            }
                        }]
                    }
                    };
                    
                    
                    $scope.datasetOverride = [
                        {
                            label: 'Created',
                            steppedLine: false,
                            fill: true,
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            borderColor: 'rgba(255,99,132,1)',
                            borderWidth: 1
                        },
                        {
                            label: 'Processed',
                            steppedLine: false,
                            fill: true,
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            borderColor: 'rgba(54, 162, 235, 0.2)',
                            borderWidth: 1
                        },
                        {
                            label: 'Outstanding',
                            steppedLine: false,
                            fill: false,
                            backgroundColor: 'rgba(255, 0, 0, 1)',
                            borderColor: 'rgba(0,0,0, 1)',
                            borderWidth: 2,
                        }
                        // {
                        //   label: ['something', 'otherthing'],
                        //   borderWidth: [1,2],
                        //   backgroundColor: ['#FF4242','#2291ff'],
                        //   line: {
                        //       fill: true
                        //   },
                        //   fill: true
                        // }
                    ]        
            console.log($scope.labels, $scope.series, $scope.data)
        });
    })
}]);