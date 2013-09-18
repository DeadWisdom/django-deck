HUD = Tea.Container.extend({
    type: 'hud',
    cls: 'hud',
    init : function() {
        this.__super__();
        this.source.appendTo(document.body);

        this.left = this.append({
            type: 't-container',
            css: {left: 40, bottom: 0, position: 'fixed', height: 40}
        });

        this.right = this.append({
            type: 't-container',
            css: {right: 200, bottom: 0, position: 'fixed', height: 40}
        });

        this.buttons = {
            left: this.left.append({
                type: 't-button',
                cls: 'short t-button',
                text: 'left',
                icon: 'left',
                hidden: true
            }),
            right: this.left.append({
                type: 't-button',
                cls: 'short t-button',
                text: 'right',
                icon: 'right',
                hidden: true
            }),
            refresh: this.left.append({
                type: 't-button',
                text: 'refresh card',
                icon: 'refresh',
                hidden: true,
                click: function() { window.manager.reloadCard(); }
            }),
            arrange: this.left.append({
                type: 't-button',
                text: 'arrange',
                icon: 'arrange',
                click: function() { window.manager.arrange(); }
            }),
            snap: this.left.append({
                type: 't-button',
                text: 'build snapshot',
                icon: 'snapshot',
                click : function() { 
                    window.manager.build_snapshot_for_current(); 
                }
            }),
            validate: this.left.append({
                type: 'validation-button',
                value: true
            }),
            mobile : this.right.append({
                type: 't-button',
                icon: 'mobile',
                text: 'mobile (300)',
                click : function() {
                    manager.card.setWidth(300);
                }
            }),
            tablet : this.right.append({
                type: 't-button',
                icon: 'tablet',
                text: 'tablet (800)',
                click : function() {
                    manager.card.setWidth(800);
                }
            }),
            desktop : this.right.append({
                type: 't-button',
                icon: 'desktop',
                text: 'desktop (1000)',
                click : function() {
                    manager.card.setWidth(1000);
                }
            })
        }
    }
});

ValidationButton = Tea.Button.extend({
    type: 'validation-button',
    init : function() {
        this.__super__();

        this.setValue(this.value);

        this.hook(this.source, 'mouseenter', this.mouseEnter);
        this.hook(this.source, 'mouseleave', this.mouseLeave);
    },
    setValue : function(v) {
        this.value = v;
        if (v) {
            this.setText('valid');
            this.setIcon('valid');
            this.source.removeClass('invalid-button').addClass('valid-button');
        } else {
            this.setText('invalid');
            this.setIcon('invalid');
            this.source.removeClass('valid-button').addClass('invalid-button');
        }
    },
    getValue : function() {
        return this.value;
    },
    setText : function(text) {
        var value = this.value;
        this.__super__(text);
        this.value = value;
    },
    mouseEnter : function() {
        if (this.value) {
            this.setText('invalidate');
        } else {
            this.setText('validate');
        }
    },
    mouseLeave : function() {
        if (this.value) {
            this.setText('valid');
        } else {
            this.setText('invalid');
        } 
    },
    click : function() {
        if (this.value)
            window.manager.invalidate();
        else
            window.manager.validate();
    }
});
