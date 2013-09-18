Card = Tea.Element.extend({
    type: 'card',
    source: 'iframe',
    url: null,
    name: null,
    html: null,
    ready: false,
    hidden: false,
    init : function() {
        this.__super__();

        this.hook(this, 'move', this.onMove);
        this.hook(this.source, 'load', this.onFrameLoad);
        this.source.hide().appendTo(document.body);

        this.scaffold = Scaffold({
            subject: this
        });
    },
    setHTML : function(html) {
        $(this.source[0].contentWindow.document.body).empty().append(html);
        this.autoSize();
    },
    setName : function(name) {
        this.name = name;
        this.scaffold.setName(name);
    },
    getId : function() {
        return this.name;
    },
    onFrameLoad : function() {
        if (!this.ready) {
            this.ready = true;
            this.trigger('ready');
        }
    },
    autoSize : function() {
        if (this.source[0].tagName == 'IMG') {
            return;
        }

        var body = $(this.source[0].contentDocument.body);
        var width = 0;
        var height = 0;

        this.source.css({
            position: 'absolute',
            width: 600,
            height: 400,
        });

        body.children().each(function(i, e) {
            var child = $(e);
            var offset = child.offset();
            var w = offset.left + child.outerWidth();
            var h = offset.top + child.outerHeight();
            if (width <= w)
                width = w;
            if (height <= h)
                height = h;
        });

        if (width == 0) width = 600;
        if (height == 0) height = 400;

        this.source.css({
            width: width,
            height: height
        });

        this.scaffold.doLayout();
    },
    setWidth : function(w) {
        this.source.width(w);
        this.scaffold.doLayout();
    },
    appear : function() {
        if (this.hidden) return false;
        
        var rect = window.manager.loadRect(this.name) || {};

        if (rect.top == undefined || rect.top == null) {
            var pos = window.manager.findEmptySpot(this);
            $.extend(rect, pos);
        }

        var opacity = parseFloat(window.manager.loadValue(this.name + ":opacity") || 1);

        this.source
                .stop(true, false)
                .css(rect)
                .show()
                .css({opacity: .01})
                .animate({opacity: opacity}, 'fast');
        this.scaffold.doLayout();
    },
    teardown : function() {
        this.source.hide();
    },
    onMove : function() {
        window.manager.saveRect(this.name, this.source);
    },
    hide : function() {
        this.hidden = true;
        this.source.hide();
        this.scaffold.hide();
        window.manager.saveValue(this.name + ":hidden", true);
    },
    show : function() {
        this.hidden = false;
        this.appear();
        this.scaffold.show();
        window.manager.saveValue(this.name + ":hidden", '');
    }
});

/*
    Manager - loadCard
        if the card is not ready:
            wait until it is
        if the card have a saved rect:
            set the rect of the card
            set the html of the card
            set the name of the card
            have the card fade in
        if the card doesn't have a saved rect:
            set the html of the card
            set the name of the card
            position off-camera
            autosize the card
            hide the card
            autoposition the card
            have the card fade in
        for each overlay:
            set the name of the overlay
            if the overlay has a saved rect:
                set the rect of the overlay    
            
            

        UNOOP
        BEHAVIORS
        EVENTS
        SOURCE



function Card(frame) {
    this.source = $(frame);
    //this.scaffold = new Scaffold("card", this.source);
    this.source.scaffold();

    this.name = null;
    this.html = null;
    this._ready = false;

    this.source.on('load', jQuery.proxy(this.onFrameLoad, this) );
    this.source.on('moved', jQuery.proxy(this.onMoved, this) );
    this.source.hide();
}

$.extend(Card.prototype, {
    teardown : function(index) {
        this.source.hide((index + 1) * 200);
    },
    appear : function(index, css) {
        this.source
                .css(css)
                .hide()
                .fadeIn((index + 1) * 200);
        
        this.source.css( {position: 'absolute', top: 100, left: 100} );
        this.source.trigger('transform');
       // this.scaffold.doLayout();
    },
    setHTML : function(html) {
        this.html = html;
        if (!this._ready) return;

        $(this.source[0].contentWindow.document.body).empty().append(html);
        this.source.show();
        
       // this.scaffold.autoSize();
    },
    setName : function(name) {
        this.name = name
        if (!this._ready) return;

        // this.scaffold.setName(name);
    },
    onFrameLoad : function() {
        this._ready = true;
        if (this.name) this.setName(this.name);
        if (this.html) this.setHTML(this.html);
    },
    onMoved : function() {
        window.manager.saveRect(this.name, this.source);
    }
});
*/  