//////////////////////////////////////
// FIREBASE SERVICES
//////////////////////////////////////
var admin = require("firebase-admin");
var os = require('os');
var osu = require('os-utils');

function initService(serviceAccount, databaseUrl){
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: databaseUrl
      });
      
}

function setPresence (serverName){
    var db = admin.database();
    db.ref('serverStatus/' + serverName).set({status:'online'});
    console.log("initPresence - OK");
}


function setMetrics(serverName){
    osu.cpuUsage(function(cpu){
        var m = { 'cpu': { 'usage': Math.round(cpu * 100,2) }, 'memory': { 'total': Math.round(os.totalmem() /1024/1024/1024, 2), 'available': Math.round(os.freemem() /1024/1024/1024, 2) }};
        var db = admin.firestore();
        db.collection('serverInfo').doc(serverName).set({metrics: m}, {merge: true});
        console.log("setMetrics - OK");
    });    
}

function firebase(){
    console.log("Firebase constructor");
}

firebase.prototype.initService = function(serverName) {
    initService(serverName);
}

firebase.prototype.setPresence = function(serviceAccount, databaseUrl) {
    setPresence(serviceAccount, databaseUrl);
}


firebase.prototype.setMetrics = function(serverName) {
    setMetrics(serverName);
}

module.exports = firebase;