
import 'angular';
import 'angular-ui-router';
import 'ui-router-extras';
import 'chart.js'
import 'angular-chart.js';
import elasticsearch from 'elasticsearch-browser';
import 'angular-ui-bootstrap';
import ElasticToChartsMapper from './map-elastic-to-chart.js'
import esFactory from './githubElasticAdapter.js'
import "bootstrap/dist/css/bootstrap.min.css"
import "./../less/typography.less"
import "./../less/universal.less"
import "./../less/partners.less"

'use strict';
var app = angular.module('gitStatUI', ['chart.js', 'ui.bootstrap']);


app.config(function (ChartJsProvider) {
        // Configure all charts
        ChartJsProvider.setOptions({
            colors: ['#97BBCD', '#DCDCDC', '#F7464A', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360']
        });
    });

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
app.directive('teamElement', function () {
    return {
        restrict: 'A',
        scope:{
            ngModel: '=team'
        },
        template: 
            "<td>{{ ngModel.name }}</td>" +
            "<td>{{ ngModel.membersNumber }}</td>" +
            "<td>{{ ngModel.prsNumberPartner }}</td>" +
            "<td>{{ ngModel.prsNumberOSS }}</td>" +
            "<td>{{ ngModel.points }}</td>"
    }
});    

app.controller('OMCcontroller', ['$scope', function ($scope) {
    var esAdapter = esFactory('http://127.0.0.1:9200/', 'github-prs');
    $scope.currentInterval = 'month';
    $scope.intervalValue = '';
    var clickHandler = function(event, chartData) {
        console.log(chartData[0]._model.label);
        $scope.intervalValue = chartData[0]._model.label;
        console.log($scope.currentInterval);
        if ($scope.currentInterval === 'month') {
            $scope.currentInterval = 'week'
        } else if ($scope.currentInterval === 'week') {
            $scope.currentInterval = 'day'
        }

        $scope.$apply(function() {
            if (chartData.length > 0) {
                esAdapter.loadPullRequests(ElasticToChartsMapper($scope, '', clickHandler).createMapper, $scope.currentInterval, $scope.intervalValue); 
            }
        });
    }
    esAdapter.loadPullRequests(ElasticToChartsMapper($scope, '', clickHandler).createMapper);
}]);

app.controller('ContributorsController', ['$scope', function ($scope) {
    var esAdapter = esFactory('http://127.0.0.1:9200/', 'github-prs');
    esAdapter.loadContributors(ElasticToChartsMapper($scope, 'Contributors', console.log).contributorsMapper);  
}]);

app.controller('TeamsController', ['$scope', function ($scope) {
    var esAdapter = esFactory('https://search-magento-partners-kxrre3hdvezhngpgs7myrcmr7a.us-east-1.es.amazonaws.com', 'github-teams');
    esAdapter.loadTeams(ElasticToChartsMapper($scope, 'Team', console.log).teamsMapper);
}]);