import urllib
import ttag
import yaml
from django import template


### Tags ###
class MockTag(ttag.Tag):
    """
    Creates a mock object and puts it into the context.  The object is specified with YAML.

    Usage:
        {% mock "name" %}
            property_1: value
            property_2: value
        {% endmock %}

    Example:
        {% mock "flatpage" %}
            title: Title of the Page
            url: /about/page/
            content: |
                This is the content for the page.
                This content will continue until
                this line.
        {% endmock %}

    And then one can use it as an object:

        <h1>{{ flatpage.title }}</h1>
        <p>{{ flatpage.content|linebreaksbr }}</p>
    """
    name = ttag.Arg(required=True)  # Name of the object.

    class Meta():
        name = "mock"
        block = True
        end_block = 'endmock'

    def render(self, context):
        data = self.resolve(context)
        name = data['name']
        source = self.nodelist.render(context)
        obj = yaml.load(source)
        context[name] = obj
        return ""


### Register ###
register = template.Library()
register.tag(MockTag)