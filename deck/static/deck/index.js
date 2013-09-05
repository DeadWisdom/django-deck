$(function() {
	var frame = $('#frame');
	var loading = $('#loading');

	frame.scaffold = new Scaffold( "card", frame );

	function loadFromHash() {
		var load = window.location.hash.substring(2);
		if (load && window.__card != load) {
			window.__card = load;
			// frame[0].contentWindow.location.href = window.location.pathname + load;
			getContent(window.location.pathname + load);
			$('.overlay').remove();
		}
	}

	function getContent(url) {
		var body = $(frame[0].contentWindow.document.body);

		$.ajax({
			url: url,
			dataType: 'html',
			success: function(html, status, xhr) {
				loading.hide();
				frame.show();
				body.empty().append(html);

				$('.overlay').remove();
				var images = xhr.getResponseHeader('images').split(';');
				for(var i = 0; i < images.length; i++) {
					var im = images[i].split('=');
					createOverlay(im[0], im[1]);
				}

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

				frame.trigger('load', [html]);

				frame.scaffold.setName(xhr.getResponseHeader('path'));
			}
		});

		loading.show();
	}

	function onKeyDown(e) {
		console.log(e.keyCode);
		if (e.keyCode == 'e') {
			$('#frame')[0].contentWindow.location.reload();
		}
	}

	function menuHidden(source) {
		return function() {
			source.css('left', -320);
			source.addClass('hidden');
		}
	}

	function hideMenu(source) {
		return function() {
			source.stop(true, false).animate({
				left: -320,
			}, 300, 'swing', menuHidden(source));
		}
	}

	function showMenu(source) {
		return function() {
		source.removeClass('hidden');
			source.stop(true, false).animate({
				left: 0,
			}, 100);
		}
	}

	window.createOverlay = function(name, url) {
		window.overlays.create(name, url, {top: 10, left: 10});
	}

	//loadFromHash();
	//setInterval(loadFromHash, 1000);

	$('.menu').each(function(index, e) {
		var menu = $(e);
		menu.hover(showMenu(menu), hideMenu(menu));
		menuHidden(menu)();
	});

	window.overlays = new OverlayMaster();

	if ($.cookie('snapToGrid') == 'false') {
		$('#snapToGrid').prop('checked', false);
		window.snapToGrid = false;
	} else {
		$('#snapToGrid').prop('checked', true);
		window.snapToGrid = true;
	}

	$('#snapToGrid').change(function() {
		var value = $('#snapToGrid').prop('checked');
		if (!value)
			$.cookie('snapToGrid', 'false');
		else
			$.cookie('snapToGrid', 'true');

		window.snapToGrid = value;
	})
});

