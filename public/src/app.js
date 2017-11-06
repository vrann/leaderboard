import 'angular-ui-bootstrap';
import "bootstrap/less/bootstrap.less"
import "./../less/typography.less"
import "./../less/universal.less"
import "./../less/partners.less"
import teamsRendererFactory from "./teamsRenderer.js"

'use strict';

var app = angular.module('gitStatUI', ['ui.bootstrap']);

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

app.controller('TeamsController', ['$scope', '$http', function ($scope, $http) {

    $http.get('https://s3.amazonaws.com/public.magento.com/partners.leaderboard-monthly.js').then(response => {
        $scope.setTeamsPeriodSelect = function(period, alias) {
            $scope.currentPeriod = $scope.selectedPeriod
            teamsRendererFactory($scope).renderTeams(response.data, period, $scope.selectedPeriod, $scope.gridSize)
        }

        $scope.response = response
            var period = $scope.elementPeriod ? $scope.elementPeriod : 'quater'
            //var currentPeriod = 'all'
            if ($scope['gridSize'] == undefined) {
                $scope['gridSize'] = -1;
            }
            teamsRendererFactory($scope).renderTeams(response.data, period, 'all', $scope.gridSize)    
            
            $scope.setTeamsPeriod = function(period, alias) {
                teamsRendererFactory($scope).renderTeams(response.data, period, 'all', $scope.gridSize)
            }

            $scope.setTeamsPeriodElement = function(period, currentPeriod) {
                teamsRendererFactory($scope).renderTeams(response.data, period, currentPeriod, $scope.gridSize)
                $scope.selectedPeriod = $scope.currentPeriod
            }
            $scope.setSize = function(size) {
                $scope.gridSize = size;
                teamsRendererFactory($scope).renderTeams(response.data, period, currentPeriod, size)
            }
      }).catch(e => {console.log('Error:', e)})
}]);

app.controller('OpenSourceController', ['$scope', '$http', function ($scope, $http) {
    $http.get('https://s3.amazonaws.com/public.magento.com/leadersboard.js').then(response => {
        var structure = response.data;
        $scope.types = Object.keys(structure);
        var type = $scope.types[0]
        $scope.data = {}
        var current = structure[type].periods[structure[type].periods.length - 1]
        $scope.data[type] = {
            current: current,
            contributors: structure[type].contributors[current.value],
            periods: structure[type].periods,
            selected: current.value
        }    

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