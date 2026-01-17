"""
Custom exception handler for DRF
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError as DjangoValidationError


def custom_exception_handler(exc, context):
    """
    Custom exception handler that provides consistent error responses
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # Handle Django validation errors
    if isinstance(exc, DjangoValidationError):
        return Response(
            {
                'error': 'Validation Error',
                'details': exc.messages if hasattr(exc, 'messages') else str(exc)
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # If response is None, it's an unhandled exception
    if response is None:
        return Response(
            {
                'error': 'Internal Server Error',
                'details': str(exc)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    # Customize the response format
    if hasattr(response, 'data'):
        custom_response_data = {
            'error': response.data.get('detail', 'An error occurred'),
            'status_code': response.status_code
        }
        
        # Add field-specific errors if present
        if isinstance(response.data, dict):
            field_errors = {k: v for k, v in response.data.items() if k != 'detail'}
            if field_errors:
                custom_response_data['field_errors'] = field_errors
        
        response.data = custom_response_data
    
    return response
