from django.conf.urls import patterns, include, url


### Urls
urlpatterns = patterns('',
    url(r'^$', 'deck.views.index', name="deck"),
    url(r'^(?P<path>.+)$', 'deck.views.card', name="card"),
)
