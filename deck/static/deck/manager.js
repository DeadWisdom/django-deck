window.hasLocalStorage = ('localStorage' in window && window['localStorage'] !== null);

CardManager = Tea.Class({
    type: 'card-manager',
    margin: 50,
    init : function() {
        this.currentUrl = null;
        this.card = Card();
        this.layers = [];
        this.layerMenu = LayerMenu();

        setInterval(jQuery.proxy(this.loadCardByHash, this), 1000);

        this.hook(this.card, 'ready', this.onCardReady);
    },
    loadCardByHash : function() {
        var path = window.location.hash.substring(2);
        this.loadCard(window.location.pathname + path);
    },
    loadCard : function(url) {
        if (this.currentUrl == url) return;
        this.currentUrl = url;
        this.teardown();

        $('#loading').fadeIn('fast');

        $.ajax({
            url: url,
            dataType: 'html',
            success: jQuery.proxy(this.loadSuccess, this),
            error: function() {
                alert("Could not load card: " + url);
            }
        });
    },
    reloadCard : function() {
        var url = this.currentUrl;
        this.currentUrl = null;
        this.loadCard(url);
    },
    teardown : function() {
        while(this.layers.length > 0) {
            this.layers.pop().teardown();
        }
    },
    loadSuccess : function(html, status, xhr) {
        if (!this.card.ready)
            return this._load = [html, status, xhr];

        var path = xhr.getResponseHeader('path');
        var images = xhr.getResponseHeader('images');

        $('#loading').hide();

        this.layers = [this.card];

        this.card.hidden = this.loadValue(this.card.name + ":hidden") ? true : false;

        this.card.setHTML(html);
        this.card.setName(path);
        this.card.appear();

        this.layerMenu.empty();
        this.layerMenu.addLayer("card", this.card);

        var images = images.split(';');
        for(var i = 0; i < images.length; i++) {
            var im = images[i].split('=');
            this.addOverlay(im[0], im[1]);
        }
    },
    addOverlay : function(name, url) {
        var hidden = this.loadValue(url + ":hidden") ? true : false;
        var layer = Layer({ name: name, src: url, hidden: hidden });
        this.layers.push( layer );
        this.layerMenu.addLayer(name, layer);
    },
    onCardReady : function() {
        if (this._load) {
            this.loadSuccess.apply(this, this._load);
            this._load = null;
        }
    },
    findEmptySpot : function(obj) {
        var max_width = $(window).width() - (this.margin * 2);
        var scan = {left: this.margin * 2, top: this.margin, width: obj.source.width(), height: obj.source.height()};
        var items = this.layers;

        for(var i = 0, len = items.length; i < len; i++) {
            var item = items[i];
            if (item == obj) continue;
            if (item.hidden) continue;
            if (this.collides(item.source, scan)) {
                scan.left += item.source.outerWidth() + this.margin;
                if (scan.left > max_width) {
                    scan.left = this.margin;
                    scan.top += this.margin;
                    i = 0;
                    continue;
                }
            }
        }

        return {
            left: scan.left,
            top: scan.top
        }
    },
    collides : function(source, rect) {
        var offset = source.offset();
        var width = source.outerWidth();
        var height = source.outerHeight();

        return (offset.left < rect.width + rect.left && offset.left + width > rect.left &&
                offset.top < rect.height + rect.top && offset.top + height > rect.top);
    },
    loadRect : function(name) {
        var val = this.loadValue(name);
        if (!val) return null;

        var parts = val.split(',');
        return {
            left: parseInt(parts[0]),
            top: parseInt(parts[1]),
            width: parseInt(parts[2]),
            height: parseInt(parts[3])
        }
    },
    saveRect : function(name, source) {
        var offset = source.offset();
        var parts = [offset.left, offset.top, source.width(), source.height()];
        this.saveValue(name, parts.join(","));
    },
    loadValue : function(key) {
        return hasLocalStorage ? localStorage.getItem(key) : $.cookie(key);
    },
    saveValue : function(key, value) {
        return hasLocalStorage ? localStorage.setItem(key, value) : $.cookie(key, value);
    },
    delValue : function(key) {
        return hasLocalStorage ? localStorage.removeItem(key) : $.cookie(key, null);
    },
    arrange : function() {
        var layers = this.layers;
        this.layers = [];

        // Find card, put it at the beginning
        for(var i = 0, len = this.layers.length; i < len; i++) {
            if (this.layers[i] == this.card) {
                this.layers.splice(i, 1);
                break;
            }
        }
        this.layers.unshift(this.card);

        // Appear all
        for(var i = 0; i < layers.length; i++) {
            this.delValue(layers[i].getId());
            layers[i].appear();
            this.layers.push(layers[i]);
        }
    },
    build_snapshot_for_current : function() {
        var path = this.card.name;
        $.ajax({
            url: '/deck/build_snapshots/',
            data: {path: this.card.name},
            success: function() {
                console.log("Done!");
            }
        })
        console.log();
    },
    bringForward : function(obj) {
        for(var i = 0, len = this.layers.length; i < len; i++) {
            if (obj == this.layers[i]) {
                this.layers.splice(i, 1);
                break;
            }
        }
        this.layers.push(obj);

        for(var i = 0, len = this.layers.length; i < len; i++) {
            this.layers[i].source.css('z-index', i);
            this.layers[i].scaffold.source.css('z-index', 200 + i);
        }
    }
});

$(function() {
    window.manager = CardManager();
})