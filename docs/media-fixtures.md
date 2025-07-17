# Archivos de Prueba - Categoría Media (Audio/Video)

## 1. Archivos de Audio Válidos

### test-audio.mp3
```
ID3v2.4.0 Header
- Title: "Audio de Prueba Anclora"
- Artist: "Sistema de Testing"
- Album: "Suite de Pruebas v1.0"
- Year: 2024
- Genre: Speech
- Duration: 30 segundos
- Bitrate: 320 kbps
- Sample Rate: 44100 Hz
- Channels: Stereo
- Encoder: LAME 3.100

Contenido: Voz sintetizada diciendo "Prueba de audio para Anclora Metaform" con música de fondo
```

### test-audio.wav
```
RIFF Header
- ChunkID: "RIFF"
- ChunkSize: [tamaño total]
- Format: "WAVE"

fmt Subchunk
- AudioFormat: 1 (PCM)
- NumChannels: 2 (Stereo)
- SampleRate: 48000
- ByteRate: 192000
- BitsPerSample: 16

data Subchunk
- Contenido: 10 segundos de tono de prueba 1kHz + voz
- Sin compresión
```

### test-audio.flac
```
FLAC Header
- Magic: "fLaC"
- STREAMINFO metadata block:
  - Min block size: 4096
  - Max block size: 4096
  - Sample rate: 96000 Hz
  - Channels: 2
  - Bits per sample: 24
  - Total samples: 960000 (10 segundos)
  
VORBIS_COMMENT metadata:
- TITLE=Audio FLAC de Alta Calidad
- ARTIST=Anclora Test Suite
- DATE=2024
- COMMENT=Audio sin pérdida para pruebas

Audio: Música clásica de dominio público
```

### test-audio.aac
```
ADTS Header (Audio Data Transport Stream)
- MPEG Version: 4
- Profile: AAC LC
- Sampling Frequency: 44100 Hz
- Channel Configuration: Stereo
- Bitrate: Variable (VBR ~256 kbps)

Contenido: Narración con efectos de sonido
Duración: 20 segundos
```

### test-audio.ogg
```
Ogg Container
- Version: 0
- Header Type: Beginning of Stream

Vorbis Audio
- Version: 0
- Channels: 2
- Sample Rate: 44100 Hz
- Bitrate: ~192 kbps (VBR)
- 
Comments:
- ENCODER=Anclora Test Encoder
- TITLE=Ogg Vorbis Test File
- TRACKNUMBER=1

Contenido: Podcast de prueba con voz y música
```

### test-audio.m4a
```
MP4 Container
- ftyp: M4A 
- Compatible brands: isom, iso2, mp41

Audio Track:
- Codec: AAC-LC
- Sample Rate: 48000 Hz
- Channels: 2
- Bitrate: 256 kbps

Metadata (moov.udta.meta):
- Title: M4A Test Audio
- Artist: Anclora Testing
- Album: Test Suite
- Track: 1/1
- Year: 2024

Contenido: Efectos de sonido variados
```

### test-audio.wma
```
ASF (Advanced Systems Format) Container
- GUID: ASF Header Object
- File Properties:
  - File Size: ~2MB
  - Creation Date: 2024-01-15
  - Packets: [número de paquetes]

Audio Stream:
- Codec: Windows Media Audio 9
- Channels: 2
- Sample Rate: 44100 Hz
- Bitrate: 192 kbps
- VBR: No

Metadata:
- Title: WMA Test File
- Author: Anclora Metaform
- Copyright: Test Suite 2024
```

### test-audio-multichannel.ac3
```
AC-3 (Dolby Digital) Stream
- Sample Rate: 48000 Hz
- Bit Rate: 448 kbps
- Channels: 5.1 (L, R, C, LFE, Ls, Rs)
- Frame Size: 1792 bytes
- Dialog Normalization: -27 dB

Contenido: Audio surround de prueba con:
- Diálogo en canal central
- Música en L/R
- Efectos ambientales en Ls/Rs
- Bajos en LFE
```

## 2. Archivos de Video Válidos

