var elasticsearch = require('elasticsearch-browser');

module.exports = EsBuilder

 function EsBuilder(elasticsearchEndpoint) {
    var client = new elasticsearch.Client({
        host: elasticsearchEndpoint,
        //log: 'trace'
    });

    client.ping({
        // ping usually has a 3000ms timeout
        requestTimeout: 1000
        }, function (error) {
        if (error) {
            console.trace('elasticsearch cluster is down!');
        } else {
            //console.log('All is well');
        }
    });

    client.loadData = function(config, callback, shouldScroll) {
        config.scroll = '60s';
        var callFunc = this.search
        if (config.body.hasOwnProperty('scroll_id')) {
            callFunc = this.scroll
        }
        return callFunc.call(this, config).then(
            response => {
                callback.call(this, response)
                if (shouldScroll(response.hits.total)) {
                    return this.loadData({
                        body: {
                            scroll_id: response._scroll_id
                        }
                    }, callback, shouldScroll)
                } else {
                    return new Promise(function(resolve, reject) {resolve("Finished")});
                }
            }
        )
    }.bind(client)
    
    return client;
}