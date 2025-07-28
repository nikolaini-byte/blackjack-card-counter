"""
Tests for the validation utilities.

These tests ensure that our validation utilities work as expected and provide
helpful error messages.
"""
import pytest
import pytest_asyncio
from pydantic import BaseModel
from fastapi import status

from src.api.middleware.error_handler import APIException
from src.api.utils.validators import (
    validate_with_schema,
    validate_range,
    validate_enum,
    ValidationResult,
)


# Test models for schema validation - using _ prefix to avoid Pytest collection
class _UserSchema(BaseModel):
    """Test schema for user validation."""

    username: str
    email: str
    age: int
    role: str = "user"


# Create a test schema instance for use in tests
TestUserSchema = _UserSchema


# Test functions for validation decorator
@validate_with_schema(TestUserSchema)
async def create_user(data: dict):
    """Test function for schema validation."""
    return {"status": "success", "data": data}


class TestValidateWithSchema:
    """Tests for the validate_with_schema decorator."""

    @pytest.mark.asyncio
    async def test_valid_data(self):
        """Test that valid data passes validation."""
        data = {
            "username": "testuser",
            "email": "test@example.com",
            "age": 25,
            "role": "admin",
        }
        result = await create_user(data)
        assert result["status"] == "success"
        assert result["data"].username == "testuser"
        assert result["data"].email == "test@example.com"
        assert result["data"].age == 25
        assert result["data"].role == "admin"

    @pytest.mark.asyncio
    async def test_missing_required_field(self):
        """Test that missing required fields are caught."""
        data = {
            "username": "testuser",
            # Missing email and age
        }
        with pytest.raises(APIException) as exc_info:
            await create_user(data)

        assert exc_info.value.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert "validation_error" in str(exc_info.value.error_code)
        assert "email" in str(exc_info.value.details)
        assert "age" in str(exc_info.value.details)

    @pytest.mark.asyncio
    async def test_invalid_type(self):
        """Test that type validation works."""
        data = {
            "username": "testuser",
            "email": "not-an-email",  # Invalid email format
            "age": "not-a-number",  # Invalid age type
        }
        with pytest.raises(APIException) as exc_info:
            await create_user(data)

        assert exc_info.value.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert "validation_error" in str(exc_info.value.error_code)


class TestValidateRange:
    """Tests for the validate_range function."""

    def test_valid_range(self):
        """Test that values within range pass validation."""
        assert validate_range(5, 0, 10) == 5.0
        assert validate_range(0, 0, 10) == 0.0  # Min boundary
        assert validate_range(10, 0, 10) == 10.0  # Max boundary

    def test_out_of_range(self):
        """Test that values outside range raise an exception."""
        with pytest.raises(APIException) as exc_info:
            validate_range(-1, 0, 10)
        assert exc_info.value.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert "value_too_small" in str(exc_info.value.error_code)

        with pytest.raises(APIException) as exc_info:
            validate_range(11, 0, 10)
        assert exc_info.value.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert "value_too_large" in str(exc_info.value.error_code)

    def test_invalid_type(self):
        """Test that non-numeric values are caught."""
        with pytest.raises(APIException) as exc_info:
            validate_range("not-a-number", 0, 10)
        assert exc_info.value.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert "invalid_type" in str(exc_info.value.error_code)


class TestValidateEnum:
    """Tests for the validate_enum function."""

    def test_valid_enum_value(self):
        """Test that valid enum values pass validation."""
        valid_roles = ["admin", "user", "guest"]
        assert validate_enum("admin", valid_roles, "role") == "admin"
        assert validate_enum("user", valid_roles, "role") == "user"
        assert validate_enum("guest", valid_roles, "role") == "guest"

    def test_case_sensitive(self):
        """Test case sensitivity handling."""
        valid_roles = ["Admin", "User", "Guest"]

        # Case-sensitive (default)
        assert validate_enum("Admin", valid_roles, "role") == "Admin"
        with pytest.raises(APIException):
            validate_enum("admin", valid_roles, "role")

        # Case-insensitive
        assert (
            validate_enum("admin", valid_roles, "role", case_sensitive=False) == "Admin"
        )

    def test_invalid_enum_value(self):
        """Test that invalid enum values raise an exception."""
        valid_roles = ["admin", "user", "guest"]
        with pytest.raises(APIException) as exc_info:
            validate_enum("superuser", valid_roles, "role")

        assert exc_info.value.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert "invalid_enum_value" in str(exc_info.value.error_code)
        assert "superuser" in str(exc_info.value.details)
        assert "admin" in str(exc_info.value.details)  # Should list valid values


class TestValidationResult:
    """Tests for the ValidationResult class."""

    def test_initial_state(self):
        """Test the initial state of a new ValidationResult."""
        result = ValidationResult()
        assert result.is_valid is True
        assert result.errors == []

    def test_add_error(self):
        """Test adding errors to a ValidationResult."""
        result = ValidationResult()
        result.add_error("username", "Username is required", "required")

        assert result.is_valid is False
        assert len(result.errors) == 1
        assert result.errors[0]["field"] == "username"
        assert result.errors[0]["message"] == "Username is required"
        assert result.errors[0]["code"] == "required"

    def test_raise_if_invalid_valid(self):
        """Test that raise_if_invalid doesn't raise when valid."""
        result = ValidationResult(is_valid=True)
        result.raise_if_invalid()  # Should not raise

    def test_raise_if_invalid_invalid(self):
        """Test that raise_if_invalid raises when invalid."""
        result = ValidationResult(is_valid=False)
        result.add_error("field", "Error message", "error_code")

        with pytest.raises(APIException) as exc_info:
            result.raise_if_invalid()

        assert exc_info.value.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert "validation_error" in str(exc_info.value.error_code)
        assert "errors" in str(exc_info.value.details)
