import aws = require('aws-sdk');
import express = require('express');
import axios = require('axios');
import {v4} from 'uuid';

const s3 = new aws.S3();
const bucketName = "2itsof3-4-gifmaker"


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

app.get('/getuploadurl', (req,res) => {
    const objectId = v4();
    console.log("Return upload url with objectid: ", objectId)
    const generatedUrl = generatePutUrl(objectId);
    res.json(generatedUrl);
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

function generateGetUrl(objectId){
    return s3.getSignedUrl("getObject",{
        Key: objectId,
        Bucket: bucketName,
        Expires: 900
    })
}

function generatePutUrl(objectId) {
    return s3.getSignedUrl("putObject",{
        Key: objectId,
        Bucket: bucketName,
        Expires: 900
    })
}

app.listen(3000);