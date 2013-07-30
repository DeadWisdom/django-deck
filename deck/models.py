import os
from django.db import models
from django.conf import settings
from django.core.urlresolvers import reverse


def relative_path(path):
	DECK_PATH = os.path.abspath( getattr(settings, 'DECK_PATH', 'decks') )
	return path[len(DECK_PATH)+1:]


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

	def groups(self):
		for filename in os.listdir(self.path):
			path = os.path.join(self.path, filename)
			if os.path.isdir(path):
				yield CardGroup(path)

	def cards(self):
		print self.path
		for filename in os.listdir(self.path):
			path = os.path.join(self.path, filename)
			if not os.path.isdir(path) and path.endswith('.html'):
				yield Card.objects.get_or_create(path=path)[0]

	@property
	def name(self):
		return os.path.basename(self.path)


