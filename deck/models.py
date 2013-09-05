import os, json
from django.db import models
from django.conf import settings
from django.core.urlresolvers import reverse
from phantom import take_shots


def relative_path(path):
    DECK_PATH = os.path.abspath( getattr(settings, 'DECK_PATH', 'decks') )
    return path[len(DECK_PATH)+1:]

def take_all_shots():
    cards = {}
    for card in Card.objects.all():
        cards[card.relative] = card
    for path, src in take_shots(cards.keys()):
        cards[path].save_shot(src)


class Card(models.Model):
    path = models.CharField(max_length=255)
    cache = models.TextField(blank=True)

    thumbnail = models.ImageField(blank=True, null=True, upload_to='deck_thumbnails')
    shot = models.ImageField(blank=True, null=True, upload_to='deck_shots')
    ideal = models.ImageField(blank=True, null=True, upload_to='deck_ideals')
    mockup = models.ImageField(blank=True, null=True, upload_to='deck_mockups')

    modified = models.DateTimeField(auto_now=True)

    def __unicode__(self):
        return self.name

    def save_shot(self, src):
        from django.core.files.base import ContentFile
        name = os.path.splitext( os.path.basename(self.path) )[0]
        name = "%s-shot.png" % name
        self.shot.save(name, ContentFile(src))

    def simple(self):
        return {
            'path': self.relative,
            'name': self.name,
            'url': self.url,
            'images': list(self.images)
        }

    @property
    def name(self):
        return os.path.basename(self.path)

    @property
    def relative(self):
        return relative_path(self.path)

    @property
    def url(self):
        return reverse('card', args=[self.relative])

    @property
    def source(self):
        with open(self.path) as file:
            return file.read()

    @property
    def images(self):
        if self.mockup:
            yield {'name': 'mockup', 'url': self.mockup.url}
        else:
            # Look for an image with our same name in our directory as a mockup
            target_base, _ = os.path.splitext(self.name)
            home = os.path.dirname(self.path)
            for filename in os.listdir(home):
                base, ext = os.path.splitext(filename)
                if base == target_base and ext in ('.jpg', '.png', '.gif', '.jpeg'):
                    path = relative_path( os.path.join(home, filename) )
                    yield {'name': 'mockup', 'url': reverse("card", args=[path])}
                    break
        if self.shot:
            yield {'name': 'shot', 'url': self.shot.url}
        if self.ideal:
            yield {'name': 'ideal', 'url': self.ideal.url}
        if self.thumbnail:
            yield {'name': 'thumbnail', 'url': self.thumbnail.url}
        return


class CardGroup(object):
    def __init__(self, path):
        self.path = os.path.abspath(path)

    def simple(self):
        return {
            'path': self.path,
            'name': self.name,
            'groups': [g.simple() for g in self.groups()],
            'cards': [c.simple() for c in self.cards()]
        }

    def json(self):
        return json.dumps(self.simple())

    def groups(self):
        for filename in os.listdir(self.path):
            if filename.startswith('_'): continue
            path = os.path.join(self.path, filename)
            if os.path.isdir(path):
                yield CardGroup(path)

    def cards(self):
        for filename in os.listdir(self.path):
            if filename.startswith('_'): continue
            path = os.path.join(self.path, filename)
            if not os.path.isdir(path) and path.endswith('.html'):
                yield Card.objects.get_or_create(path=path)[0]

    @property
    def name(self):
        return os.path.basename(self.path)


