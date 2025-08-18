# Document Test Fixtures

This file contains information about the document test fixtures used in the test suite.

## Valid Documents

### PDF Documents
- `test-document.pdf` - Standard PDF with text and images
- `test-document-1.pdf` - First sample PDF for batch testing
- `test-document-2.pdf` - Second sample PDF for batch testing
- `test-document-3.pdf` - Third sample PDF for batch testing
- `complex-document.pdf` - PDF with complex formatting, tables, and embedded objects
- `large-file.pdf` - PDF over 50MB for size limit testing
- `encrypted.pdf` - Password-protected PDF

### Word Documents
- `test-document.docx` - Standard DOCX with formatting
- `test-document.doc` - Legacy DOC format
- `test-table.docx` - DOCX with complex tables
- `test-graphics.docx` - DOCX with embedded images and charts

### Excel Spreadsheets
- `test-spreadsheet.xlsx` - Standard XLSX with multiple sheets
- `test-document.csv` - CSV file with sample data
- `test-document.tsv` - TSV file with sample data
- `test-data.xml` - XML data export from spreadsheet

### PowerPoint Presentations
- `test-presentation.pptx` - Standard PPTX with slides
- `test-presentation.ppt` - Legacy PPT format

### Text Documents
- `test-document.txt` - Plain text file with special characters
- `test-document.md` - Markdown document with formatting
- `test-document.rtf` - Rich Text Format document
- `test-document.odt` - OpenDocument Text format
- `test-data.json` - JSON data file

## Corrupted Fixable Documents

- `missing-eof.pdf` - PDF with missing end-of-file marker
- `malformed.html` - HTML with syntax errors that can be corrected
- `encoding-issue.txt` - TXT with encoding problems that can be fixed
- `bad-table.xlsx` - XLSX with minor table corruption
- `truncated.docx` - DOCX that was cut off but partially recoverable

## Corrupted Unfixable Documents

- `binary-corrupt.pdf` - PDF with severe binary corruption
- `encrypted.pdf` - PDF with unknown password
- `severely-truncated.docx` - DOCX with major data loss
- `bad-structure.xlsx` - XLSX with broken internal structure

## Special Cases

- `unicode-content.docx` - Document with extensive Unicode characters
- `empty-document.pdf` - PDF with no content
- `single-character.txt` - TXT with only one character
- `huge-table.xlsx` - XLSX with very large table for performance testing
- `nested-lists.docx` - DOCX with deeply nested list structures