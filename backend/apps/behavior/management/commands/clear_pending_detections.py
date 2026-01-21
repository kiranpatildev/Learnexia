"""
Management command to clear all pending behavior detections
"""

from django.core.management.base import BaseCommand
from apps.behavior.models import PendingBehaviorDetection


class Command(BaseCommand):
    help = 'Clear all pending behavior detections from the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirm deletion without prompting',
        )

    def handle(self, *args, **options):
        count = PendingBehaviorDetection.objects.count()
        
        if count == 0:
            self.stdout.write(self.style.SUCCESS('No pending detections to clear.'))
            return

        if not options['confirm']:
            confirm = input(f'Are you sure you want to delete {count} pending detection(s)? (yes/no): ')
            if confirm.lower() != 'yes':
                self.stdout.write(self.style.WARNING('Operation cancelled.'))
                return

        PendingBehaviorDetection.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f'Successfully deleted {count} pending detection(s).'))
