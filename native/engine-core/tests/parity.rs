//! Integration tests that exercise the public API the way a future native
//! backend would. These also act as cross-language parity checks against the
//! TypeScript engine.

use lion_engine_core::{
    calc_savings, detect_mime, format_bytes, image_preset, resolve_output_mime, resolve_png_level,
    resolve_quality, CompressionMode, OutputFormat,
};

#[test]
fn image_intake_pipeline_png_to_webp() {
    let bytes = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
    let source = detect_mime(&bytes).expect("valid PNG signature");

    let spec = resolve_output_mime(OutputFormat::Webp, source);
    assert_eq!(spec.mime, "image/webp");
    assert_eq!(spec.ext, "webp");

    let quality = resolve_quality(CompressionMode::Balanced, 0, spec.mime);
    assert!((quality - 0.80).abs() < f32::EPSILON);

    let savings = calc_savings(120_000, 48_000);
    assert!((savings - 60.0).abs() < 0.001);
    assert_eq!(format_bytes(72_000, 1), "70.3 KB");
}

#[test]
fn png_to_png_stays_lossless() {
    let bytes = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
    let source = detect_mime(&bytes).expect("valid PNG signature");
    let spec = resolve_output_mime(OutputFormat::Same, source);

    assert_eq!((spec.mime, spec.ext), ("image/png", "png"));
    assert_eq!(
        resolve_quality(CompressionMode::Lossless, 0, spec.mime),
        1.0
    );
    assert_eq!(resolve_png_level(CompressionMode::Lossless, 0), 4);
}

#[test]
fn video_intake_pipeline_mp4() {
    let mut bytes = [0u8; 16];
    bytes[4..8].copy_from_slice(b"ftyp");
    bytes[8..12].copy_from_slice(b"isom");

    let source = detect_mime(&bytes).expect("valid MP4 signature");
    assert_eq!(source, "video/mp4");

    let preset = lion_engine_core::video_preset(CompressionMode::Balanced);
    assert!((preset.bitrate_ratio - 0.55).abs() < f32::EPSILON);
}

#[test]
fn custom_mode_is_driven_by_the_slider() {
    let quality = resolve_quality(CompressionMode::Custom, 63, "image/jpeg");
    assert!((quality - 0.63).abs() < f32::EPSILON);

    let level = resolve_png_level(CompressionMode::Custom, 63);
    assert_eq!(level, 4);
}

#[test]
fn unknown_signatures_are_rejected() {
    assert_eq!(detect_mime(b"%PDF-1.7"), None);
    assert_eq!(detect_mime(b"GIF89a"), None);
}

#[test]
fn presets_are_consistent_across_media_types() {
    let image = image_preset(CompressionMode::Balanced);
    let video = lion_engine_core::video_preset(CompressionMode::Balanced);

    assert_eq!(image.oxipng_level, 2);
    assert!(image.strip_metadata);
    assert!((video.bitrate_ratio - 0.55).abs() < f32::EPSILON);
}
