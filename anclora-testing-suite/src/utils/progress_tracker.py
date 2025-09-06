"""
Progress Tracker for test execution
"""
import time
from typing import Dict, Any, Optional

class ProgressTracker:
    """Track progress of test execution"""
    
    def __init__(self):
        self.start_time = None
        self.current_test = None
        self.total_tests = 0
        self.completed_tests = 0
        self.failed_tests = 0
        self.results = []
    
    def start(self, total_tests: int):
        """Start tracking progress"""
        self.start_time = time.time()
        self.total_tests = total_tests
        self.completed_tests = 0
        self.failed_tests = 0
        self.results = []
    
    def update(self, test_name: str, status: str = "running"):
        """Update current test status"""
        self.current_test = {
            'name': test_name,
            'status': status,
            'timestamp': time.time()
        }
    
    def complete_test(self, test_name: str, success: bool, result: Dict[str, Any] = None):
        """Mark a test as completed"""
        self.completed_tests += 1
        if not success:
            self.failed_tests += 1
        
        self.results.append({
            'name': test_name,
            'success': success,
            'result': result or {},
            'timestamp': time.time()
        })
    
    def get_progress(self) -> Dict[str, Any]:
        """Get current progress information"""
        elapsed_time = time.time() - self.start_time if self.start_time else 0
        
        return {
            'total_tests': self.total_tests,
            'completed_tests': self.completed_tests,
            'failed_tests': self.failed_tests,
            'success_rate': (self.completed_tests - self.failed_tests) / max(self.completed_tests, 1),
            'elapsed_time': elapsed_time,
            'current_test': self.current_test,
            'estimated_remaining': self._estimate_remaining_time()
        }
    
    def _estimate_remaining_time(self) -> Optional[float]:
        """Estimate remaining time based on current progress"""
        if not self.start_time or self.completed_tests == 0:
            return None
        
        elapsed = time.time() - self.start_time
        avg_time_per_test = elapsed / self.completed_tests
        remaining_tests = self.total_tests - self.completed_tests
        
        return avg_time_per_test * remaining_tests
