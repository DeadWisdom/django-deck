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

        if (!this._check.prop('checked')) {
            this._check.prop('checked', 'checked');
            this.toggle();
        }
    
        this.subject.source.hide().fadeIn();
        window.manager.bringForward(this.subject);
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
        this.insertAfter = $('<h2>Layers</h2>').appendTo(this.source);
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
    },
    setValue : function(src) {
        this.source.attr('src', null);
        this.source.attr('src', src + "?t=" + (new Date).getTime());
        this.src = src;
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
        this.scaffold.hide();
        window.manager.saveValue(this.src + ":hidden", true);
    },
    show : function() {
        this.hidden = false;
        this.appear();
        this.scaffold.show();
        window.manager.saveValue(this.src + ":hidden", '');
    },
    getId : function() {
        return this.src;
    }
});