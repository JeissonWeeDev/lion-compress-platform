//! Pure compression math, mirroring `src/lib/compression/engine.ts`.
//!
//! Every function here is deterministic and side-effect free, which makes the
//! module trivial to fuzz, benchmark, or port to another runtime.

use crate::presets::{image_preset, VideoPreset};

/// Supported compression modes.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CompressionMode {
    /// Preserve quality; optimize bytes only where lossless.
    Lossless,
    /// Balanced quality/size trade-off (recommended default).
    Balanced,
    /// Use the user-provided quality slider.
    Custom,
}

/// Requested output format.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum OutputFormat {
    /// Keep the source format.
    Same,
    /// Encode as WebP.
    Webp,
    /// Encode as AVIF.
    Avif,
    /// Encode as JPEG.
    Jpeg,
    /// Encode as PNG.
    Png,
}

/// Resolved MIME type and file extension for an output format.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct OutputSpec {
    /// MIME type to hand to the encoder.
    pub mime: &'static str,
    /// File extension (without the dot).
    pub ext: &'static str,
}

/// Resolves the output MIME type and extension.
///
/// When `output` is [`OutputFormat::Same`], the format is derived from
/// `source_mime`. Unknown source types fall back to JPEG, matching the web
/// client.
pub fn resolve_output_mime(output: OutputFormat, source_mime: &str) -> OutputSpec {
    match output {
        OutputFormat::Webp => OutputSpec {
            mime: "image/webp",
            ext: "webp",
        },
        OutputFormat::Avif => OutputSpec {
            mime: "image/avif",
            ext: "avif",
        },
        OutputFormat::Jpeg => OutputSpec {
            mime: "image/jpeg",
            ext: "jpeg",
        },
        OutputFormat::Png => OutputSpec {
            mime: "image/png",
            ext: "png",
        },
        OutputFormat::Same => match source_mime {
            "image/jpeg" | "image/jpg" => OutputSpec {
                mime: "image/jpeg",
                ext: "jpeg",
            },
            "image/png" => OutputSpec {
                mime: "image/png",
                ext: "png",
            },
            "image/webp" => OutputSpec {
                mime: "image/webp",
                ext: "webp",
            },
            "image/avif" => OutputSpec {
                mime: "image/avif",
                ext: "avif",
            },
            _ => OutputSpec {
                mime: "image/jpeg",
                ext: "jpeg",
            },
        },
    }
}

/// Resolves encoder quality as a `0.0..=1.0` float.
///
/// PNG is always lossless and returns `1.0` regardless of mode. In
/// [`CompressionMode::Custom`] the slider value is used directly; otherwise the
/// preset for `mime` is selected.
pub fn resolve_quality(mode: CompressionMode, quality: u8, mime: &str) -> f32 {
    if mode == CompressionMode::Custom {
        return f32::from(quality) / 100.0;
    }

    let preset = image_preset(mode);
    if mime.contains("webp") {
        f32::from(preset.webp_quality) / 100.0
    } else if mime.contains("avif") {
        f32::from(preset.avif_quality) / 100.0
    } else if mime.contains("jpeg") {
        f32::from(preset.jpeg_quality) / 100.0
    } else {
        1.0
    }
}

/// Maps a mode/quality combination to an `oxipng` effort level (`1..=6`).
///
/// `oxipng` is always lossless: the level only trades CPU time for smaller
/// files.
pub fn resolve_png_level(mode: CompressionMode, quality: u8) -> u8 {
    match mode {
        CompressionMode::Lossless => 4,
        CompressionMode::Balanced => 2,
        CompressionMode::Custom => {
            let level = ((f32::from(quality) / 100.0) * 6.0).round() as i32;
            level.clamp(1, 6) as u8
        }
    }
}

/// Returns the byte savings as a percentage (`0.0..=100.0`).
///
/// Never returns a negative number: if the compressed file is not smaller, the
/// result is `0.0`. A zero original size is treated as no savings.
pub fn calc_savings(original_size: u64, compressed_size: u64) -> f64 {
    if original_size == 0 {
        return 0.0;
    }
    let saved = original_size.saturating_sub(compressed_size);
    (saved as f64 / original_size as f64) * 100.0
}

