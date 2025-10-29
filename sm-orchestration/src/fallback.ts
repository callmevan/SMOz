const axios = require('axios');
const https = require('https');

const _log = (...msg: any[]) => {
    console.log('|Fallback|', ...msg);
}

class Fallback {

    async sendFallbackMessageAsync(message: string) {
        _log('sending fallback message', message);

        const url = process.env.FALLBACK_URL;
        _log('fallback url', url);

        const data = {
            "query": message
        };

        const instance = axios.create({
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            })
        });
        const r = await instance.post(url, data);
        _log('response', r?.data);

        return r.data;
    }
}

export default Fallback;
