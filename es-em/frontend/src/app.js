
//import 'angular';
//import 'angular-ui-router';
//import 'ui-router-extras';
//import 'chart.js'
//import 'angular-chart.js';
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


//import "bootstrap/js/modal.js"

//import teamsLoaderFactory from "./teamsLoader.js"
import teamsRendererFactory from "./teamsRenderer.js"


'use strict';
//'chart.js', 'ui.bootstrap'
var app = angular.module('gitStatUI', ['ui.bootstrap']);
//var esEndpoint = 'http://127.0.0.1:9200/'
var esEndpoint = 'https://search-magento-partners-kxrre3hdvezhngpgs7myrcmr7a.us-east-1.es.amazonaws.com'
var EsBuilder = require('./esBuilder')

//app.teams = getCommerceStatisticData();


// app.config(function (ChartJsProvider) {
//         // Configure all charts
//         ChartJsProvider.setOptions({
//             colors: ['#97BBCD', '#DCDCDC', '#F7464A', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360']
//         });
//     });

    /**
     * {
            name: team._source.name,
            membersNumber: team.members.length,
            prsNumberTotal: team.prs.length,
            prsNumberPartner: 0,
            prsNumberOSS: 0,
            complexity: [{complex: 1, color:#xxxx}, {advanced: 1, color: #xxxx}],
            achievements: [{tests:1, color:#xxxx}],
            category: [{API:1, color:#xxxx}],
            points: 10
        }
     */
// app.directive('teamElement', ['$templateCache', function($templateCache) {
//     var url = 'src/widgets/teams.html';
//     $templateCache.put(url, require(url));
//     return {
//         templateUrl: 'widgets/teams.html'
//     }
// }])


var teamTemplateUrl = require('ngtemplate-loader!html-loader!./widgets/teams.html');

app.directive('teamElement', function () {
    return {
        templateUrl: teamTemplateUrl,
        // scope: {
        //     //test: '=test',
        //     aliasName: '@aliasname',
        //     gridSize: '@size',
        //     showSelect: '@showselect',
        //     showSizeSelector: '@showsizeselector',
        //     elementPeriod: '@period'
        // },
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

// app.controller('OMCcontroller', ['$scope', function ($scope) {
//     var esAdapter = esFactory(esEndpoint, 'github-prs');
//     $scope.currentInterval = 'month';
//     $scope.intervalValue = '';
//     var clickHandler = function(event, chartData) {
//         console.log(chartData[0]._model.label);
//         $scope.intervalValue = chartData[0]._model.label;
//         console.log($scope.currentInterval);
//         if ($scope.currentInterval === 'month') {
//             $scope.currentInterval = 'week'
//         } else if ($scope.currentInterval === 'week') {
//             $scope.currentInterval = 'day'
//         }

//         $scope.$apply(function() {
//             if (chartData.length > 0) {
//                 esAdapter.loadPullRequests(ElasticToChartsMapper($scope, '', clickHandler).createMapper, $scope.currentInterval, $scope.intervalValue); 
//             }
//         });
//     }
//     esAdapter.loadPullRequests(ElasticToChartsMapper($scope, '', clickHandler).createMapper);
// }]);

// app.controller('ContributorsController', ['$scope', function ($scope) {
//     var esAdapter = esFactory(esEndpoint, 'github-prs');
//     esAdapter.loadContributors(ElasticToChartsMapper($scope, 'Contributors', console.log).contributorsMapper);  
// }]);

app.controller('TeamsController', ['$scope', '$http', function ($scope, $http) {

    $http.get('https://s3.amazonaws.com/public.magento.com/partners.leaderboard-monthly-test.js').then(response => {
        // if (!$scope.$parent.hasOwnProperty('data')) {
        //     $scope.$parent['data'] = {}
        // }
        // $scope.$parent.$watch('data', function (event, data) {
        //     console.log($scope.aliasName, data)
        //     $scope.data = {}
        //     $scope.data[$scope.aliasName] = data[$scope.aliasName];
        // });
        //console.log('Response')
        $scope.setTeamsPeriodSelect = function(period, alias) {
            //console.log(period, alias)
            //console.log(period, alias, $scope.data[alias].selectedPeriod)
            $scope.currentPeriod = $scope.selectedPeriod
            //console.log($scope.$parent.currentPeriod)

            teamsRendererFactory($scope).renderTeams(response.data, period, $scope.selectedPeriod, $scope.gridSize)

            //$scope.$parent.data[alias].selectedPeriod = $scope.$parent.data[alias].currentPeriod
            //console.log($scope.$parent.data[alias].selectedPeriod, $scope.$parent.data[alias].currentPeriod, $scope.$parent.data)
            //console.log($scope)
        }

        
        //console.log($scope)
        $scope.response = response
        //$scope.aliases.map(alias => {
            var period = $scope.elementPeriod ? $scope.elementPeriod : 'all'
            //console.log(period)
            var currentPeriod = 'all'
            //$scope['currentPeriod'] = currentPeriod;
            //console.log(currentPeriod)
            if ($scope['gridSize'] == undefined) {
                $scope['gridSize'] = -1;
            }
            teamsRendererFactory($scope).renderTeams(response.data, period, 'all', $scope.gridSize)    
            
            $scope.setTeamsPeriod = function(period, alias) {
                //console.log(period, 'all')
                teamsRendererFactory($scope).renderTeams(response.data, period, 'all', $scope.gridSize)
            }

            $scope.setTeamsPeriodElement = function(period, currentPeriod) {
                //console.log(period, currentPeriod, $scope.currentPeriod)
                teamsRendererFactory($scope).renderTeams(response.data, period, currentPeriod, $scope.gridSize)
                $scope.selectedPeriod = $scope.currentPeriod
            }
            $scope.setSize = function(size) {
                //console.log(size)
                $scope.gridSize = size;
                teamsRendererFactory($scope).renderTeams(response.data, period, currentPeriod, size)
            }
            
        //})

        
        
        
        //console.log($scope)
      }).catch(e => {console.log('Error:', e)})
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
    var client = EsBuilder(esEndpoint)
    client.loadData({
        index: 'github-prs',
        type: 'github-pr',
        size: 1000,
        body: {
            "query":{"term":{"state": "open"}}
        }    
    }, response => {
        $scope.$apply(function() {
            $scope.prs = response.hits.hits;
        })
        console.log($scope);
    }, hitsTotal => {
        return false;
    })
}]);