/// Resolves the video preset associated with `mode`.
///
/// Kept here as a thin re-export so callers can reason about both media types
/// from the same module.
pub fn resolve_video_preset(mode: CompressionMode) -> VideoPreset {
    crate::presets::video_preset(mode)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn same_preserves_jpeg() {
        let s = resolve_output_mime(OutputFormat::Same, "image/jpeg");
        assert_eq!((s.mime, s.ext), ("image/jpeg", "jpeg"));
    }

    #[test]
    fn same_maps_jpg_alias() {
        let s = resolve_output_mime(OutputFormat::Same, "image/jpg");
        assert_eq!(s.mime, "image/jpeg");
    }

    #[test]
    fn same_preserves_png_webp_avif() {
        assert_eq!(
            resolve_output_mime(OutputFormat::Same, "image/png").ext,
            "png"
        );
        assert_eq!(
            resolve_output_mime(OutputFormat::Same, "image/webp").ext,
            "webp"
        );
        assert_eq!(
            resolve_output_mime(OutputFormat::Same, "image/avif").ext,
            "avif"
        );
    }

    #[test]
    fn same_falls_back_to_jpeg_for_unknown() {
        let s = resolve_output_mime(OutputFormat::Same, "image/bmp");
        assert_eq!((s.mime, s.ext), ("image/jpeg", "jpeg"));
    }

    #[test]
    fn explicit_formats_ignore_source() {
        assert_eq!(
            resolve_output_mime(OutputFormat::Webp, "image/png").mime,
            "image/webp"
        );
        assert_eq!(
            resolve_output_mime(OutputFormat::Avif, "image/jpeg").mime,
            "image/avif"
        );
        assert_eq!(
            resolve_output_mime(OutputFormat::Jpeg, "image/png").mime,
            "image/jpeg"
        );
        assert_eq!(
            resolve_output_mime(OutputFormat::Png, "image/webp").mime,
            "image/png"
        );
    }

    #[test]
    fn balanced_quality_per_format() {
        assert_eq!(
            resolve_quality(CompressionMode::Balanced, 0, "image/jpeg"),
            0.82
        );
        assert_eq!(
            resolve_quality(CompressionMode::Balanced, 0, "image/webp"),
            0.80
        );
        assert_eq!(
            resolve_quality(CompressionMode::Balanced, 0, "image/avif"),
            0.65
        );
        assert_eq!(
            resolve_quality(CompressionMode::Balanced, 0, "image/png"),
            1.0
        );
    }

    #[test]
    fn lossless_quality_is_one() {
        assert_eq!(
            resolve_quality(CompressionMode::Lossless, 50, "image/jpeg"),
            1.0
        );
        assert_eq!(
            resolve_quality(CompressionMode::Lossless, 50, "image/webp"),
            1.0
        );
    }

    #[test]
    fn custom_quality_uses_slider() {
        assert_eq!(
            resolve_quality(CompressionMode::Custom, 50, "image/jpeg"),
            0.5
        );
        assert_eq!(
            resolve_quality(CompressionMode::Custom, 1, "image/jpeg"),
            0.01
        );
        assert_eq!(
            resolve_quality(CompressionMode::Custom, 100, "image/jpeg"),
            1.0
        );
    }

    #[test]
    fn png_level_by_mode() {
        assert_eq!(resolve_png_level(CompressionMode::Lossless, 0), 4);
        assert_eq!(resolve_png_level(CompressionMode::Balanced, 0), 2);
    }

    #[test]
    fn custom_png_level_mapping() {
        assert_eq!(resolve_png_level(CompressionMode::Custom, 100), 6);
        assert_eq!(resolve_png_level(CompressionMode::Custom, 50), 3);
        assert_eq!(resolve_png_level(CompressionMode::Custom, 1), 1);
    }

    #[test]
    fn custom_png_level_is_clamped() {
        assert_eq!(resolve_png_level(CompressionMode::Custom, 0), 1);
        assert_eq!(resolve_png_level(CompressionMode::Custom, 255), 6);
    }

    #[test]
    fn savings_basic() {
        assert_eq!(calc_savings(1000, 500), 50.0);
    }

    #[test]
    fn savings_typical_jpeg() {
        let v = calc_savings(1000, 260);
        assert!((v - 74.0).abs() < 0.001);
    }

    #[test]
    fn savings_never_negative() {
        assert_eq!(calc_savings(500, 1000), 0.0);
        assert_eq!(calc_savings(500, 500), 0.0);
    }

    #[test]
    fn savings_handles_zero_original() {
        assert_eq!(calc_savings(0, 100), 0.0);
        assert_eq!(calc_savings(0, 0), 0.0);
    }

    #[test]
    fn savings_full_compression() {
        assert_eq!(calc_savings(1000, 0), 100.0);
    }

    #[test]
    fn video_preset_is_reachable_from_engine() {
        let p = resolve_video_preset(CompressionMode::Balanced);
        assert_eq!(p.bitrate_ratio, 0.55);
    }
}
