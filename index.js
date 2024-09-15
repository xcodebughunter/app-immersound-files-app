const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'immersound-mastered-song';

// Crea el cliente S3
const s3Client = new S3Client();

exports.handler = async (event) => {
    const userId = event.queryStringParameters.userId;
    const songId = event.queryStringParameters.songId;
    const defaultName = event.queryStringParameters.name;
    const fileType = event.queryStringParameters.type;
    const isMastered = req.body.isMastered === 'true';

    let fileKey;

    if (fileType === 'audio/wav') {
        if (isMastered) {
            fileKey = `${userId}/mastered/${songId}/${defaultName}`;
        } else {
            fileKey = `${userId}/master/${songId}/${defaultName}`;
        }
    } else if (fileType === 'application/zip') {
        fileKey = `${userId}/stems/${songId}/${defaultName}`;
    } else {
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ error: 'Unsupported file type' }),
        };
    }

    const s3Params = {
        Bucket: BUCKET_NAME,
        Key: fileKey,
        ContentType: fileType
    };

    try {
        const command = new PutObjectCommand(s3Params);
        const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 60 });
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ uploadURL }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ error: error.message }),
        };
    }
};
