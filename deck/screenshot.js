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

function getSize() {
    var body = document.body;
    var width = 0;
    var height = 0;

    function getOffset(elem) {
        var box = elem.getBoundingClientRect ? elem.getBoundingClientRect() : { top: 0, left: 0 };
        var doc = elem.ownerDocument.documentElement;

        return {
            top: box.top + window.pageYOffset - doc.clientTop,
            left: box.left + window.pageXOffset - doc.clientLeft
        };
    }
    
    var e = document.getElementById("djDebug");
    if (e) { e.parentNode.removeChild(e); }

    for(var i = 0; i < body.childNodes.length; i++) {
        var child = body.childNodes[i];

        var offset = getOffset( child );
        var w = offset.left + child.offsetWidth;
        var h = offset.top + child.offsetHeight;
        if (width <= w)
            width = w;
        if (height <= h)
            height = h;
    }

    if (!width) width = 600;
    if (!height) height = 400;

    return {top: 0, left: 0, width: width, height: height};
}

function pageLoaded(status) {
    if (status == 'fail') {
        console.error(page.url);
    } else {
        try {
            var rect = page.evaluate(getSize);
            page.clipRect = rect;
            page.viewportSize = {
                width: rect.width,
                height: rect.height
            };
            console.log(page.url);
            console.log(page.renderBase64("PNG"));
        } catch(e) {
            console.error(e);
        }
    }

    if (urls.length > 0) {
        getPage(urls.pop());
    } else {
        phantom.exit();
    }
}

function getPage(url) {
    page.viewportSize = { width: 600, height: 400 };
    page.url = url;
    page.open(url, pageLoaded);
}

getPage(urls.pop());
