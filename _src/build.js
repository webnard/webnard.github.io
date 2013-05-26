var jQuery = "http://code.jquery.com/jquery-latest.js";
var fs = require("fs");
var jsdom = require("jsdom");
var yui = require("yuicompressor");

var siteDir = __dirname + '/site';
var baseDir = __dirname + '/../';
var tplDir = __dirname + '/templates';

var tmpJs = __dirname + '/app.css.tmp';
var tmpJs = __dirname + '/app.js.tmp';

jsdom.defaultDocumentFeatures = {
    FetchExternalResources: false,
    ProcessExternalResources: false
};

// make a copy of the template file with minified data
fs.readdir(tplDir, function(err, files) {
    files.forEach(function(file) {
        // make a copy
        var tmpFile = tplDir + '/' + file + '.tmp';
        var id = fs.openSync(tmpFile,'w');
        var copy = fs.readFileSync(tplDir + '/' + file);
        console.log(copy);
        return;
        fs.writeSync(id, copy);
        fs.closeSync(id);

        combineJs(tmpFile);
        combineCss(tmpFile);

        //fs.unlink(tmpFile, function(){});
    });
});

fs.readdir(siteDir, function(err, files) {
    files.forEach(function(file){
         
    });
});

function isLocal(filename) {
    return filename.indexOf("http://") !== 0 
           && filename.indexOf("//") !== 0
           && filename.indexOf("https://") !== 0;
}

function combineJs(file) {
    jsdom.env({
        html: file,
        scripts: [jQuery],
        done: function(errors, window) {
            var $ = window.$;
            var js = $("script[src]");
            var g = fs.openSync(tmpJs, 'w');
            var replaced = false;

            js.each(function() {
               var script = $(this).attr('src');

               if(!isLocal(script)) {
                    return;
               }
               var data = fs.readFileSync(script);
               fs.writeSync(g,data);
               
               if(!replaced) {
                    $(this).replace("<script src='js/app.min.js'></script>");
                    replaced = true;
               }
               else
               {
                    $(this).remove();
               }
            });
            fs.closeSync(g);
        }
    });
}

function combineCss(file) {
    jsdom.env({
        html: file,
        scripts: [jQuery],
        done: function(errors, window) {
            var $ = window.$;
            var el = $("link[type=stylesheet]");
            var g = fs.openSync(tmpCss, 'w');
            var replaced = false;

            el.each(function() {
               var css = $(this).attr('href');

               if(!isLocal(css)) {
                    return;
               }
               var data = fs.readFileSync(css);
               fs.writeSync(g,data);
               
               if(!replaced) {
                    $(this).replace("<link rel='stylesheet' href='css/app.min.css'>");
                    replaced = true;
               }
               else
               {
                    $(this).remove();
               }
            });
            fs.closeSync(g);
        }
    });
}
