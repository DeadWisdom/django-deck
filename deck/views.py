import os, mimetypes

from django.http import HttpResponse
from django.shortcuts import render, get_object_or_404, render_to_response, redirect
from django.template.loader import Template
from django.template import RequestContext
from django.conf import settings

from models import Card, CardGroup


def index(request):
	DECK_PATH = os.path.abspath( getattr(settings, 'DECK_PATH', 'decks') )
	group = CardGroup( DECK_PATH )
	return render(request, "deck/index.html", locals())


def card(request, path):
	DECK_PATH = os.path.abspath( getattr(settings, 'DECK_PATH', 'decks') )
	path = os.path.join(DECK_PATH, path)
	mime = mimetypes.guess_type(path)[0]
	if mime.startswith('image/'):
		with open(path) as file:
			return HttpResponse(file.read(), mimetype=mime)
	card, _ = Card.objects.get_or_create(path=path)
	template = Template( card.source )
	context = RequestContext( request, locals() )
	card.html = template.render( context )
	if (request.GET.get('exact') == 'yes'):
		return render(request, "deck/exact.html", locals())
	else:
		return render(request, "deck/card.html", locals())


def render_card(request, slug):
	card, _ = Card.objects.get_or_create(slug=slug)
	template = Template( card.source )
	context = Context( locals() )
	source = template.render( context )
	return render(request, "deck/render.html", locals())
