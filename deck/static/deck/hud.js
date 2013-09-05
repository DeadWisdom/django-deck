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
                hidden: true,
                click : function() { window.manager.build_snapshot_for_current(); }
            }),
            validate: this.left.append({
                type: 't-button',
                text: 'validate',
                icon: 'invalid',
                hidden: true
            })
        }
    }
})

$(function() {
    window.hud = HUD();
})