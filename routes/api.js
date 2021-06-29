const express = require('express');

function apiRoute(urlShortenerController, opts = {}) {
    const router = new express.Router();

    router.use('/shorturl', urlShortenerController);

    // not found handler
    router.use((req, resp) => {
        // console.log(`${req.method} ${req.url} => notFoundHandler`);
        const err = new Error("Not Found");
        err.statusCode = 404;
        throw err;
    });

    // error handler
    router.use((err, req, resp, next) => {
        if ((!err.statusCode) || (err.statusCode >= 500)) {
            console.error(err);
        }
        resp.status(err.statusCode || 500).json({ error: err.message });
    });

    return router;
}

module.exports = apiRoute;
