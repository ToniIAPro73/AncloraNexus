"""
Markdown Reporter for test results
"""
from datetime import datetime
from pathlib import Path

class MarkdownReporter:
    """Generate markdown reports from test results"""
    
    def __init__(self, output_dir="reports"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def generate_report(self, results, filename=None):
        """Generate a markdown report from test results"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"test_report_{timestamp}.md"
        
        report_path = self.output_dir / filename
        
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write("# Anclora Nexus Testing Report\n\n")
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            
            if isinstance(results, dict):
                f.write("## Test Results Summary\n\n")
                for key, value in results.items():
                    f.write(f"- **{key}**: {value}\n")
            else:
                f.write("## Test Results\n\n")
                f.write(str(results))
        
        return report_path
