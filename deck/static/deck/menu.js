CardSearch = Tea.Container.extend({
    type: 'card-search',
    cls: 'card-search',
    init : function() {
        this.__super__();
        this.input = this.append({
            type: 't-input',
            placeholder: 'filter'
        });

        this.clear = this.append({
            type: 't-button',
            text: 'cancel',
            icon: 'cancel',
            hidden: true,
            click: 'onClear'
        });

        this.hook(this.input.source, 'keyup', this.onKeyDown);

        this.setValue( $.cookie('filter') );
    },
    onKeyDown : function() {
        var v = this.input.getValue();
        if (v) {
            this.clear.show();
            $.cookie('filter', v);
        } else {
            this.clear.hide();
            $.cookie('filter', null);
        }
        this._parent.filter(v);
    },
    onClear : function () {
        this.setValue(null);
        this._parent.filter(null);
    },
    setValue : function(v) {
        if (v) {
            this.input.setValue(v);
            this.clear.show();
            $.cookie('filter', v);
        } else {
            this.input.setValue('');
            this.clear.hide();
            $.cookie('filter', null);
        }
    },
    getValue : function() {
        return this.input.getValue() || null;
    }
})

CardButton = Tea.Button.extend({
    type: 'card-button',
    cls: 't-button card-button',
    icon: 'none',
    card: null,
    init : function() {
        this.__super__();

        this.source.attr( {href: '#/' + this.card.path} );
        if (this.card.is_valid == false) this.setIcon('invalid');

        this.hook(this._icon, 'click', function() {
            this.setIcon('none');
            manager.validate(this.card.path);
            return false;
        });
    },
    validate : function(path) {
        if (this.card.path == path) {
            this.setIcon('none');
        }
    },
    invalidate : function(path) {
        if (this.card.path == path) {
            this.setIcon('invalid');
            return true;
        }
    }
})

CardTree = Tea.Tree.extend({
    type: 'card-tree',
    group: null,
    expanded: false,
    full_paths: false,
    icon: 'none',
    init : function() {
        this.__super__();
        this.trees = [];

        if (this.group) {
            this.setText(this.group.name);
            this.addGroups(this.group.groups);
            this.addCards(this.group.cards);

            if (this.group.is_valid == false) {
                this.setIcon('invalid');
            }
        } else {
            this.setText('');
        }

        this.hook(this._text, 'click', this.toggleExpanded);
        this.hook(this.tick, 'click', this.toggleExpanded);
    },
    addGroups : function(groups) {
        for(var i = 0; i < groups.length; i++) {
            this.trees.push( this.tail.append({
                type: 'card-tree',
                group: groups[i]
            }) );
        }
    },
    addCards : function(cards) {
        for(var i = 0; i < cards.length; i++) {
            this.tail.append({
                type: 'card-button',
                card: cards[i],
                text: this.full_paths ? cards[i].path : cards[i].name
            });
        }
    },
    gatherCards : function(list, fn) {
        var trees = this.trees;
        var cards = this.group.cards;

        for(var i = 0; i < trees.length; i++) {
            trees[i].gatherCards(list, fn);
        }

        for(var i = 0; i < cards.length; i++) {
            if (!fn || fn(cards[i]))
                list.push( cards[i] );
        }
    },
    empty : function() {
        this.trees = [];
        this.tail.empty();
    },
    validate : function(url) {
        var self = this;
        var has_invalid = false;
        this.tail.each(function(i, item) {
            if (item.validate(url));
                has_invalid = true;
        });

        if (has_invalid) {
            this.setIcon('invalid');
        } else {
            this.setIcon('none');
        }
    },
    invalidate : function(url) {
        var self = this;
        var has_invalid = false;
        this.tail.each(function(i, item) {
            if (item.invalidate(url));
                has_invalid = true;
        });

        if (has_invalid) {
            this.setIcon('invalid');
        } else {
            this.setIcon('none');
        }
    }
});

CardMenu = Tea.Container.extend({
    type: 'card-menu',
    title: 'deck',
    cls: 'menu hidden',
    init : function() {
        this.__super__();

        this.source.appendTo(document.body);

        this.title = this.append({
            type: 't-element',
            source: '<h1>',
            value: this.title
        });

        this.search = this.append({
            type: 'card-search'
        })

        this.tree = this.append({
            type: 'card-tree',
            cls: 'principal',
            group: window.Deck,
            expanded: true
        });

        this.results = this.append({
            type: 'card-tree',
            cls: 'principal',
            group: null,
            expanded: true,
            hidden: true,
            full_paths: true
        })

        var filter = this.search.getValue();
        if (filter) this.filter(filter);

        this.hook(this.source, 'mouseenter', this.onMouseEnter);
        this.hook(this.source, 'mouseleave', this.onMouseLeave);

        this.hide();
    },
    onMouseEnter : function(e) {
        this.source
            .removeClass('hidden')
            .stop(true, false).animate({left: 0}, 100);
    },
    onMouseLeave : function(e) {
        this.source
            .stop(true, false)
            .animate({ left: -320 }, 300, 'swing', jQuery.proxy(this.hide, this));
    },
    filter : function(v) {
        if (!v) {
            this.results.hide();
            this.tree.show();
            return;
        }

        var cards = []
        var re = new RegExp(v);
        this.tree.gatherCards(cards, function(card) {
            return card.path.match(re);
        });
        this.results.empty();
        this.results.addCards(cards);

        this.tree.hide();
        this.results.show();
    },
    hide : function() {
        this.source
            .css('left', -320)
            .addClass('hidden');
    },
    validate : function(path) {
        this.tree.validate(path);
    },
    invalidate : function(path) {
        this.tree.invalidate(path);
    }
});
