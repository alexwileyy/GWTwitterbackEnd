"use strict";
const express = require('express');
const router = express.Router();
const secret = require("secret");
Twitter = require('node-twitter-api'),

// Custom models
const tweets = require('../models/tweets');

let twitter = new Twitter({
    consumerKey: 'EoyqbOuKhTRDgfe7cpuZx2TlG',
    consumerSecret: 'mQfLhgXOg2SLqTCYKs7VNf7bjStVMgdOA8GweP6AtClbryEMtX',
    callback: baseURL + '/auth'
});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

router.get('/', function(req, res, next) {

    const searchTag = req.query.searchtag;
    console.log(`Searching for ${searchTag}`);

    tweets.getHashTag(searchTag)
        .then( result => {

            res.send(result);

        }).catch( err => {

            console.log('oh eik!');
            console.log(err);

            res.send('There was some kind of issue');
    });

});


app.get('/twitter', (req, res) => {
    // res.send(JSON.stringify({text: 'something here...'}))
    twitter.getRequestToken((err, requestToken, requestSecret) => {
        if(err){
            res.status(500).send(err);
            return;
        }
        secret.set('token', requestToken);
        secret.set('secret', requestSecret);
        res.send({
            token: requestToken,
        })
    })
});


app.get('/access-token', (req, res) => {
    let verifier = req.query.verifier,
       token = req.query.token;

    // res.send({verifier, token});
    twitter.getAccessToken(token, secret.get('secret'), verifier, (err, accessToken, accessSecret) => {
        if(err) return res.status(500).send(err);
        // res.send({accessToken, accessSecret});
        twitter.verifyCredentials(accessToken, accessSecret, (err, user) => {
            console.log(accessToken);
            let ret = {
                token: accessToken,
                user: user
            };
            res.send(ret);
        })
    })

});


let mock = require('./mock.json');

app.get('/test-data', (req, res) => {
    res.send(mock);
});



module.exports = router;
