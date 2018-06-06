//////////////////////////////////////
// FIREBASE SERVICES
//////////////////////////////////////
var admin = require("firebase-admin");
var os = require('os');
var osu = require('os-utils');
const caw = require("caw");
const https = require("https");
 
// Your Proxy
const firebaseAgent;
var serverName = "";

function init(serviceAccount, databaseUrl, server, interval, proxyUrl){
    firebaseAgent = caw(proxyUrl, {
      protocol: "https",
    });
    serverName = server || "Unknown";
    //START API
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: databaseUrl,
        agent: firebaseAgent
      });
    
    // SET PRESENCE  
    setPresence()
    
    // START METRICS TIMER
    setInterval(setMetrics, interval || 6000);
}

function setPresence (){
    var db = admin.database();
    db.ref('serverStatus/' + serverName).set({status:'online'});
    console.log("initPresence - OK");
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

firebase.prototype.init = function(serviceAccount, databaseUrl, serverName, interval, proxyUrl) {
    init(serviceAccount, databaseUrl, serverName, interval, proxyUrl);
}

module.exports = firebase;