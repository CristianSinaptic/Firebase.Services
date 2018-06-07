//////////////////////////////////////
// FIREBASE SERVICES
//////////////////////////////////////
var admin = require("firebase-admin");
var os = require('os');
var osu = require('os-utils');
const caw = require("caw");
const https = require("https");

var db = null;
var serverName = "";

function init(serviceAccount, databaseUrl, server, interval, proxyUrl, sendMetrics){
    var firebaseAgent = caw(proxyUrl, {
      protocol: "https",
    });
    serverName = server || "Unknown";
    //START API
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: databaseUrl,
        agent: firebaseAgent,
        logging_enabled: true
      });
    db =  admin.database();
    // SET PRESENCE  
    setServerStatus('online');
    setOnDisconnect()
    // START METRICS TIMER
    if(sendMetrics)
        setInterval(setMetrics, interval || 6000);
}

function setOnDisconnect(){
    db.ref('serverStatus/' + serverName).onDisconnect().set({status:'offline'});
    console.log("onDisconnect() - OK");
}

function setServerStatus(stat){
    db.ref('serverStatus/' + serverName).set({status:stat});
    console.log("Presence setted to: " + stat);
}

function setMetrics(){
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

firebase.prototype.init = function(serviceAccount, databaseUrl, serverName, interval, proxyUrl, sendMetrics) {
    init(serviceAccount, databaseUrl, serverName, interval, proxyUrl, sendMetrics);
}

module.exports = firebase;