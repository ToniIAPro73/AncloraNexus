# Archive Test Fixtures

This file contains information about the archive test fixtures used in the test suite.

## Valid Archives

- `test-archive.zip` - Standard ZIP archive with multiple files
- `test-archive.rar` - RAR archive with compression
- `test-archive.7z` - 7-Zip archive with high compression
- `test-archive.tar` - TAR archive without compression
- `test-archive.tar.gz` - TAR.GZ archive with gzip compression
- `test-folder/` - Directory structure for creating archives

## Corrupted Fixable Archives

- `bad-zip.zip` - ZIP with minor corruption that can be repaired
- `bad-rar.rar` - RAR with recoverable errors
- `bad-7z.7z` - 7Z with minor data issues

## Corrupted Unfixable Archives

- `severely-corrupt.zip` - ZIP with major corruption
- `encrypted.rar` - RAR with password protection
- `truncated.tar` - TAR that was cut off during creation

## Large Archives

- `large-archive.zip` - ZIP over 100MB for size limit testing
- `multi-volume.7z.001` - First part of multi-volume 7Z
- `multi-volume.7z.002` - Second part of multi-volume 7Z

## Special Cases

- `unicode-filenames.zip` - Archive with non-ASCII filenames
- `empty-archive.tar` - Archive with no files
- `single-file.rar` - RAR with only one file
- `nested-folders.zip` - ZIP with deeply nested directory structure
