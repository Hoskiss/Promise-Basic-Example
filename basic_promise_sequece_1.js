// reference
// http://www.html5rocks.com/en/tutorials/es6/promises/

var fs = require('fs'),
    $ = require('cheerio'),
    http = require('http'),
    Promise = require('promise'),
    iconv = require('iconv-lite'),
    Set = require("collections/set"),
    BufferHelper = require('bufferhelper');

var options = {
    host: "www.fnpn.gov.tw",
    path: "/ct/CFT.php?page=CFTMain2&area=N000",
    method: 'GET'
};

function requestPromise(options) {
    // Return a new promise.
    return new Promise(function(resolve, reject) {

        var req = http.request(options, function(res) {
            var bufferhelper = new BufferHelper();
            // big-5 conding
            // res.setEncoding('utf-8');
            res.on('data', function (chunk) {
                bufferhelper.concat(chunk);
            });

            res.on('end', function () {
                if(200 === res.statusCode) {
                    resolve(iconv.decode(bufferhelper.toBuffer(), 'Big5'));
                } else {
                    reject("Error network response: " + res.statusCode);
                }
            });
        });

        req.on('error', function(err) {
            reject("Error: " + err.message);
        });

        req.end();
    });
}

var every_links = [];

function parseEveryLinks(raw_page) {
    var link_set = new Set();
    var every_link_pattern = 'a[href^="/ct/CFT.php?page=CFTBidResult&area=N000&CFT_ID="]';
    $(raw_page).find(every_link_pattern).each(function () {
        link_set.add($(this).attr('href'));
    });
    every_links = link_set.toArray();

    return every_links;
}

function printOut(content) {
    console.log(content);
}

function checkOrderNotReturnPromiseInThen(every_links) {
    var sequence = Promise.resolve();
    every_links.forEach( function(link) {
        sequence = sequence.then(function() {
            setTimeout(function(){
                console.log("==" + link + "==");
            }, Math.random()*100);
        });
    });
}

function randomProcessTimePromise(content) {
    return new Promise(function(resolve, reject) {
        setTimeout(function(){
                resolve(content);
            }, Math.random()*100);
    });
}

function checkOrderReturnPromiseInThen(every_links) {
    var sequence = Promise.resolve();
    every_links.forEach( function(link) {
        sequence = sequence.then(function() {
            return randomProcessTimePromise(link);
        }).then(
            printOut
        );
    });
}

// not in order
requestPromise(options).then(
    parseEveryLinks
).then(
    checkOrderNotReturnPromiseInThen
).catch(function(err) {
    console.log(err);
});

// in order
requestPromise(options).then(
    parseEveryLinks
).then(
    checkOrderReturnPromiseInThen
).catch(function(err) {
    console.log(err);
});


