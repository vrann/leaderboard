const express = require('express')
var bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json());

app.post('/', function(req, res) {
    console.log(req.headers);
    console.log(req.body);
    res.send('hello world');
});

app.listen(4567, function () {
  console.log('Example app listening on port 4567!')
})