Scaffold = Tea.Element.extend({
    type: 'scaffold',
    cls: 'scaffold',
    subject: null,
    init : function() {
        this.__super__();

        this.source.appendTo(document.body);
        this.top = $('<div class="top">').appendTo(this.source);
        this.right = $('<div class="right">').appendTo(this.source);
        this.left = $('<div class="left">').appendTo(this.source);
        this.bottom = $('<div class="bottom">').appendTo(this.source);
        this.mask = $('<div class="mask">').appendTo(this.source);
        this.corner = $('<div class="corner">').appendTo(this.source);

        this.dimx = $('<span class="dim dimx">').appendTo(this.source);
        this.dimy = $('<span class="dim dimy">').appendTo(this.source);
        this.auto = $('<span class="auto">').appendTo(this.top);
        this.title = $('<span class="title">').append(this.name || '').appendTo(this.top);

        this.opaciter = ScaffoldOpaciter({scaffold: this});

        this.bindEvents();

        if (this.subject)
            this.attach(this.subject);
    },
    destroy : function() {
        this.opaciter.destroy();
        this.__super__();
    },
    attach : function(subject) {
        if (this.subject) this.unhook(subject);
        this.subject = subject;
    },
    bindEvents : function() {
        var self = this;

        function dragCallback(type) {
            return function(e) {
                return this.startDrag(e, type);
            }
        }

        this.hook(this.top, 'mousedown', dragCallback('move'));
        this.hook(this.right, 'mousedown', dragCallback('resize-h'));
        this.hook(this.bottom, 'mousedown', dragCallback('resize-v'));
        this.hook(this.corner, 'mousedown', dragCallback('resize-both'));

        this.hook(this.auto, 'mousedown', function(e) {
            e.preventDefault();
            return false;
        });

        this.hook(this.auto, 'click', function(e) {
            if (this.subject) {
                this.subject.autoSize();
                this.doLayout();
                this.subject.trigger('move');
            }
        });
    },
    doLayout : function() {
        var offset = this.subject.source.offset();
        var width = this.subject.source.width();
        var height = this.subject.source.height();

        this.source.css(offset);

        this.top.css({
            width: width + 10,
            top: -24,
            left: -5,
            height: 24
        });

        this.bottom.css({
            top: height,
            width: width + 10,
            left: -5,
            height: 5
        });

        this.left.css({
            height: height,
            top: 0,
            left: -5,
            width: 5
        });

        this.right.css({
            left: width,
            height: height,
            top: 0,
            width: 5
        });

        this.mask.css({
            height: height,
            width: width,
        });

        var corner_w = width * .12;
        var corner_h = height * .12;

        this.corner.css({
            width: corner_w,
            height: corner_h,
            left: width - corner_w + 6,
            top: height - corner_h + 5
        })

        this.dimx
            .empty()
            .append(width + "px")
            .css({
                position: 'absolute',
                left: (width / 2) - (this.dimx.width() / 2),
                top: height + 10
            });

        this.dimy
            .empty()
            .append(height + "px")
            .css({
                position: 'absolute',
                left: width + 10,
                top: (height / 2) - (this.dimx.height() / 2)
            });
    },
    startDrag : function(e, type) {
        var offset = this.source.offset();
        this.dragging = Scaffold.dragging = {
            type: type,
            dragX: e.clientX - offset.left,
            dragY: e.clientY - offset.top,
            scaffold: this
        };
        this.mask.show();
        this.source.addClass('dragging');
        window.manager.bringForward(this.subject);
        e.preventDefault();
    },
    stopDrag : function(e) {
        this.dragging = Scaffold.dragging = null;
        this.mask.hide();
        if (this.source && jQuery.isFunction(this.source.removeClass))
            this.source.removeClass('dragging');
        e.preventDefault();
        if (this.subject)
            this.subject.trigger('move');
    },
    documentMouseMove : function(e) {
        var offset = this.subject.source.offset();
        var dragging = this.dragging;

        if (dragging.type == 'move') {
            var x = e.clientX - dragging.dragX;
            var y = e.clientY - dragging.dragY;

            if (window.snapToGrid) {
                x = Math.round(x / 10) * 10;
                y = Math.round(y / 10) * 10;
            }

            this.subject.source.css({
                position: 'absolute',
                left: x,
                top: y
            });
        } else if (dragging.type == 'resize-both') {
            this.subject.source.css({
                width: e.clientX - offset.left,
                height: e.clientY - offset.top
            });
        } else if (dragging.type == 'resize-h') {
            this.subject.source.css({
                width: e.clientX - offset.left
            });
        } else if (dragging.type == 'resize-v') {
            this.subject.source.css({
                height: e.clientY - offset.top
            });
        }

        this.doLayout();
    },
    setName : function(name) {
        this.title.empty().append(name);
    }
});

(function() {
    function globalDragDelegate(event) {
        return function() {
            if (!Scaffold.dragging) return;
            var instance = Scaffold.dragging.scaffold;
            return instance[event].apply(instance, arguments);
        }
    }

    $(document).on('mousemove', globalDragDelegate("documentMouseMove"));
    $(document).on('mouseup', globalDragDelegate("stopDrag"));
})();


