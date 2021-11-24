import aws = require('aws-sdk');
import express = require('express');

const s3 = new aws.S3();

let app = express()

app.get('/api', (req, res) => {
    res.send('hello world');
})
app.get('/api/gif', (req, res) => {
   (async () => {
        await s3
            .getObject({
                Bucket:'2itsof3-4-gifmaker',
                Key:'personacanvas.jpg'
            })
   })();
})
app.post('/api', (req, res) => {
    (async () => {
        await s3
            .putObject({
                Body:'hello world',
                Bucket:'testbucketlevi',
                Key:'helloworld.txt'

            }).promise()
    })();
    res.send("created");
})

app.listen(3000);