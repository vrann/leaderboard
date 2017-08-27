var teamsRendererFactory = function($scope) {
    return {
        renderTeams(teams) {
            $scope.$apply(function() {
                $scope['labelsTeam'] = ["Team Name", "Members", "PRs Total", "PRs Accepted", "PRs Partners", "PRs Open Source", 
                //"PRs Numbers", "Complexity", "Special Achievements", "Category", 
                "Total Points"]
                $scope['teamInfo'] = teams;
            })
        }
    }
}

module.exports = teamsRendererFactory