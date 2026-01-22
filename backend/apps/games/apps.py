"""
Games app configuration
"""

from django.apps import AppConfig


class GamesConfig(AppConfig):
    """Configuration for games app"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.games'
    verbose_name = 'Educational Games'
