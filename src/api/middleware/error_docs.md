# Error Handling Documentation

This document provides a comprehensive reference for all error types used in the Blackjack API, including their meanings, when they occur, and how to handle them.

## Error Response Format

All error responses follow this consistent JSON structure:

```json
{
  "error": {
    "code": "error_code",
    "message": "Human-readable error message",
    "status_code": 400,
    "request_id": "unique-request-identifier",
    "timestamp": "2023-01-01T12:00:00Z",
    "details": {
      "field": "name_of_invalid_field",
      "value": "invalid_value",
      "expected": "description_of_expected_value"
    }
  }
}
```

## Standard Error Fields

| Field | Type | Description |
|-------|------|-------------|
| code | string | Machine-readable error code |
| message | string | Human-readable error message |
| status_code | integer | HTTP status code |
| request_id | string | Unique request identifier for correlation |
| timestamp | string | ISO 8601 timestamp of when the error occurred |
| details | object | Additional error-specific details |

## Error Types

### 4xx Client Errors

#### 400 Bad Request

| Code | Description | When It Occurs |
|------|-------------|----------------|
| `validation_error` | Request validation failed | When request data fails schema validation |
| `invalid_bet_limits` | Invalid betting limits provided | When min_bet > max_bet or values are invalid |

#### 401 Unauthorized

| Code | Description | When It Occurs |
|------|-------------|----------------|
| `authentication_required` | Authentication is required | When accessing protected routes without authentication |
| `invalid_credentials` | Invalid credentials provided | When login credentials are incorrect |

#### 403 Forbidden

| Code | Description | When It Occurs |
|------|-------------|----------------|
| `insufficient_permissions` | Insufficient permissions | When user lacks required permissions |

#### 404 Not Found

| Code | Description | When It Occurs |
|------|-------------|----------------|
| `resource_not_found` | Requested resource not found | When accessing non-existent resources |

#### 409 Conflict

| Code | Description | When It Occurs |
|------|-------------|----------------|
| `resource_exists` | Resource already exists | When creating a resource that already exists |

#### 422 Unprocessable Entity

| Code | Description | When It Occurs |
|------|-------------|----------------|
| `invalid_card` | Invalid card value provided | When an invalid card value is used |
| `invalid_deck_count` | Invalid number of decks | When deck count is outside allowed range |
| `invalid_counting_system` | Invalid counting system | When an unsupported counting system is specified |
| `invalid_penetration` | Invalid deck penetration | When penetration is outside 0-1 range |

### 5xx Server Errors

#### 500 Internal Server Error

| Code | Description | When It Occurs |
|------|-------------|----------------|
| `internal_server_error` | An unexpected error occurred | For unhandled exceptions |
| `service_unavailable` | Service temporarily unavailable | When dependent services are down |

## Best Practices for Error Handling

1. **Client-Side Handling**
   - Always check the `status_code` to determine the type of error
   - Use the `code` field to implement specific error handling logic
   - Display the `message` to users in a user-friendly manner
   - Include the `request_id` when reporting issues to support

2. **Server-Side Handling**
   - Use appropriate exception types for different error scenarios
   - Provide helpful error messages that explain what went wrong
   - Include relevant details in the `details` object for debugging
   - Log all errors with appropriate severity levels

## Example Error Handling

### Client-Side Example (JavaScript)

```javascript
async function makeRequest() {
  try {
    const response = await fetch('/api/endpoint', { method: 'POST', body: data });
    if (!response.ok) {
      const error = await response.json();
      
      // Handle specific error types
      switch (error.error.code) {
        case 'validation_error':
          showError(`Invalid input: ${error.error.message}`);
          break;
        case 'invalid_card':
          showError(`Invalid card: ${error.error.details.value}`);
          break;
        default:
          showError(`Error: ${error.error.message}`);
      }
      
      // Log the request ID for support
      console.error(`Request failed with ID: ${error.error.request_id}`);
      return;
    }
    
    // Process successful response
    const result = await response.json();
    // ...
  } catch (error) {
    console.error('Network error:', error);
    showError('Unable to connect to the server');
  }
}
```

### Server-Side Example (Python)

```python
from fastapi import FastAPI, HTTPException
from .middleware.error_handler import APIException, register_error_handlers

app = FastAPI()
register_error_handlers(app)

@app.get("/example")
async def example_endpoint():
    try:
        # Your code here
        if some_condition:
            raise APIException(
                status_code=400,
                error_code="invalid_operation",
                message="This operation is not allowed",
                details={"reason": "Operation violates business rules"}
            )
        return {"success": True}
    except SomeSpecificError as e:
        raise APIException(
            status_code=400,
            error_code="specific_error",
            message=str(e),
            details={"context": "Additional context here"}
        ) from e
```
