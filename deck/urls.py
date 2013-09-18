from django.conf.urls import patterns, include, url


### Urls
urlpatterns = patterns('',
    url(r'^$', 'deck.views.index', name="deck"),
    url(r'^build_snapshots/$', 'deck.views.build_snapshots', name="build_snapshots"),
    url(r'^validate/$', 'deck.views.validate', name="validate"),
    url(r'^invalidate/$', 'deck.views.invalidate', name="invalidate"),
    url(r'^container/$', 'deck.views.container', name="container"),
    url(r'^overlay/(?P<path>.+)$', 'deck.views.overlay', name="overlay"),
    url(r'^(?P<path>.+)$', 'deck.views.card', name="card"),
)
