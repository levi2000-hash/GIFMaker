import aws = require('aws-sdk');
import express = require('express');
import axios from 'axios';
import { v4 } from 'uuid';
import cookieParser  from 'cookie-parser'
import jwt from 'jsonwebtoken';

aws.config.update(
    {
        accessKeyId: "ASIAVUZ3GXGTXQWBU2XD",
        secretAccessKey: "mnPNoJMJCKdCG1evMinsD5ipeHHTt37HmvAawMvl",
        region: "us-east-1",
        signatureVersion: "v4",
        sessionToken: "FwoGZXIvYXdzEKj//////////wEaDIPxXWD2Kigbbcq7ByLLAYQk+J0006cPUDMyAc8dhP95dC8zwyaOzo/Vjoz81uiGEtlsoySVk5xCI1lqB+RJfgi2jtanm7CnKj8HxRgPKv9leRBgVxg0TB0Ebm7DU4PMTSP8/y8dWtMb3asWGc6cbXfjbrWJ7OnD91La/VskgQmQvS4rlo6zQMmfMW3vFljAexp8AC6EVdxH9gAwPGUjSUAPizuBwATmxkdu3bQi4Hs7rtlmUfgZohNpbngx04+07djTQP2+MqY2ur93zq8IDgwHYH7Yr+Mi3jutKMvP6Y0GMi2hzFM36GugUMbZutBFqin59iloTbLDKS7P87YWdV843Qq8qh+cwqy6J2g64GM="
    }
)

const s3 = new aws.S3();
const bucketName = 'gifmaker-test-robbe'

let app = express()
app.use(express.json())
app.use(cookieParser())

app.get("/api/hello", (req, res) => {
    res.json("Hello world!");
});

app.post("/api/exchange-code", (req, res) => {

    const { code } = req.body;
    const grant_type = "authorization_code";
    const client_id = "2fd7u0fag5vsa4hgdlkefsifde"
    const redirect_uri = "http://localhost:4000/gifmaker"
    const client_secret = "1t8q0alve7mknh2ubcvqj8febsmhv6agpg0tb7t14m4t225dop68"

    const params = new URLSearchParams({ grant_type, client_id, redirect_uri, code })

    axios.post("https://gifmaker.auth.us-east-1.amazoncognito.com/oauth2/token",
        params.toString(),
        {
            headers: {
                //VERY IMPORTANT. Not mentioned in tutorial from school
                ContentType: "application/x-www-form-urlencoded"
            },
            auth: {
                username: client_id,
                password: client_secret
            }
        }).then(result => {

            //Get unique user ID (sub) from id_token jwt
            let sub = jwt.decode(result.data.id_token).sub
            console.log(sub)

            res.cookie('loggedIn', true)
            res.cookie('id_token', result.data.id_token, { httpOnly: true })
            res.json(result.data)
        }).catch(err => {
            console.error(err)
            res.status(500).json(err)
        })
})

app.get('/api/imageurl', (req, res) => {

    if(!req.cookies)
    {
        respondUnauthorized(res)
    }

    else if(!req.cookies.id_token)
    {
        respondUnauthorized(res)
    }
    
    else{

    const objectId = v4();
    console.log("Return upload url with objectid: ", objectId)
    const generatedUrl = generatePutUrl(objectId, 'image/jpg');
    res.json(generatedUrl);
    }
})

app.post('/api/signaluploadcompleted', (req, res) => {

    if(!req.cookies)
    {
        respondUnauthorized(res)
    }

    else if(!req.cookies.id_token)
    {
        respondUnauthorized(res)
    }
    
    else{

    

    const { uploadUrls } = req.body;

    const objectIds = uploadUrls.map(uploadurls => extractObjectId(uploadurls));

    const inputImageUrls = objectIds.map(id => generateGetUrl(id));

    const outputObjectId = v4();
    console.log('Output id: ', outputObjectId);

    const outputImageUrl = generatePutUrl(outputObjectId, 'image/gif');

    axios.post('https://msw31oj97f.execute-api.eu-west-1.amazonaws.com/Prod/generate/gif', {
        inputImageUrls,
        outputImageUrl
    },
        {
            headers: {
                'x-api-key': 'SIdHi3lzwma61h4GeBGR96ZD4rpsa3mb6iKVlMG7'//haal api key van postman file van lector
            }
        })
        .then(function (response) {
            const gifUrl = generateGetUrl(outputObjectId);
            res.json(gifUrl);
        })
        .catch(function (error) {
            res.status(500).json(error);
        });

    }

})


function respondUnauthorized(res)
{
    res.status(401).json()
}


function generateGetUrl(objectId) {
    return s3.getSignedUrl("getObject", {
        Key: objectId,
        Bucket: bucketName,
        Expires: 900
    })
}

function generatePutUrl(objectId, contentType) {
    return s3.getSignedUrl("putObject", {
        Key: objectId,
        Bucket: bucketName,
        Expires: 900,
        ContentType: contentType
    })
}

function extractObjectId(url) {
    const urlZonderMark = url.split("?")[0];
    const splitUrlSlashes = urlZonderMark.split('/');
    return splitUrlSlashes[splitUrlSlashes.length - 1];
}

app.listen(3000);