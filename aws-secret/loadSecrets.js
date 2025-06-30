// loadSecrets.js

const {
    SecretsManagerClient,
    GetSecretValueCommand,
} = require('@aws-sdk/client-secrets-manager');

const secretName = 'python/test';
const region = 'us-east-1';

async function loadSecrets() {
    const client = new SecretsManagerClient({ region });

    try {
        const response = await client.send(
            new GetSecretValueCommand({
                SecretId: secretName,
                VersionStage: 'AWSCURRENT',
            })
        );

        const secretString = response.SecretString;

        if (secretString) {
            const secret = JSON.parse(secretString);

            // Set values to environment variables
            process.env.MONGO_URI = secret.mongo_uri;
            process.env.DB_USER = secret.field;
            process.env.DB_PASS = secret.company;
            process.env.EMAIL_USER = secret.email;
            process.env.PORT = secret.PORT;


            console.log('✅ AWS Secrets loaded into environment variables');
        }
    } catch (err) {
        console.error('❌ Error loading secrets:', err.message);
        throw err;
    }
}

module.exports = loadSecrets;

