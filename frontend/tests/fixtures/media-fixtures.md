# Media Test Fixtures

This file contains information about the media test fixtures used in the test suite.

## Valid Media Files

### Video Files
- `test-video.mp4` - Standard MP4 video
- `test-video-1.mp4` - First sample MP4 for batch testing
- `test-video-2.mp4` - Second sample MP4 for batch testing
- `test-video-3.mp4` - Third sample MP4 for batch testing
- `test-video.webm` - WebM video format
- `test-video.avi` - AVI video format
- `test-video.mov` - MOV video format
- `test-video.wmv` - WMV video format
- `test-video.mkv` - MKV video format
- `test-video.flv` - FLV video format
- `test-video.mpeg` - MPEG video format
- `test-video.m4v` - M4V video format
- `long-video.mp4` - Long duration video for timeout testing
- `large-video.mp4` - Large video file over 100MB
- `high-res-video.mp4` - 4K resolution video
- `low-res-video.mp4` - Low resolution video

### Audio Files
- `test-audio.mp3` - Standard MP3 audio
- `test-audio-1.mp3` - First sample MP3 for batch testing
- `test-audio-2.mp3` - Second sample MP3 for batch testing
- `test-audio-3.mp3` - Third sample MP3 for batch testing
- `test-audio.wav` - WAV audio format
- `test-audio.flac` - FLAC audio format
- `test-audio.aac` - AAC audio format
- `test-audio.m4a` - M4A audio format
- `test-audio.ogg` - OGG audio format
- `test-audio.wma` - WMA audio format
- `test-audio.aiff` - AIFF audio format
- `test-audio.amr` - AMR audio format
- `long-audio.mp3` - Long duration audio for timeout testing
- `large-audio.wav` - Large audio file over 50MB
- `high-quality.flac` - High quality lossless audio
- `low-bitrate.mp3` - Low bitrate compressed audio

### Special Cases
- `test-video-subtitles.mp4` - MP4 with embedded subtitles
- `test-audio-tags.mp3` - MP3 with ID3 tags
- `test-video-chapters.mkv` - MKV with chapter markers
- `test-audio-playlist.m3u` - Playlist file
- `test-video-360.mp4` - 360-degree video
- `test-video-vr.mp4` - VR video format
- `test-audio-surround.wav` - Multi-channel surround sound
- `test-video-hdr.mp4` - HDR video content

## Corrupted Fixable Media

- `bad-video.mp4` - MP4 with minor corruption that can be repaired
- `bad-audio.mp3` - MP3 with recoverable errors
- `truncated-video.avi` - AVI that was cut off but partially playable
- `bad-header.mov` - MOV with minor header corruption
- `missing-frames.mp4` - MP4 with some missing frames
- `sync-error.wav` - WAV with audio/video sync issues
- `bitrate-fluctuation.mp3` - MP3 with varying bitrate

## Corrupted Unfixable Media

- `severely-corrupt.mp4` - MP4 with major corruption
- `encrypted.mp4` - MP4 with DRM protection
- `zero-byte.mp3` - MP3 with no data
- `bad-signature.avi` - AVI with invalid file signature
- `truncated-audio.wav` - WAV that was severely truncated
- `malformed-container.mkv` - MKV with broken container structure
- `incomplete-download.mp4` - Partially downloaded MP4 file

## Performance Test Files

- `cpu-intensive.mp4` - Video that requires high CPU to decode
- `memory-hog.wav` - Large uncompressed audio file
- `high-frame-rate.mp4` - Video with 120fps
- `high-bitrate.mkv` - High bitrate video for quality testing
- `multi-track.mov` - Video with multiple audio tracks
- `variable-bitrate.mp3` - VBR encoded audio file
- `complex-codec.webm` - Video with complex codec features
- `legacy-format.avi` - Old AVI format for compatibility testing
