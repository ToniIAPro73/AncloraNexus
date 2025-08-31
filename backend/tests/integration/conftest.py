import pytest
import sys
import os
from pathlib import Path

# Add backend src to Python path
backend_src = Path(__file__).parent.parent / 'src'
sys.path.insert(0, str(backend_src))

# Add parent directory to Python path for imports
parent_dir = Path(__file__).parent.parent
sys.path.insert(0, str(parent_dir))

from src.models.user import db, User
from src.models.conversion import Conversion, CreditTransaction
from src.encoding_normalizer import normalize_to_utf8
import tempfile
import shutil


@pytest.fixture
def app():
    """Create application for testing."""
    from src import create_app
    app = create_app({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'JWT_SECRET_KEY': 'test-secret',
    })

    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()


@pytest.fixture
def runner(app):
    """A test runner for the app's CLI commands."""
    return app.test_cli_runner()


@pytest.fixture
def auth_headers(client):
    """Headers with valid auth token."""
    # Create a test user
    register_data = {
        'email': 'integration@example.com',
        'password': 'Password1',
        'full_name': 'Integration Test'
    }
    resp = client.post('/api/auth/register', json=register_data)
    token = resp.get_json()['access_token']
    return {'Authorization': f'Bearer {token}'}


@pytest.fixture
def user_data():
    """Test user data."""
    return {
        'email': 'test@example.com',
        'full_name': 'Test User'
    }
