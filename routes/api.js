let express = require('express');
let jwt = require('jsonwebtoken');
let bcrypt = require('bcrypt-nodejs');
let router = express.Router();
let User = require('../models/user');
let Bars = require('../models/bars');
let Yelp = require('yelp');

router.put('/location/leave/:name', (request, response) => {
    console.log(request.params.name);
    Bars.findOne({ name: request.params.name }, function(err, bar) {
        if(err) {
            console.log(err);
            return response.status(400).send(err);
        }
        if(!bar) {
            return response.status(404).send('No bar found with this name');
        }
        for(var i = 0; i < bar.users.length; i++){
            if(bar.users[i].name === request.body.user.name){
                bar.users.splice(bar.users[i], 1);
                bar.save(function(err, res) {
                    if(err) {
                        return response.status(400).send(err)
                    }
                    return response.status(204).send(res)
                })
            }
            else {
                return response.status(404).send('No use removed from bar');
            }
        }
    });
});

router.put('/location/:name', (request, response) => {
    Bars.findOne({name: request.params.name}, function(err, bar){
        if(err) {
            return response.status(400).send(err);
        };
        if(!bar) {
            return response.status(404).send('No bar found with this name');
        };
        bar.users.push(request.body.user);
        bar.save(function(err, res){
            if(err) {
                return response.status(400).send(err)
            }
            return response.status(201).send(res);
        });
    });
});


router.get('/location/:zip', (request, response) => {
    var yelp = new Yelp({
        consumer_key: process.env.consumerKey,
        consumer_secret: process.env.consumerSecret,
        token: process.env.token,
        token_secret: process.env.tokenSecret
    });
    Bars.find({'zipCode': request.params.zip}, function(err, bars){
        if(err) {
            return response.status(400).send(err);
        }
        if(bars.length === 0) {
            var bars = [];
            yelp.search({ term: 'bars', location: request.params.zip })
                .then(function(data) {
                    for(var i = 0; i < data.businesses.length; i++){
                        var bar = new Bars();
                        bar.name = data.businesses[i].name;
                        bar.image_url = data.businesses[i].image_url;
                        bar.zipCode = request.params.zip;
                        bar.mobile_url = data.businesses[i].mobile_url;
                        bar.save()
                    }
                    data.businesses.forEach(function(business){
                        business.users = []
                    });
                    return response.status(200).send(data);
                })
                .catch(function(err) {
                    return response.status(400).send(err);
                });
        }
        else {
            console.log('bars for ' + request.params.zip + bars);
            return response.status(200).send({
                businesses: bars
            });
        }
    })
});


router.post('/login', (request, response) => {
    console.log(request.body);
    if(request.body.name && request.body.password) {
        User.findOne({ name: request.body.name }, (err, user) => {
            if(err) {
                return response.status(400).send(err)
            }
            if(!user) {
                return response.status(404).send('No user with this account is registered');
            }
            var token = jwt.sign({
                data: user
            }, process.env.secret, { expiresIn: 3600 });
            return response.status(200).send(token);
        });
    }
    else {
        return response.status(400).send('Please fill out all fields');
    }
});

router.post('/register', (request, response) => {
    if(request.body.name && request.body.password && request.body.location) {
        var user = new User();
        user.name = request.body.name;
        user.password = bcrypt.hashSync(request.body.password, bcrypt.genSaltSync(10));
        user.location = request.body.location;
        user.save((err, resource) => {
            if(err) {
                return response.status(400).send(err);
            }
            var token = jwt.sign({
                data: resource
            }, process.env.secret, { expiresIn: 3600 });
            return response.status(201).send(token);
        });
    }
    else {
        return response.status(400).send('Must fill out all fields');
    };
});

module.exports = router;