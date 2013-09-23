import os, mimetypes, urllib, json

from django.http import HttpResponse, Http404
from django.shortcuts import render, get_object_or_404, render_to_response, redirect
from django.template.loader import Template, get_template, TemplateDoesNotExist
from django.template import RequestContext
from django.conf import settings
from phantom import take_shots

from models import Card, CardGroup

### Helpers ###
def get_overlay_path(path, name):
    prefix = getattr(settings, 'DECK_PREFIX', 'decks/')
    try:
        template = get_template("%s%s" % (prefix, path))
    except TemplateDoesNotExist:
        raise Http404
    base, _ = os.path.splitext(template.origin.name)
    for ext in ('png', 'jpg', 'jpeg', 'gif'):
        path = "%s_%s.png" % (base, name)
        if os.path.exists(path):
            return path
    raise Http404


### Views ###
def index(request):
    DECK_PATH = os.path.abspath( getattr(settings, 'DECK_PATH', 'decks') )
    group = CardGroup( DECK_PATH )
    return render(request, "deck/index.html", locals())


def overlay(request, path):
    DECK_PATH = os.path.abspath( getattr(settings, 'DECK_PATH', 'decks') )
    path = os.path.abspath( os.path.join(DECK_PATH, path) )
    if not os.path.exists(path) or not path.startswith(DECK_PATH):
        raise Http404
    mime = mimetypes.guess_type(path)[0]
    with open(path) as file:
        return HttpResponse(file.read(), mimetype=mime)


def card(request, path):
    DECK_PATH = os.path.abspath( getattr(settings, 'DECK_PATH', 'decks') )
    path = os.path.join(DECK_PATH, path)
    if not os.path.exists(path) or not path.startswith(DECK_PATH):
        raise Http404
    mime = mimetypes.guess_type(path)[0]
    if mime.startswith('image/'):
        with open(path) as file:
            return HttpResponse(file.read(), mimetype=mime)
    if (request.GET.get('render') == 'yes'):
        return render_card(request, path)
    card, _ = Card.objects.get_or_create(path=path)
    template = Template( card.source )
    context = RequestContext( request, locals() )
    card.html = template.render( context )
    response = render(request, "deck/exact.html", locals())
    response['images'] = ";".join(
        [ "%s=%s" % (image['name'], image['url']) for image in card.images ]
    )
    response['name'] = card.name
    response['path'] = card.relative
    if card.is_valid():
        response['is_valid'] = "yes" 
    else:
        response['is_valid'] = "no"
    return response


def render_card(request, path):
    card = Card.objects.get(path=path)
    template = Template( card.source )
    context = RequestContext( request, locals() )
    source = template.render( context )
    return render(request, "deck/render.html", locals())


def build_snapshots(request):
    host = request.get_host()
    path = request.GET.get('path')
    if (path):
        DECK_PATH = os.path.abspath( getattr(settings, 'DECK_PATH', 'decks') )
        path = os.path.join(DECK_PATH, path)
        qs = Card.objects.filter(path=path)
    else:
        qs = Card.objects.all()

    cards = {}
    images = []
    for card in qs:
        url = "http://%s%s?render=yes" % (host, card.url)
        cards[url] = card

    for url, src in take_shots(cards.keys()):
        url, _, _ = url.replace(" ", "%20").partition('#')
        images.append( cards[url].save_shot(src) )

    response = HttpResponse(json.dumps(images), mimetype="application/json")
    if (path):
        card = Card.objects.get(path=path)
        if card.is_valid():
            response['is_valid'] = "yes" 
        else:
            response['is_valid'] = "no"
        print response['is_valid']
    return response


def container(request):
    return render(request, "deck/container.html", locals())


def validate(request):
    path = request.GET.get('path')
    DECK_PATH = os.path.abspath( getattr(settings, 'DECK_PATH', 'decks') )
    path = os.path.join(DECK_PATH, path)
    card = get_object_or_404(Card, path=path)
    if (not card.shot):
        host = request.get_host()
        for url, src in take_shots(["http://%s%s?render=yes" % (host, card.url)]):
            card.save_shot(src)
    card.validate()
    return HttpResponse(json.dumps(True), mimetype="application/json")


def invalidate(request):
    path = request.GET.get('path')
    DECK_PATH = os.path.abspath( getattr(settings, 'DECK_PATH', 'decks') )
    path = os.path.join(DECK_PATH, path)
    card = get_object_or_404(Card, path=path)
    card.invalidate()
    return HttpResponse(json.dumps(True), mimetype="application/json")

