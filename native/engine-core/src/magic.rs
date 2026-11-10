//! Signature-based MIME detection, mirroring
//! `getFileMimeFromMagicBytes` in `src/lib/utils/browser-support.ts`.
//!
//! Extensions are user-controlled and easy to spoof. Reading the first bytes of
//! a file is a cheap, reliable way to reject disguised or unsupported media
//! before it reaches a decoder.

/// Detects a supported media MIME type from its magic bytes.
///
/// Returns `None` when the signature is unknown or the buffer is too short.
///
/// ```
/// use lion_engine_core::detect_mime;
///
/// assert_eq!(detect_mime(&[0xFF, 0xD8, 0xFF, 0xE0]), Some("image/jpeg"));
/// assert_eq!(detect_mime(b"not a real file"), None);
/// ```
pub fn detect_mime(bytes: &[u8]) -> Option<&'static str> {
    // JPEG: FF D8 FF
    if bytes.len() >= 3 && bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF {
        return Some("image/jpeg");
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    const PNG_SIGNATURE: [u8; 8] = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
    if bytes.starts_with(&PNG_SIGNATURE) {
        return Some("image/png");
    }

    // WebP: "RIFF" .... "WEBP"
    if bytes.len() >= 12 && &bytes[0..4] == b"RIFF" && &bytes[8..12] == b"WEBP" {
        return Some("image/webp");
    }

    // WebM: 1A 45 DF A3
    if bytes.len() >= 4 && bytes[0..4] == [0x1A, 0x45, 0xDF, 0xA3] {
        return Some("video/webm");
    }

    // ISO base media (MP4 / MOV / AVIF): "ftyp" box at offset 4.
    if bytes.len() >= 12 && &bytes[4..8] == b"ftyp" {
        let brand = &bytes[8..12];
        if brand.starts_with(b"avif") || brand.starts_with(b"avis") {
            return Some("image/avif");
        }
        if brand.starts_with(b"qt") {
            return Some("video/quicktime");
        }
        return Some("video/mp4");
    }

    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn detects_jpeg() {
        assert_eq!(detect_mime(&[0xFF, 0xD8, 0xFF, 0xE0]), Some("image/jpeg"));
    }

    #[test]
    fn detects_png() {
        let data = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00];
        assert_eq!(detect_mime(&data), Some("image/png"));
    }

    #[test]
    fn detects_webp() {
        let mut data = *b"RIFF\x00\x00\x00\x00WEBP";
        assert_eq!(detect_mime(&data), Some("image/webp"));
        data[9] = b'X';
        assert_eq!(detect_mime(&data), None);
    }

    #[test]
    fn detects_webm() {
        assert_eq!(
            detect_mime(&[0x1A, 0x45, 0xDF, 0xA3, 0x00]),
            Some("video/webm")
        );
    }

    #[test]
    fn detects_avif_brand() {
        let mut data = [0u8; 16];
        data[4..8].copy_from_slice(b"ftyp");
        data[8..12].copy_from_slice(b"avif");
        assert_eq!(detect_mime(&data), Some("image/avif"));
    }

    #[test]
    fn detects_avis_brand() {
        let mut data = [0u8; 16];
        data[4..8].copy_from_slice(b"ftyp");
        data[8..12].copy_from_slice(b"avis");
        assert_eq!(detect_mime(&data), Some("image/avif"));
    }

    #[test]
    fn detects_quicktime() {
        let mut data = [0u8; 16];
        data[4..8].copy_from_slice(b"ftyp");
        data[8..12].copy_from_slice(b"qt  ");
        assert_eq!(detect_mime(&data), Some("video/quicktime"));
    }

    #[test]
    fn detects_generic_mp4() {
        let mut data = [0u8; 16];
        data[4..8].copy_from_slice(b"ftyp");
        data[8..12].copy_from_slice(b"isom");
        assert_eq!(detect_mime(&data), Some("video/mp4"));
    }

    #[test]
    fn rejects_unknown_and_short_buffers() {
        assert_eq!(detect_mime(b"hello world"), None);
        assert_eq!(detect_mime(&[]), None);
        assert_eq!(detect_mime(&[0xFF]), None);
        assert_eq!(detect_mime(&[0xFF, 0xD8]), None);
    }
}
