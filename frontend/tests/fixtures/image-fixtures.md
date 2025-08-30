# Image Test Fixtures

This file contains information about the image test fixtures used in the test suite.

## Valid Images

### JPEG Images
- `test-image.jpg` - Standard JPEG photo
- `test-image-1.jpg` - First sample JPEG for batch testing
- `test-image-2.jpg` - Second sample JPEG for batch testing
- `test-image-3.jpg` - Third sample JPEG for batch testing
- `test-image-cmyk.jpg` - JPEG in CMYK color space
- `test-image-metadata.jpg` - JPEG with EXIF metadata
- `test-image-large.jpg` - High-resolution JPEG over 10MB
- `product-1.jpg` - Product photo for web optimization
- `product-2.jpg` - Product photo for web optimization
- `product-3.jpg` - Product photo for web optimization

### PNG Images
- `test-image.png` - Standard PNG with transparency
- `test-image-alpha.png` - PNG with alpha channel transparency
- `test-image-noalpha.png` - PNG without transparency
- `test-image-8bit.png` - PNG with 8-bit color depth
- `test-image-24bit.png` - PNG with 24-bit color depth
- `test-image-interlaced.png` - Interlaced PNG
- `oversized.png` - PNG that exceeds dimension limits

### WebP Images
- `test-image.webp` - Standard WebP image
- `test-animated.webp` - Animated WebP image
- `test-lossless.webp` - Lossless WebP image
- `test-lossy.webp` - Lossy WebP image

### GIF Images
- `test-image.gif` - Standard GIF image
- `test-animated.gif` - Animated GIF image
- `test-transparent.gif` - GIF with transparency
- `test-interlaced.gif` - Interlaced GIF

### TIFF Images
- `test-image.tiff` - Standard TIFF image
- `test-multipage.tiff` - Multi-page TIFF document
- `test-compressed.tiff` - TIFF with compression
- `test-lzw.tiff` - TIFF with LZW compression
- `large-image.tiff` - Large TIFF for memory testing

### BMP Images
- `test-image.bmp` - Standard BMP image
- `test-16bit.bmp` - BMP with 16-bit color depth
- `test-24bit.bmp` - BMP with 24-bit color depth

### SVG Images
- `test-image.svg` - Standard SVG vector image
- `test-complex.svg` - Complex SVG with gradients and effects
- `test-animated.svg` - SVG with SMIL animations

### Special Format Images
- `test-image.cr2` - Canon RAW image
- `test-image.nef` - Nikon RAW image
- `test-image.psd` - Photoshop PSD with layers
- `test-image-layers.psd` - PSD with multiple layers
- `test-image.heic` - HEIC image from iOS
- `test-image.ico` - ICO icon file
- `test-image.wmf` - Windows Metafile
- `test-image.emf` - Enhanced Metafile

## Corrupted Fixable Images

- `truncated.jpg` - JPEG that was cut off but can be partially recovered
- `bad-crc.png` - PNG with CRC errors that can be ignored
- `bad-profile.jpg` - JPEG with corrupt color profile
- `missing-eof.gif` - GIF with missing end-of-file marker
- `bad-header.tiff` - TIFF with minor header corruption
- `slightly-corrupt.webp` - WebP with minor data corruption

## Corrupted Unfixable Images

- `severe-corruption.jpg` - JPEG with severe data corruption
- `encrypted.jpg` - JPEG with encryption
- `zero-byte.png` - PNG with no data
- `bad-signature.gif` - GIF with invalid file signature
- `truncated.tiff` - TIFF that was severely truncated
- `malformed.svg` - SVG with syntax errors that cannot be parsed

## Special Cases

- `grayscale.jpg` - JPEG in grayscale color space
- `indexed.png` - PNG with indexed color palette
- `1bit.png` - PNG with 1-bit color depth
- `huge-dimensions.jpg` - JPEG with dimensions exceeding limits
- `animated-loop.gif` - GIF with custom loop count
- `custom-profile.icc` - ICC color profile for testing
- `watermark.png` - PNG used as watermark overlay
- `test-pattern.png` - Test pattern for quality assessment
