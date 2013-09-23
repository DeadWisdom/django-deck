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
