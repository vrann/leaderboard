var aggregator = {
    // schema: [
    //     count,
    //     total
    // ],
    operation: function(element) {
        result = {
            'total': 0
        }
        createdDate = new Date(element.created_at)
        createdMonth = createdDate.getFullYear() + "-" + (createdDate.getMonth() + 1)
        if (!result.hasOwnProperty(createdMonth)) {
            result[createdMonth] = {count: 1, prs:[pr]};
        } else {
            result[createdMonth].count++;
            result[createdMonth].prs.push(pr)
        }
        return result;
    }
}
module.exports = aggregator;

//how is it implemented in MapReduce??

//considerations
//output schema should be able to define outside, so that we aware of it in the consequent aggregations
//user starts from defining the schema:
//scema of data source is known
//user defines schema of first layer of aggregations
// {created: aggregator => {
//     count: 
//     prs: 
// }, {rejected: {
//     count:
//     prs:
// }