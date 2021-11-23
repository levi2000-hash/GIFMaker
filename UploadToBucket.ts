// Import the required AWS SDK clients and commands for Node.js
import {
    CreateBucketCommand,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    DeleteBucketCommand }
  from "@aws-sdk/client-s3";
  import { s3Client } from "./node_modules/@aws-sdk/client-s3/dist-cjs/S3Client"; // Helper function that creates Amazon S3 service client module.
  import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
  const fetch = require("node-fetch");
  
  // Set parameters
  // Create random names for the Amazon Simple Storage Service (Amazon S3) bucket and key.
  export const bucketParams = {
    Bucket: `test-bucket-${Math.ceil(Math.random() * 10 ** 10)}`,
    Key: `test-object-${Math.ceil(Math.random() * 10 ** 10)}`,
    Body: "BODY"
  };
  
  export const run = async () => {
    // Create an Amazon S3 bucket.
    try {
      console.log(`Creating bucket ${bucketParams.Bucket}`);
      const data = await s3Client.send(
        new CreateBucketCommand({ Bucket: bucketParams.Bucket })
      );
      return data; // For unit tests.
      console.log(`Waiting for "${bucketParams.Bucket}" bucket creation...\n`);
    } catch (err) {
      console.log("Error creating bucket", err);
    }
    // Put the object in the Amazon S3 bucket.
    try {
      console.log(`Putting object "${bucketParams.Key}" in bucket`);
      const data = await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketParams.Bucket,
          Key: bucketParams.Key,
          Body: bucketParams.Body,
        })
      );
      return data; // For unit tests.
    } catch (err) {
      console.log("Error putting object", err);
    }
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
    // Delete the object.
    try {
      console.log(`\nDeleting object "${bucketParams.Key}"} from bucket`);
      const data = await s3Client.send(
        new DeleteObjectCommand({ Bucket: bucketParams.Bucket, Key: bucketParams.Key })
      );
      return data; // For unit tests.
    } catch (err) {
      console.log("Error deleting object", err);
    }
    // Delete the bucket.
    try {
      console.log(`\nDeleting bucket ${bucketParams.Bucket}`);
      const data = await s3Client.send(
        new DeleteBucketCommand({ Bucket: bucketParams.Bucket, Key: bucketParams.Key })
      );
      return data; // For unit tests.
    } catch (err) {
      console.log("Error deleting object", err);
    }
  };
  run();
  