function OverlayMaster() {
	this.dragging = null;
	this.map = {};
	this.mask = $('<div class="mask">').appendTo(document.body).hide();

	$(document.body).on("mousemove", jQuery.proxy(OverlayMaster.prototype.onMouseMove, this));
}

OverlayMaster.prototype.onMouseMove = function(e) {
	if (this.dragging == null) return;
    
    var name = this.dragging.name;
	var pos = {
        top: e.pageY - this.dragging.y,
        left: e.pageX - this.dragging.x
    };

    this.setPosition(name, pos);
}

OverlayMaster.prototype.setPosition = function(name, pos) {
	var overlay = this.map[name];
	if (window.snapToGrid) {
		pos.top = Math.round(pos.top / 10) * 10;
		pos.left = Math.round(pos.left / 10) * 10;
	}
    overlay.css(pos);
    $.cookie(name + "-position", pos.top + "," + pos.left);
}

OverlayMaster.prototype.getPosition = function(name) {
	var saved_pos = $.cookie(name + "-position");
	try {
		if (saved_pos) {
			var pair = saved_pos.split(',');
			return {
				top: parseInt( pair[0] ),
				left: parseInt( pair[1] ),
			}
		}
	} catch (e) {
		console.log(e);
		return null;
	}
}

OverlayMaster.prototype.opacityBox = function(overlay, value) {
	var box = $('<div class="opacity-box">').css('opacity', value);
	box.click(function() {
		overlay.find('img').css('opacity', value);
	});
	overlay.find('.opacity-line').append(box);
}

OverlayMaster.prototype.create = function(name, url, pos) {
	this.remove(name);

	var master = this;
	var img = $('<image>')
				.attr('src', url)
				.attr('title', name)
				.load(function() {
					overlay.css(master.getPosition(name) || pos);
					overlay.fadeIn();
				});
	var name = $('<div class="name">')
				  .append(name);
	var opacity_line = $('<div class="opacity-line">');
	var overlay = $('<div class="overlay">')
					.append(img)
					.append(name)
					.append(opacity_line)
					.appendTo(document.body)
					.hide();

	for(var opacity = .20; opacity <= 1.1; opacity += .2) {
		this.opacityBox(overlay, opacity);
	}
					
	overlay.mousedown(function(e) {
		master.dragging = {
			name: name,
			x: e.pageX - overlay.offset().left,
			y: e.pageY - overlay.offset().top
		}
		master.mask.show();
		return false;
	});

	overlay.mouseup(function(e) {
		master.dragging = null;
		master.mask.hide();
	});

	this.map[name] = overlay;
}

OverlayMaster.prototype.remove = function(name) {
	var overlay = this.map[name];
	if (overlay) {
		overlay.remove();
		delete this.map[name];
	}
}

OverlayMaster.prototype.clear = function() {
	for(var name in this.map) {
		this.remove(name);
	}
}