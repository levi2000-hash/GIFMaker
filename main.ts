import aws = require('aws-sdk');
import express = require('express');
import axios from 'axios';
import { v4 } from 'uuid';
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken';
import * as repo from './persist/repo'

aws.config.update(
    {
        accessKeyId: "ASIAVUZ3GXGT5O5V726F",
        secretAccessKey: "MHdQycPCoAayHf40RnPXxYFcIgUwEDsqwCoRnmpr",
        region: "us-east-1",
        signatureVersion: "v4",
        sessionToken: "FwoGZXIvYXdzELb//////////wEaDM6LHu7UcXoTwDrXpSLLARBcvgRlClAdSWMR59D2QLGWll/1iNPNvs5xjpRQKvfYATT0a1F7UHfDbrCoOzf8rHrY9Z+rmvS92l1v4qNKlrjlG9CHEESCsZu7JIwJn1ONnFX/lPX3GS9R+5DrALQl9eTkKdbYI8vcY5pgB8bvUV98F5+jJfjb28LnGgsqFE2bkVEHnR1uUh/tbcTdoxxLjEUo3HCVrUyS/2KIaNlIsK0GiXrMRqOk95g1kYYANcbrtiDcrR/fBBUK2t4yj685IDPKcw8jGz0sJi0SKLPx7I0GMi0EhF//73QKtaglw1VBe3Dl6RCGMbaur+npdjRLRl7gZrMuEm0np3w5YZ3AfrI="
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

            res.status(500).json(err)
        })
})

app.get('/api/imageurl', (req, res) => {

    if (!req.cookies) {
        respondUnauthorized(res)
    }

    else if (!req.cookies.id_token) {
        respondUnauthorized(res)
    }

    else {

        const objectId = generateObjectId();
        console.log("Return upload url with objectid: ", objectId)
        const generatedUrl = generatePutUrl(objectId, 'image/jpg');
        res.json(generatedUrl);
    }
})

app.get('/dbtest/featured', (req, res) => {
    repo.getAllFeaturedGifsFromUser("user123").then((data) => {
        res.json(data)
    })

})

app.get('/dbtest/create', (req, res) => {
    repo.addGifTask({ userId: "user123", outputObjectId: "object123", featured: true })
    res.json();
})

app.get('/api/featured', (req, res) => {

    if (!req.cookies) {
        respondUnauthorized(res)
    }

    else if (!req.cookies.id_token) {
        respondUnauthorized(res)
    }
    else {
        const userId = jwt.decode(req.cookies.id_token).sub
        repo.getAllFeaturedGifsFromUserMemory(userId).then(featured => {
            
            let urls: string[] = []
            let checkPromises: Promise<any>[] = []
            featured.forEach(gif => {
                checkPromises.push(checkIfObjectExists(gif));
            });

            Promise.all(checkPromises).then((values)=>{
                values.filter(v => v.exists).forEach(existingGif =>{
                    urls.push(generateGetUrl(existingGif.gif))
                })

                res.json(urls.reverse())
            })


            
        })
    }




})

app.post('/api/signaluploadcompleted', (req, res) => {

    if (!req.cookies) {
        respondUnauthorized(res)
    }

    else if (!req.cookies.id_token) {
        respondUnauthorized(res)
    }

    else {

        const userId = jwt.decode(req.cookies.id_token).sub

        const { uploadUrls } = req.body;
        const { featured } = req.body;



        const objectIds = uploadUrls.map(uploadurls => extractObjectId(uploadurls));

        const inputImageUrls = objectIds.map(id => generateGetUrl(id));


        const outputObjectId = generateObjectId(featured);
        console.log('Output id: ', outputObjectId);

        const outputImageUrl = generatePutUrl(outputObjectId, 'image/gif', true);


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

                //WRITE TO DB
                //repo.addGifTask({userId: userId, outputObjectId: outputObjectId, featured: featured})

                repo.addGifTaskMemory({ userId: userId, outputObjectId: outputObjectId, featured: featured })

                const gifUrl = generateGetUrl(outputObjectId);
                res.json(gifUrl);
            })
            .catch(function (error) {
                res.status(500).json(error);
            });
    }


})


function respondUnauthorized(res) {
    res.status(401).json()
}


function generateGetUrl(objectId) {
    return s3.getSignedUrl("getObject", {
        Key: objectId,
        Bucket: bucketName,
        Expires: 900
    })
}

function generatePutUrl(objectId: string, contentType: string, gif: boolean = false) {
    let timePeriod = 900

    if (gif) {
        timePeriod = 86400
    }
    return s3.getSignedUrl("putObject", {
        Key: objectId,
        Bucket: bucketName,
        Expires: timePeriod,
        ContentType: contentType
    })
}

function generateObjectId(featured: boolean = false): string {
    let prefix = "normal"

    if (featured) {
        prefix = "featured"
    }

    return `${prefix}_${v4()}`
}

function extractObjectId(url) {
    const urlZonderMark = url.split("?")[0];
    const splitUrlSlashes = urlZonderMark.split('/');
    return splitUrlSlashes[splitUrlSlashes.length - 1];
}

function checkIfObjectExists(objectId: string) : Promise<any>{
    return s3.headObject({
        Bucket: bucketName,
        Key: objectId
    })
    .promise().then(res =>{
        return {exists:true, gif:objectId}
    }).catch(err =>{
        return {exists:false, gif:objectId}
    })
}

app.listen(3000);