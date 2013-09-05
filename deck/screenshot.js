var system = require('system');
var page = require('webpage').create();
var urls = system.env['URLS'].split("|");

function splitExtension(filename) {
    var m = filename.match(/(.*)\.(\w+)/);
    if (!m) return [filename, ""];
    return m.slice(1);
}

function baseName(path) {
    var parts = path.split("/");
    var end = parts[parts.length-1];
    return end;
}

function pageLoaded(status) {
    if (status == 'fail') {
        console.error(page.url);
    } else {
        var name = splitExtension( baseName(page.url) )[0];
        var w = document.body.clientWidth;
        var h = document.body.scrollHeight;
        page.clipRect = {top: 0, left: 0, width: w, height: h};
        console.log(page.url);
        console.log(page.renderBase64("PNG"));
    }

    if (urls.length > 0) {
        getPage(urls.pop());
    } else {
        phantom.exit();
    }
}

function getPage(url) {
    page.url = url;
    page.open(url, pageLoaded);
}

getPage(urls.pop());