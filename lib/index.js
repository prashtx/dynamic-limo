/*jslint node: true */
'use strict';

var AWS = require('aws-sdk');
var express = require('express');
var http = require('http');


var app = express();
var server = http.createServer(app);

var records = JSON.parse(process.env.RECORDS);
var port = process.env.PORT;

AWS.config.update({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET
});

AWS.config.update({ region: 'us-east-1' });

var route53 = new AWS.Route53();

function makeChangeObject(options) {
  return {
    Action: options.method,
    ResourceRecordSet: {
      Name: options.name,
      Type: 'A',
      TTL: 60,
      ResourceRecords: [{
        Value: options.value
      }]
    }
  };
}

function getOldRecords(zone, name, done) {
  route53.listResourceRecordSets({
    HostedZoneId: zone,
    StartRecordName: name,
    StartRecordType: 'A'
  }, done);
}

function updateRecord(zone, name, value, done) {
  getOldRecords(zone, name, function (error, data) {
    if (error) { return done(error); }

    // Deletions
    var changes = data.ResourceRecordSets[0].ResourceRecords.map(function (item) {
      return makeChangeObject({
        method: 'DELETE',
        name: name,
        value: item.Value
      });
    });

    // Creation
    changes.push(makeChangeObject({
      method: 'CREATE',
      name: name,
      value: value
    }));

    route53.changeResourceRecordSets({
      HostedZoneId: zone,
      ChangeBatch: {
        Comment: 'Dynamic DNS update',
        Changes: changes
      }
    }, function (error, resp) {
      if (error) { return done(error); }
      console.log('Route53 response: ' + JSON.stringify(data));
      done(null);
    });
  });
}

function getIP(req) {
  if (req.ips.length > 0) {
    return req.ips[0];
  }
  return req.ip;
}

app.use(express.logger());
app.enable('trust proxy');

app.get('/ip', function (req, res) {
  res.send(getIP(req));
});

app.get('/update/:key', function (req, res) {
  var key = req.params.key;
  var record = records[key];
  if (record === undefined) {
    res.send(404);
    return;
  }

  updateRecord(record.zone, record.name, getIP(req), function (error, data) {
    if (error) {
      console.log(error);
      res.send(500);
      return;
    }
    res.send(200);
  });
});

server.listen(port, function (error) {
  if (error) {
    console.log(error);
    return;
  }
  console.log('Listening on ' + port);
});
