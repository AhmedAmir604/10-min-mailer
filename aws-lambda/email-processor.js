// AWS Lambda function to process emails from S3
// Deploy this function and set up S3 trigger for your email bucket

exports.handler = async (event) => {
    const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
    const { simpleParser } = require('mailparser');
    
    const s3Client = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1'
    });
    
    try {
        // Process each S3 record
        for (const record of event.Records) {
            if (record.eventName.startsWith('ObjectCreated')) {
                const bucketName = record.s3.bucket.name;
                const objectKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
                
                console.log(`Processing email: ${objectKey} from bucket: ${bucketName}`);
                
                // Get email content from S3
                const getObjectCommand = new GetObjectCommand({
                    Bucket: bucketName,
                    Key: objectKey
                });
                
                const response = await s3Client.send(getObjectCommand);
                const emailContent = await streamToString(response.Body);
                
                // Parse email to check if it's for a valid temporary email
                const parsedEmail = await simpleParser(emailContent);
                
                // Extract recipients
                const recipients = extractRecipients(parsedEmail);
                console.log('Recipients found:', recipients);
                
                // Call your Next.js API to process the email
                const apiResponse = await fetch(process.env.API_ENDPOINT + '/api/process-s3-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.API_SECRET}` // Optional: Add API authentication
                    },
                    body: JSON.stringify({
                        s3Key: objectKey,
                        bucketName: bucketName,
                        recipients: recipients
                    })
                });
                
                if (apiResponse.ok) {
                    console.log('Email processed successfully');
                } else {
                    const error = await apiResponse.text();
                    console.error('Failed to process email:', error);
                }
            }
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Emails processed successfully' })
        };
        
    } catch (error) {
        console.error('Error processing emails:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

// Helper function to convert stream to string
async function streamToString(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString('utf-8');
}

// Helper function to extract recipients from parsed email
function extractRecipients(parsedEmail) {
    const recipients = [];
    
    if (parsedEmail.to) {
        const toArray = Array.isArray(parsedEmail.to) ? parsedEmail.to : [parsedEmail.to];
        for (const to of toArray) {
            if (typeof to === 'string') {
                recipients.push(to);
            } else if (to.value) {
                for (const addr of to.value) {
                    recipients.push(addr.address || '');
                }
            }
        }
    }
    
    return recipients.filter(email => email.length > 0);
} 