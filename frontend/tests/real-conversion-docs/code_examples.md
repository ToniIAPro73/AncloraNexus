# Documento con Código

## JavaScript
```javascript
function convertFile(input, output, options = {}) {
    try {
        const converter = new FileConverter(options);
        const result = converter.process(input, output);
        
        return {
            success: true,
            outputPath: result.path,
            metadata: result.metadata,
            processingTime: result.duration
        };
    } catch (error) {
        console.error('Conversion failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}
```

## Python
```python
class DocumentConverter:
    def __init__(self, config):
        self.config = config
        self.supported_formats = ['pdf', 'docx', 'txt', 'html']
    
    def convert(self, source_path, target_format):
        if not self.is_supported(target_format):
            raise ValueError(f"Format {target_format} not supported")
        
        with open(source_path, 'rb') as f:
            content = f.read()
        
        converted = self.process_content(content, target_format)
        return self.save_output(converted, target_format)
```

## SQL
```sql
SELECT 
    c.conversion_id,
    c.source_format,
    c.target_format,
    c.file_size,
    c.processing_time,
    u.username,
    u.subscription_tier
FROM conversions c
JOIN users u ON c.user_id = u.id
WHERE c.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    AND c.status = 'completed'
ORDER BY c.processing_time DESC
LIMIT 100;
```
