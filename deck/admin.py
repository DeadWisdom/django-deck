from django.contrib import admin
from models import Card


class CardAdmin(admin.ModelAdmin):
    list_display = ['name']


admin.site.register(Card, CardAdmin)
