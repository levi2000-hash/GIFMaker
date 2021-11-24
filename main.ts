import {
    CreateBucketCommand,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    DeleteBucketCommand }
from "@aws-sdk/client-s3";
import { s3Client } from "./node_modules/@aws-sdk/client-s3/dist-cjs/S3Client.js"; // Helper function that creates Amazon S3 service client module.
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

//Bucket link: https://2itsof3-4-gifmaker.s3.amazonaws.com/

export const bucketParams = {
    Bucket: `2itsof3-4-gifmaker`,
    Key: `personacanvas.jpg`,
    Body: "BODY"
};
import express = require('express');

let app = express()

app.get('/', (req,res) => {
    res.send('hello world');
})
app.get('/gif', (req,res) =>{
    const signedUrl = async () => {
    // Create a presigned URL.
        try {
            // Create the command.
            const command = new GetObjectCommand(bucketParams);
        
            // Create the presigned URL.
            const signedUrl = await getSignedUrl(s3Client, command, {
                expiresIn: 3600,
            });
            console.log(
                `\nGetting "${bucketParams.Key}" using signedUrl with body "${bucketParams.Body}" in v3`
            );
            console.log(signedUrl);
            const response = await fetch(signedUrl);
            console.log(
                `\nResponse returned by signed URL: ${await response.text()}\n`
            );

            
        } catch (err) {
            console.log("Error creating presigned URL", err);
        }
        return signedUrl;
    }
    console.log(signedUrl());
    res.send(signedUrl());
})
app.post('/', (req,res) => {
    res.send(201);
})

app.listen(3000);