### test-video.mp4
```
MP4 Container (ISOBMFF)
ftyp box: mp42 (compatible con isom, mp41)

moov box:
- mvhd: duration=60s, timescale=1000
- Video Track (trak):
  - Codec: H.264/AVC (High Profile)
  - Resolution: 1920x1080
  - Frame Rate: 30 fps
  - Bitrate: 5 Mbps
  - Keyframe Interval: 60
  
- Audio Track (trak):
  - Codec: AAC-LC
  - Channels: Stereo
  - Sample Rate: 48000 Hz
  - Bitrate: 192 kbps

Metadata:
- Title: MP4 Test Video
- Creation Time: 2024-01-15
- Encoder: Anclora Metaform Test

Contenido: Animación con logo de Anclora rotando
```

### test-video.avi
```
RIFF AVI Format
- RIFF Header: 'AVI '
- hdrl LIST:
  - avih (AVI Header):
    - MicroSecPerFrame: 33333 (30 fps)
    - MaxBytesPerSec: 1000000
    - TotalFrames: 900 (30 segundos)
    - Streams: 2
    - Width: 1280
    - Height: 720

- Video Stream Header:
  - fccType: 'vids'
  - fccHandler: 'XVID' (Xvid MPEG-4)
  - Rate: 30 fps
  - Scale: 1
  
- Audio Stream Header:
  - fccType: 'auds'
  - Format: MP3
  - Channels: 2
  - SamplesPerSec: 44100
  - BytesPerSec: 16000 (128 kbps)

Contenido: Screencast de demostración
```

### test-video.mov
```
QuickTime File Format
- ftyp: qt   (QuickTime movie)
- Wide atom for compatibility

Movie atom (moov):
- Movie Header (mvhd):
  - Timescale: 600
  - Duration: 24000 (40 segundos)
  - Preferred Rate: 1.0
  
- Video Track:
  - Codec: ProRes 422
  - Dimensions: 1920x1080
  - Frame Rate: 24 fps
  - Color Space: Rec. 709
  - Bit Depth: 10-bit
  
- Audio Track:
  - Codec: PCM
  - Sample Rate: 48000 Hz
  - Bit Depth: 24-bit
  - Channels: 2

Metadata:
- ©nam: MOV Test Video
- ©ART: Anclora Test
- ©day: 2024

Contenido: Video de alta calidad con gradientes de color
```

### test-video.wmv
```
ASF Container
- Header Object GUID
- File Properties:
  - File Size: ~10MB
  - Play Duration: 45 seconds
  - Preroll: 3000ms

- Video Stream Properties:
  - Codec: Windows Media Video 9
  - Width: 1280
  - Height: 720
  - Frame Rate: 25 fps
  - Bitrate: 2 Mbps
  - Quality: 90

- Audio Stream Properties:
  - Codec: Windows Media Audio 9
  - Channels: 2
  - Sample Rate: 44100 Hz
  - Bitrate: 128 kbps

Content Description:
- Title: WMV Test Video
- Author: Anclora Testing
- Copyright: 2024

Contenido: Presentación con transiciones
```

### test-video.mkv
```
Matroska Container
EBML Header:
- Version: 1
- DocType: matroska
- DocTypeVersion: 4

Segment:
- SegmentInfo:
  - TimecodeScale: 1000000
  - Duration: 50000.0ms
  - MuxingApp: Anclora Test Muxer
  - WritingApp: Metaform v1.0
  - Title: MKV Test Video

- Tracks:
  Track 1 (Video):
  - CodecID: V_VP9
  - PixelWidth: 1920
  - PixelHeight: 1080
  - FrameRate: 30 fps
  - DisplayWidth: 1920
  - DisplayHeight: 1080
  
  Track 2 (Audio):
  - CodecID: A_OPUS
  - Channels: 2
  - SamplingFrequency: 48000
  - BitDepth: 16
  
  Track 3 (Subtitles):
  - CodecID: S_TEXT/UTF8
  - Language: spa

Contenido: Video con múltiples pistas de audio y subtítulos
```

### test-video.webm
```
WebM Container (Matroska subset)
EBML Header:
- DocType: webm
- DocTypeVersion: 4

Segment:
- Video Track:
  - CodecID: V_VP8
  - PixelWidth: 1280
  - PixelHeight: 720
  - FrameRate: 30 fps
  
- Audio Track:
  - CodecID: A_VORBIS
  - Channels: 2
  - SamplingFrequency: 44100
  
- WebM-specific:
  - Cues for seeking
  - Optimized for streaming

Contenido: Video optimizado para web
Duración: 35 segundos
```