ScaffoldOpaciter = Tea.Element.extend({
    type: 'opaciter',
    cls: 'opaciter',
    value: 1,
    scaffold: null,
    init : function() {
        this.__super__();

        for(var opacity = .20; opacity <= 1.0; opacity += .2) {
            this.createBox(opacity);
        }

        this.source.appendTo(this.scaffold.source);
    },
    createBox : function(opacity) {
        var box = $('<div class="box">').css('opacity', opacity).appendTo(this.source);
        this.hook(box, 'click', function() {
            window.manager.saveValue(this.scaffold.subject.getId() + ":opacity", opacity);
            this.setValue(opacity)
        });
    },
    setValue : function(value) {
        this.value = value;
        if (this.scaffold.subject)
            this.scaffold.subject.source.css('opacity', value);
    },
    getValue : function() {
        return this.value;
    }
})

/*
function Scaffold(name, subject) {
    this.subject = $(subject);

    this.source = $('<div class="scaffold">').appendTo(document.body);
    this.top = $('<div class="top">').appendTo(this.source);
    this.right = $('<div class="right">').appendTo(this.source);
    this.left = $('<div class="left">').appendTo(this.source);
    this.bottom = $('<div class="bottom">').appendTo(this.source);
    this.mask = $('<div class="mask">').appendTo(this.source);
    this.corner = $('<div class="corner">').appendTo(this.source);

    this.dimx = $('<span class="dim dimx">').appendTo(this.source);
    this.dimy = $('<span class="dim dimy">').appendTo(this.source);
    this.auto = $('<span class="auto">').appendTo(this.top);
    this.title = $('<span class="title">').append(name).appendTo(this.top);

    this.bindEvents();
    this.subject.on('load', jQuery.proxy(this.ready, this));

    $(document).on('mousemove', jQuery.proxy(this.documentMouseMove, this));
    $(document).on('mouseup', jQuery.proxy(this.stopDrag, this));
}

$.extend(Scaffold.prototype, {
    setName : function(name) {
        this.title.empty().append(name);
    },
    ready : function() {
        this.autoSize();
        this.doLayout();
    },
    autoSize : function() {
        if (this.subject[0].tagName == 'IMG') {
            return;
        }

        var body = $(this.subject[0].contentDocument.body);
        var width = 0;
        var height = 0;

        this.subject.css({
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

        this.subject.css({
            width: width,
            height: height
        });
    },
    doLayout : function() {
        var offset = this.subject.offset();
        var width = this.subject.width();
        var height = this.subject.height();

        this.source.css(offset);

        this.top.css({
            width: width + 10,
            top: -24,
            left: -5,
            height: 24
        });

        this.bottom.css({
            top: height,
            width: width + 10,
            left: -5,
            height: 5
        });

        this.left.css({
            height: height,
            top: 0,
            left: -5,
            width: 5
        });

        this.right.css({
            left: width,
            height: height,
            top: 0,
            width: 5
        });

        this.mask.css({
            height: height,
            width: width,
        });

        var corner_w = width * .12;
        var corner_h = height * .12;

        this.corner.css({
            width: corner_w,
            height: corner_h,
            left: width - corner_w + 6,
            top: height - corner_h + 5
        })

        this.dimx
            .empty()
            .append(width + "px")
            .css({
                position: 'absolute',
                left: (width / 2) - (this.dimx.width() / 2),
                top: height + 10
            });

        this.dimy
            .empty()
            .append(height + "px")
            .css({
                position: 'absolute',
                left: width + 10,
                top: (height / 2) - (this.dimx.height() / 2)
            });
    },
    startDrag : function(e, type) {
        var offset = this.source.offset();
        this.dragging = {
            type: type,
            dragX: e.clientX - offset.left,
            dragY: e.clientY - offset.top,
        };
        this.source.addClass('dragging');
        e.preventDefault();
    },
    stopDrag : function(e) {
        this.dragging = null;
        this.source.removeClass('dragging');
        e.preventDefault();
    },
    documentMouseMove : function(e) {
        if (this.dragging == null) return;
        var offset = this.subject.offset();
        var dragging = this.dragging;

        if (dragging.type == 'move') {
            var x = e.clientX - dragging.dragX;
            var y = e.clientY - dragging.dragY;

            if (window.snapToGrid) {
                x = Math.round(x / 10) * 10;
                y = Math.round(y / 10) * 10;
            }

            this.subject.css({
                position: 'absolute',
                left: x,
                top: y
            }).trigger('moved');
        } else if (dragging.type == 'resize-both') {
            this.subject.css({
                width: e.clientX - offset.left,
                height: e.clientY - offset.top
            }).trigger('moved');
        } else if (dragging.type == 'resize-h') {
            this.subject.css({
                width: e.clientX - offset.left
            }).trigger('moved');
        } else if (dragging.type == 'resize-v') {
            this.subject.css({
                height: e.clientY - offset.top
            }).trigger('moved');
        }

        this.doLayout();
    },
    bindEvents : function() {
        var self = this;
        this.top.mousedown(function(e) {
            return self.startDrag(e, 'move');
        });
        this.right.mousedown(function(e) {
            return self.startDrag(e, 'resize-h');
        });
        this.bottom.mousedown(function(e) {
            return self.startDrag(e, 'resize-v');
        });
        this.corner.mousedown(function(e) {
            return self.startDrag(e, 'resize-both');
        });
        this.auto
            .mousedown(function(e) {
                e.preventDefault();
                return false;
            })
            .click(function() {
                self.autoSize();
                self.doLayout();
                self.subject.trigger('moved');
            });

        this.subject.on('load', function() {
            self.autoSize();
            self.doLayout();
        });
    }
});*/