function loadFromHash() {
	var load = window.location.hash.substring(2);
	if (load && window.__card != load) {
		window.__card = load;
		$('#frame')[0].contentWindow.location.href = window.location.pathname + load;
		$('.overlay').remove();
	}
}

function onKeyDown(e) {
	console.log(e.keyCode);
	if (e.keyCode == 'e') {
		$('#frame')[0].contentWindow.location.reload();
	}
}

function menuHidden(source) {
	return function() {
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

function createOverlay(name, url) {
	window.overlays.create(name, url, {top: 10, left: 10});
}

$(function() {
	loadFromHash();
	setInterval(loadFromHash, 100);

	var menu = $('.menu');
	var options = $('.options');
	menu.hover(showMenu(menu), hideMenu(menu));
	options.hover(showMenu(options), hideMenu(options));

	window.overlays = new OverlayMaster();

	hideMenu(menu)();
	hideMenu(options)();

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

