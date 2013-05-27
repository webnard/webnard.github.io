var fs = require("fs");
var jQuery = fs.readFileSync(__dirname + "/jquery.js").toString();
var jsdom = require("jsdom");
var yui = require("yuicompressor");

var siteDir = __dirname + '/site';
var baseDir = __dirname + '/..';
var cssDir = baseDir + '/../css';
var tplDir = __dirname + '/templates';

var tmpCss = __dirname + '/app.css.tmp';
var tmpJs = __dirname + '/app.js.tmp';

var unlinkFiles = [];

// make a copy of the template file with minified data
fs.readdir(tplDir, function(err, files) {
    files.forEach(function(file) {
        if(file.slice(-4) == ".tmp") {
            return;
        }

        // make a copy
        var tmpFile = tplDir + '/' + file + '.tmp';
        var copy = fs.readFileSync(tplDir + '/' + file);
        fs.writeFileSync(tmpFile, copy);

        combineCss(tmpFile);
        
        unlinkFiles.push(tmpFile);
    });
});

templateFile(siteDir);

function templateFile(file) {
    var stat = fs.statSync(file);
    var newFile = baseDir + file.slice(siteDir.length); 
    if(stat.isDirectory()) {
        if(!fs.existsSync(newFile)) {
            fs.mkdirSync(newFile);
        }
        fs.readdir(file, function(err, files) {
            files.forEach(function(f){
                templateFile(file + '/' + f);
            });
        });
        return;
    }
    if(file.slice(-5) !== ".html") {
        // just copy it over -- no templating necessary
        fs.createReadStream(file).pipe(fs.createWriteStream(newFile));
    }

     var contents = fs.readFileSync(file).toString();
     var templateContents = fs.readFileSync(tplDir + '/home.html.tmp');

     jsdom.env({
        html: templateContents,
        src: [jQuery],
        done: function(errors, window) {
            var id = fs.openSync(newFile, 'w');
            fs.closeSync(id);

            var $ = window.jQuery;
            $("content").replaceWith(contents);
            fs.writeFileSync(newFile, window.document.doctype.toString() + window.document.innerHTML);
        }
     });
}

function isLocal(filename) {
    return filename.indexOf("http://") !== 0 
           && filename.indexOf("//") !== 0
           && filename.indexOf("https://") !== 0;
}

function combineCss(file) {
    var data = fs.readFileSync(file).toString();
    jsdom.env({
        html: data,
        src: [jQuery],
        done: function(errors, window) {
            var $ = window.jQuery;
            var el = $("link[rel=stylesheet]");
            var g = fs.openSync(tmpCss, 'w');
            fs.closeSync(g);
            var replaced = false;
            
            el.each(function() {
               var css = $(this).attr('href');
               if(!isLocal(css)) {
                    return;
               }
               css = __dirname + "/" + css;
                
               var data = fs.readFileSync(css);
               fs.appendFileSync(tmpCss, data);
               
               if(!replaced) {
                    $(this).replaceWith("<link rel='stylesheet' href='/css/app.min.css'>");
                    replaced = true;
               }
               else
               {
                    $(this).remove();
               }
            });
            
            fs.rename(tmpCss, cssDir + '/app.min.css', function(){});
            fs.writeFileSync(file, window.document.doctype.toString() + window.document.innerHTML);
        }
    });
}
