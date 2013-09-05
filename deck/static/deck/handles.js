$(function() {
	var frame = $('#frame');
	var dragging = null;

	var handles = $('<div id="handles">').appendTo(document.body);
	var anchor = $('<div class="anchor">').appendTo(handles);
	var resizer = $('<div class="resizer">').appendTo(handles);
	var right = $('<div class="right">').appendTo(handles);
	var left = $('<div class="left">').appendTo(handles);
	var bottom = $('<div class="bottom">').appendTo(handles);
	var mask = $('<div class="mask">').appendTo(handles).hide();
	var dimx = $('<span class="dimx">').appendTo(handles).hide();
	var dimy = $('<span class="dimy">').appendTo(handles).hide();
	var auto = $('<span class="auto">').appendTo(anchor);

	function autoPositionFrame() {
		var win_w = $(window).width();
		var win_h = $(window).height();
		var frame_w = frame.width();
		var frame_h = frame.height();

		var left = (win_w / 2) - (frame_w / 2);
		var top = (win_h / 2) - (frame_h / 2);

		if (left < 40) left = 40;
		if (top < 40) top = 40;

		frame.css({
			left: left,
			top: top
		})
	}

	function autoSizeFrame() {
		var body = $(frame[0].contentDocument.body);
		var width = 0;
		var height = 0;

		frame.css({
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

		frame.css({
			position: 'absolute',
			width: width,
			height: height
		}).show();
	}

	function onFrameLoad() {
		autoSizeFrame();
		autoPositionFrame();
		doLayout();
	}

	function doLayout() {
		var offset = frame.offset();
		var dim = {
			width: frame.width(),
			height: frame.height()
		}

		anchor.css({
			position: 'absolute',
			left: offset.left - 5,
			top: offset.top - 24,
			width: dim.width + 10,
			height: 24
		});

		bottom.css({
			position: 'absolute',
			left: offset.left - 5,
			top: offset.top + dim.height,
			width: dim.width + 10,
			height: 5
		});

		resizer.css({
			position: 'absolute',
			left: offset.left + dim.width,
			top: offset.top + dim.height,
			width: 5,
			height: 5
		});

		left.css({
			position: 'absolute',
			left: offset.left -  5,
			top: offset.top,
			width: 5,
			height: dim.height
		})

		right.css({
			position: 'absolute',
			left: offset.left + dim.width,
			top: offset.top,
			width: 5,
			height: dim.height
		});

		mask.css({
			position: 'absolute',
			left: offset.left,
			top: offset.top,
			width: dim.width,
			height: dim.height + 2
		});

		dimx.empty().append(dim.width).css({
			position: 'absolute',
			left: offset.left + dim.width + 10,
			top: offset.top + (dim.height / 2) - (dimx.height() / 2)
		});

		dimy.empty().append(dim.height).css({
			position: 'absolute',
			left: offset.left + (dim.width / 2) - (dimx.width() / 2),
			top: offset.top + dim.height + 10
		});
	}

	function startDragging(options) {
		dragging = options;
		handles.addClass('dragging');
		mask.show();
	}

	anchor.mousedown(function(e) {
		var offset = anchor.offset();
		startDragging({
			type: 'position',
			dragX: e.clientX - offset.left,
			dragY: e.clientY - offset.top - anchor.height()
		});
		e.preventDefault();
	});

	resizer.mousedown(function(e) {
		var offset = resizer.offset();
		startDragging({
			type: 'resize',
			dragX: e.clientX - offset.left,
			dragY: e.clientY - offset.top
		});
		e.preventDefault();
		dimx.show();
		dimy.show();
	});

	right.mousedown(function(e) {
		var offset = resizer.offset();
		startDragging({
			type: 'resize-horizontal',
			dragX: e.clientX - offset.left
		});
		e.preventDefault();
		dimx.show();
		dimy.show();
	});

	bottom.mousedown(function(e) {
		var offset = resizer.offset();
		startDragging({
			type: 'resize-vertical',
			dragY: e.clientY - offset.top
		});
		e.preventDefault();
		dimx.show();
		dimy.show();
	});

	auto.mousedown(function(e) {
		e.preventDefault();
		return false;
	});

	auto.click(function() {
		autoSizeFrame();
		doLayout();
	})

	$(document).on('mousemove', function(e) {
		if (dragging == null) return;

		if (dragging.type == 'position') {
			frame.css({
				position: 'absolute',
				left: e.clientX - dragging.dragX,
				top: e.clientY - dragging.dragY
			});

			doLayout();
		}

		if (dragging.type == 'resize') {
			var offset = frame.offset();

			frame.css({
				width: e.clientX - offset.left,
				height: e.clientY - offset.top
			})

			doLayout();
		}

		if (dragging.type == 'resize-horizontal') {
			var offset = frame.offset();

			frame.css({
				width: e.clientX - offset.left
			})

			doLayout();
		}

		if (dragging.type == 'resize-vertical') {
			var offset = frame.offset();

			frame.css({
				height: e.clientY - offset.top
			})

			doLayout();
		}
	});

	$(document).on('mouseup', function() { 
		dragging = null;
		mask.hide();
		handles.removeClass('dragging');
		dimx.hide();
		dimy.hide();
	});

	frame.on('load', onFrameLoad);
})