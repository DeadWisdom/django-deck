LayerButton = Tea.Button.extend({
    type: 'layer-button',
    cls: 't-button layer-button',
    subject: null,
    init : function() {
        this.__super__();

        this._check = $('<input class="checkbox" type="checkbox">').prependTo(this.source);
        if (!this.subject.hidden)
            this._check.prop('checked', 'checked');
    },
    handlePress : function(e) {
        if (e.target == this._check[0]) return this.toggle();
        window.manager.bringForward(this.subject);
        this.subject.source.hide().fadeIn();
    },
    toggle : function() {
        var checked = this._check.prop('checked');
        if (checked)
            this.subject.show();
        else 
            this.subject.hide();
    }
});

LayerMenu = Tea.Container.extend({
    type: 'layer-menu',
    cls: 'layer-menu',
    init : function() {
        this.__super__();
        this.source.appendTo(document.body);
    },
    addLayer : function(name, subject) {
        this.append({
            type: 'layer-button',
            text: name,
            subject: subject
        });
    }
});

Layer = Tea.Element.extend({
    type: 'layer',
    src: null,
    source: '<img>',
    cls: 'layer',
    path: null,
    name: null,
    init : function() {
        this.__super__();
        
        this.source.attr('src', this.src);
        this.hook(this.source, 'load', this.onLoad);
        this.hook(this, 'move', this.onMove);
        this.scaffold = Scaffold({subject: this, name: this.name});

        this.source.appendTo(document.body);
        this._loaded = false;
    },
    teardown : function() {
        this.destroy();
        this.scaffold.destroy();
    },
    onLoad : function() {
        this._dim = {
            width: this.source.width(), height: this.source.height()
        };
        this.appear();
    },
    autoSize : function() {
        if (this._dim)
            this.source.css(this._dim);
    },
    appear : function() {
        if (this.hidden) return false;

        var rect = window.manager.loadRect(this.src) || {};

        if (rect.top == undefined || rect.top == null) {
            var pos = window.manager.findEmptySpot(this);
            $.extend(rect, pos);
        }

        var opacity = parseFloat(window.manager.loadValue(this.src + ":opacity") || 1);

        this.source
                .stop(true, false)
                .css(rect)
                .show()
                .css({opacity: .01})
                .animate({opacity: opacity}, 'fast');
        this.scaffold.doLayout();
    },
    onMove : function() {
        window.manager.saveRect(this.src, this.source);
    },
    hide : function() {
        this.hidden = true;
        this.source.hide();
        window.manager.saveValue(this.src + ":hidden", true);
    },
    show : function() {
        this.hidden = false;
        this.appear();
        window.manager.saveValue(this.src + ":hidden", '');
    },
    getId : function() {
        return this.src;
    }
});