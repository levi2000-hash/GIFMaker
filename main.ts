import aws = require('aws-sdk');
import express = require('express');
import axios = require('axios');
import {v4} from 'uuid';

const s3 = new aws.S3();
const bucketName = 'levi-test-2021'

let app = express()
app.use(express.json())

app.get('/getuploadurl', (req,res) => {
    const objectId = v4();
    console.log("Return upload url with objectid: ", objectId)
    const generatedUrl = generatePutUrl(objectId,'image/jpg');
    res.json(generatedUrl);
})

app.post('/signaluploadcompleted', (req,res) => {
    const {uploadUrls} = req.body;
    
    const objectIds = uploadUrls.map(uploadurls => extractObjectId(uploadurls));
    
    const inputImageUrls = objectIds.map(id => generateGetUrl(id));
    
    const outputObjectId = v4();
    console.log('Output id: ',outputObjectId);
    
    const outputImageUrl = generatePutUrl(outputObjectId, 'image/gif');
    
    axios.post('https://msw310j97f.execute-api.eu-west-1.amazonaws.com/Prod/generate/gif', {
        inputImageUrls,
        outputImageUrl
    },
    {headers: {
        'x-api-key':''//haal api key van postman file van lector
    }})
    .then(function (response) {
        const gifUrl = generateGetUrl(outputObjectId);
        res.json(gifUrl);
    })
    .catch(function (error) {
        res.status(500).json(error);
    });

})

function generateGetUrl(objectId){
    return s3.getSignedUrl("getObject",{
        Key: objectId,
        Bucket: bucketName,
        Expires: 900
    })
}

function generatePutUrl(objectId, contentType) {
    return s3.getSignedUrl("putObject",{
        Key: objectId,
        Bucket: bucketName,
        Expires: 900,
        ContentType: contentType
    })
}

function extractObjectId(url){
    const urlZonderMark = url.split("?")[0];
    const splitUrlSlashes = urlZonderMark.split('/');
    return splitUrlSlashes[splitUrlSlashes.length - 1];
}

app.listen(3000);