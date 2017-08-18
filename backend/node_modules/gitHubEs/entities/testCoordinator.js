var coordinatorFactory = require('gitHubEs/entities/coordinator.js')
var EsBuilder = require('gitHubEs/esBuilder')



function test(var1, var2) {
    p1 = var1;
    p2 = var2;

    //test1();
    //x = test1.bind(this)
    //x();
    //console.log("test")
    return new Promise(function(resolve, reject) {
        [1, 2].map(function() {
            console.log(p1);
            test1().then(resolve).catch(reject)
            //resolve('yes');
        })
    }.bind(this))

    function test1() {
        return new Promise(function(resolve, reject) {
            console.log(p1);
            console.log(p2);
        }.bind(this));    
    }

    function test2() {
        console.log(var1);
        console.log(var2);
    }

}

test('hello', 'world').then(console.log);



// elasticsearchEndpoint = 'http://localhost:9200'
// client = EsBuilder(elasticsearchEndpoint)

// var mytype = {
//         getCreateObject: function(data, updateData, config) {
//             updateObject  = this.getUpdateObject(data, updateData, config)
//             Object.keys(updateObject).map(function(key, index) {
//                 data[key] = updateObject[key];
//             });
//             return data
//         },

//         getUpdateObject: function(document, updateData, config) {
//             updateObject = updateData
//             return updateObject;
//         }
// }

// coord = coordinatorFactory.get({
//     client,
//     useQueue: true
// })
// //console.log(coord)
// //coord.createOrUpdate(mytype, {name: "test", id: 1}, {}, {idField: "id"});
// Promise.all([
//     coord.createOrUpdate({index: 'my-index', type: 'my-type'}, mytype, {name: "test", id: 1}, {}, {idField: "id"}),
//     coord.createOrUpdate({index: 'my-index', type: 'my-type'}, mytype, {name: "test2", id: 1}, {}, {idField: "id"})    
// ]).then(function(response) {
//         console.log(response); 
//         coord.getQueueSize()
//     })
//     .catch(console.log)
// //coord.getQueueSize();
// //coord.processQueue();