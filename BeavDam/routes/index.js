var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Post = mongoose.model('Post');

var ttn = require('ttn');
var appEUI = '70B3D57ED0001432';
var accessKey = 'y8HiW+H/GbdlaGZReubF+Jod6iHnliCSdKD74gDCdYE=';
var client = new ttn.Client('staging.thethingsnetwork.org', appEUI, accessKey);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//get query for voltage
router.get('/voltGet', function(req, res, next){
  Post.find(function(err, battery){
    if(err) { return next(err); }
    res.json(battery);
  });
});


//get live volt query from TTN
router.get('/voltTTN', function(req, res, next){
  client.on('uplink', function (msg) {
    res.json(msg.fields.volt);
    return msg.fields.volt;
  });
});


//get live msg query from TTN
router.get('/msgTTN', function(req, res, next){
  client.on('uplink', function (msg) {
    res.json(msg);
    return msg;
  });
});

module.exports = router;
