const randomstring = require('randomstring');
const fetch = require('node-fetch');

function urlShortenerService(opts = {}) {
    const keyLength = opts.keyLength || 8;
    const maxAge = opts.maxAge || 24 * 3600;

    //TODO: Use Redis, SQLite or some DB
    const store = {};

    const generateKey = async () => {
        let key = undefined;
        while ((!key) || (store[key])) {
            key = randomstring.generate(keyLength);
        }

        return key;
    }

    const checkExpiredUrls = async () => {
        const now = new Date();
        Object.entries(store).forEach(([key, val]) => {
            if (now >= val.expiresAt) {
                console.log(`Removing expired entry: ${key} =>`, val);
                delete store[key];
            }
        });
    };

    return {
        getUrl: async (key) => {
            await checkExpiredUrls();

            const data = store[key];
            if (!data) {
                const err = new Error("Not Found");
                err.statusCode = 404;
                throw err;
            }
            return data;
        },

        add: async (url) => {
            await checkExpiredUrls();

            const key = await generateKey();
            const expDate = new Date(new Date().getTime() + maxAge * 1000);

            let checkResp;
            try {
                checkResp = await fetch(url, {
                    method: "HEAD",
                });
            } catch (err) {
                console.error(err);
                checkResp = {};
            }

            const data = {
                key,
                url,
                respStatus: checkResp.status,
                contentType: (checkResp.headers)
                    ? checkResp.headers.get('content-type')
                    : undefined,
                expiresAt: expDate,
            };
            store[key] = data;
            console.log(`Added URL: ${key} =>`, data);

            return data;
        },
    }
}

module.exports = urlShortenerService;
