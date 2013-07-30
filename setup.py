"""
Django Deck setup.
"""

from setuptools import setup, find_packages

setup( name='django-deck',
       version='0.1',
       description='Deck is a unit-testing for tool for graphic elements.',
       author='Brantley Harris',
       author_email='brantley.harris@gmail.com',
       packages = find_packages(),
       include_package_data = True,
       zip_safe = False,
       install_requires = []
      )
