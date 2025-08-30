# Unit Tests

This directory contains unit tests for the backend components.

## Test Structure

- `test_conversion_classifier.py`: Tests for file validation and classification
- `test_conversion_engine.py`: Tests for the conversion engine functionality
- `test_conversion_models.py`: Tests for database models
- `test_encoding_normalizer.py`: Tests for encoding normalization
- `test_user_model.py`: Tests for user model functionality

## Running Tests

To run unit tests:

```bash
cd backend
python -m pytest tests/unit -v
```

## Test Coverage

The unit tests provide comprehensive coverage of the backend components, ensuring that all critical functionality is properly tested.

## Adding New Tests

When adding new tests, follow these guidelines:

1. Create a new test file with a descriptive name
2. Use the pytest framework for writing tests
3. Follow the existing naming conventions
4. Include docstrings for test functions
5. Use fixtures for common setup code
