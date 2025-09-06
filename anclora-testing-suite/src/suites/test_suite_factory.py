"""
Test Suite Factory - Creates test suites based on configuration
"""
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class TestSuiteFactory:
    """Factory for creating test suites"""
    
    def __init__(self):
        self.available_suites = {
            'documents': 'Document conversion tests',
            'images': 'Image conversion tests', 
            'audio': 'Audio conversion tests',
            'video': 'Video conversion tests',
            'archives': 'Archive conversion tests',
            'sequences': 'Sequence conversion tests',
            'integration': 'Integration tests'
        }
    
    def create_suite(self, suite_name: str, config: Dict[str, Any] = None) -> Dict[str, Any]:
        """Create a test suite by name"""
        if suite_name not in self.available_suites:
            raise ValueError(f"Unknown suite: {suite_name}")
        
        logger.info(f"Creating test suite: {suite_name}")
        
        return {
            'name': suite_name,
            'description': self.available_suites[suite_name],
            'config': config or {},
            'tests': []
        }
    
    def get_available_suites(self) -> List[str]:
        """Get list of available test suites"""
        return list(self.available_suites.keys())
