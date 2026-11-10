//! Compression presets, mirroring `src/lib/compression/presets.ts`.

use crate::engine::CompressionMode;

/// Image encoding parameters for a given compression mode.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct ImagePreset {
    /// JPEG quality (`0..=100`).
    pub jpeg_quality: u8,
    /// WebP quality (`0..=100`).
    pub webp_quality: u8,
    /// AVIF quality (`0..=100`).
    pub avif_quality: u8,
    /// `oxipng` effort level (`0..=6`).
    pub oxipng_level: u8,
    /// Whether metadata should be stripped from the output.
    pub strip_metadata: bool,
}

/// Video codec selection for a given compression mode.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum VideoCodec {
    /// H.264 / AVC.
    H264,
    /// AV1.
    Av1,
    /// VP9.
    Vp9,
    /// Keep the source codec (transmux only).
    Same,
}

/// Video encoding parameters for a given compression mode.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct VideoPreset {
    /// Target bitrate as a fraction of the source (`0.0..=1.0`).
    pub bitrate_ratio: f32,
    /// Codec to encode with.
    pub codec: VideoCodec,
}

/// Returns the image preset associated with `mode`.
pub const fn image_preset(mode: CompressionMode) -> ImagePreset {
    match mode {
        CompressionMode::Lossless => ImagePreset {
            jpeg_quality: 100,
            webp_quality: 100,
            avif_quality: 100,
            oxipng_level: 4,
            strip_metadata: false,
        },
        CompressionMode::Balanced => ImagePreset {
            jpeg_quality: 82,
            webp_quality: 80,
            avif_quality: 65,
            oxipng_level: 2,
            strip_metadata: true,
        },
        CompressionMode::Custom => ImagePreset {
            jpeg_quality: 75,
            webp_quality: 75,
            avif_quality: 60,
            oxipng_level: 2,
            strip_metadata: true,
        },
    }
}

/// Returns the video preset associated with `mode`.
pub const fn video_preset(mode: CompressionMode) -> VideoPreset {
    match mode {
        CompressionMode::Lossless => VideoPreset {
            bitrate_ratio: 1.0,
            codec: VideoCodec::Same,
        },
        CompressionMode::Balanced => VideoPreset {
            bitrate_ratio: 0.55,
            codec: VideoCodec::H264,
        },
        CompressionMode::Custom => VideoPreset {
            bitrate_ratio: 0.5,
            codec: VideoCodec::H264,
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn lossless_image_preset_is_max_quality() {
        let p = image_preset(CompressionMode::Lossless);
        assert_eq!(p.jpeg_quality, 100);
        assert_eq!(p.webp_quality, 100);
        assert_eq!(p.avif_quality, 100);
        assert_eq!(p.oxipng_level, 4);
        assert!(!p.strip_metadata);
    }

    #[test]
    fn balanced_image_preset_matches_web_values() {
        let p = image_preset(CompressionMode::Balanced);
        assert_eq!(p.jpeg_quality, 82);
        assert_eq!(p.webp_quality, 80);
        assert_eq!(p.avif_quality, 65);
        assert_eq!(p.oxipng_level, 2);
        assert!(p.strip_metadata);
    }

    #[test]
    fn lossless_video_keeps_codec_and_bitrate() {
        let p = video_preset(CompressionMode::Lossless);
        assert_eq!(p.bitrate_ratio, 1.0);
        assert_eq!(p.codec, VideoCodec::Same);
    }

    #[test]
    fn balanced_video_targets_h264() {
        let p = video_preset(CompressionMode::Balanced);
        assert_eq!(p.bitrate_ratio, 0.55);
        assert_eq!(p.codec, VideoCodec::H264);
    }
}
