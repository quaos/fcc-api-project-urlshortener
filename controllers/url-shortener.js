const { response } = require('express');
const express = require('express');

const ALLOWED_PROTOCOLS = ['http', 'https'];

function urlShortenerController(urlShortenerService, opts = {}) {
    const router = new express.Router({ mergeParams: true });

    router.get('/:key', async (req, resp, next) => {
        try {
            const result = await urlShortenerService.getUrl(req.params.key);

            resp.status(302);
            resp.header("location", result.url);
            resp.json({
                original_url: result.url,
            });
        } catch (err) {
            next(err);
        }
    });

    router.post('/', async (req, resp, next) => {
        try {
            //TEST
            // console.log(req);
            const url = (req.body) ? req.body.url : undefined;
            if (!url) {
                const err = new Error('invalid url');
                err.statusCode = 400;
                throw err;
            }

            try {
                const _parsedUrl = new URL(url);
                const protocol = _parsedUrl.protocol.replace(/:$/, '');
                if (ALLOWED_PROTOCOLS.indexOf(protocol) < 0) {
                    throw new Error(`Invalid Protocol: ${protocol}`);
                }
            } catch (err) {
                console.log(`Invalid URL: ${url}`, err.message);
                const err2 = new Error('invalid url');
                err2.statusCode = 400;
                throw err2;
            }

            const result = await urlShortenerService.add(url);

            resp.status(201);
            resp.json({
                original_url: result.url,
                short_url: result.key,
            });
        } catch (err) {
            next(err);
        }
    });

    return router;
}

module.exports = urlShortenerController;
