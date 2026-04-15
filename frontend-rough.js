// decode-token.js
const USER_SERVICE = 'http://62.238.15.118:8200';
const CLIENT_ID     = 'productService';
const CLIENT_SECRET = 'productServiceSecret';

function basicAuth() {
    return 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
}

async function main() {
    const res = await fetch(`${USER_SERVICE}/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': basicAuth(),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials&scope=openid'
    });
    const data = await res.json();
    console.log('Full response:', JSON.stringify(data, null, 2));

    if (data.access_token) {
        const parts = data.access_token.split('.');
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        console.log('\nToken payload:', JSON.stringify(payload, null, 2));
    }
}

main().catch(console.error);