### test-video.flv
```
FLV Header:
- Signature: "FLV"
- Version: 1
- Flags: Has Video + Has Audio
- DataOffset: 9

Metadata (onMetaData):
- duration: 25.0
- width: 854
- height: 480
- videodatarate: 1000
- framerate: 30
- videocodecid: 7 (H.264)
- audiodatarate: 128
- audiosamplerate: 44100
- audiocodecid: 10 (AAC)
- encoder: Anclora Test Encoder

Video Tags: H.264 AVC
Audio Tags: AAC

Contenido: Video para streaming
```

### test-video-hdr.mp4
```
MP4 con HDR
- Video Track:
  - Codec: H.265/HEVC (Main 10 Profile)
  - Resolution: 3840x2160 (4K)
  - Frame Rate: 60 fps
  - Bit Depth: 10-bit
  - Color Space: Rec. 2020
  - HDR Format: HDR10
  - Max Luminance: 1000 nits
  - Color Primaries: BT.2020
  - Transfer Function: SMPTE ST 2084 (PQ)

- Audio Track:
  - Codec: AAC-LC
  - Channels: 5.1
  - Sample Rate: 48000 Hz

Metadata HDR:
- MaxCLL: 1000
- MaxFALL: 400
- MasteringDisplay: G(13250,34500)B(7500,3000)R(34000,16000)WP(15635,16450)L(10000000,1)

Contenido: Demo HDR con colores vibrantes
```

## 3. Archivos Media Corrompidos pero Subsanables

### corrupted-fixable-audio-header.mp3
```
ID3v2 corrupto pero recuperable
- Tag parcialmente dañado
- Frame headers MP3 intactos
- Audio data: OK
- Puede reproducirse ignorando ID3

Reparación: Reconstruir header ID3 o eliminar
```

### corrupted-fixable-video-index.mp4
```
MP4 con moov box dañado
- ftyp: OK
- mdat: OK (datos de video intactos)
- moov: Parcialmente corrupto
  - Índices de frames dañados
  - Metadata corrupta

Reparación: Reconstruir índices escaneando mdat
```

### corrupted-fixable-audio-truncated.wav
```
WAV truncado
- RIFF header: OK
- fmt chunk: OK
- data chunk size: Incorrecto
- Datos de audio: Presentes pero no todos

Reparación: Ajustar tamaño en header al tamaño real
```

### corrupted-fixable-video-codec.avi
```
AVI con codec info corrupta
- Headers principales: OK
- Stream headers: Codec ID corrupto
- Datos de video: H.264 válido
- Índices: OK

Reparación: Detectar codec analizando stream
```

## 4. Archivos Media Corrompidos Insubsanables

### corrupted-unfixable-encrypted-video.mp4
```
[Archivo MP4 completamente encriptado]
ENCRYPTED_WITH_AES256
NO_HEADER_INFORMATION
CANNOT_PARSE_ATOMS
REQUIRES_DECRYPTION_KEY
```

### corrupted-unfixable-severe-corruption.avi
```
[Mezcla de datos binarios aleatorios]
RIFF????INVALID
[Datos corruptos sin estructura]
NO_VALID_CHUNKS
UNRECOVERABLE_FILE
```

### corrupted-unfixable-mixed-format.mov
```
[Archivo con múltiples formatos mezclados]
Comienza como MOV, luego AVI, luego MP4
Estructura completamente inconsistente
Headers contradictorios
Imposible determinar formato real
```

## 5. Archivos Especiales para Pruebas

### test-video-multitrack.mkv
```
MKV con múltiples pistas:
- Video: 1 pista principal
- Audio: 3 idiomas (español, inglés, francés)
- Subtítulos: 5 idiomas
- Chapters: 10 capítulos definidos
- Attachments: Fuentes para subtítulos

Para probar extracción/selección de pistas
```

### test-audio-multiformat.mka
```
Matroska Audio Container:
- Track 1: FLAC (estéreo)
- Track 2: AC3 5.1
- Track 3: DTS 7.1
- Track 4: AAC estéreo (comentarios)

Para probar conversión de audio multicanal
```

### test-video-vfr.mp4
```
MP4 con frame rate variable (VFR):
- Secciones a 24 fps (cinematográfico)
- Secciones a 30 fps (video normal)
- Secciones a 60 fps (acción)
- Timestamps variables

Para probar manejo de VFR
```

### test-video-3d.mp4
```
MP4 con video 3D estereoscópico:
- Formato: Side-by-side (SBS)
- Resolución por ojo: 1920x1080
- Metadata 3D en SEI
- Audio: 5.1 surround

Para probar conversiones 3D a 2D
```