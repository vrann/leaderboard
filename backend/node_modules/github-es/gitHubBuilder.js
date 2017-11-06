var Bluebird = require('bluebird');
var GitHubApi = require("github");
var rp = require('request-promise');

module.exports = GitHubBuilder

function GitHubBuilder(gitHubToken) {
    var github = new GitHubApi({
        // optional
        debug: false,
        protocol: "https",
        host: "api.github.com",
        pathPrefix: "",
        headers: {
            "user-agent": "GitHub-Magento-Partners-Sttistic" 
        },
        Promise: Bluebird,
        followRedirects: false,
        timeout: 5000
    });

    github.authenticate({
        type: "token",
        token: gitHubToken,
    })
    
    github.getPullRequests = function(params) {
        pageUrl = ''
        if (params.hasOwnProperty("page")) {
            pageUrl = '&page=' + params.page;
        }

        updated = '';
        if (params.hasOwnProperty("updatedLastDays")) {
            var today = new Date();
            month = today. getMonth() + 1;
            year = today.getFullYear();
            day = today.getDate();
            updated = '+updated:' + year + '-' + month + '-' + day + 1 + '..' + year + '-' + month + '-' + day - params.updatedLastDays
        }

        uri = this.config.protocol + '://' + this.config.host + '/search/issues?q=is:' + params.state + '+type:pr+repo:' + params.user + '/' + params.repo + pageUrl + updated;
        console.log(uri);
        var options = {
            uri: uri,//'https://api.github.com/search/issues?q=is:closed+type:pr+repo:magento-partners/magento2ee&sort=created&%E2%80%8C%E2%80%8Border=as',
            qs: {
                access_token: this.auth.token // -> uri + '?access_token=xxxxx%20xxxxx'
            },
            headers: this.config.headers,
            json: true
        };
        return rp(options);
    }

    return github;
}