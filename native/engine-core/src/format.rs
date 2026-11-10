//! Human-readable byte formatting, mirroring
//! `src/lib/utils/format-bytes.ts`.
//!
//! The web client uses `parseFloat((bytes / 1024^i).toFixed(decimals))` to drop
//! trailing zeros. The helper below reproduces that behavior without allocating
//! a float parser.

/// Formats a byte count using binary units (`B`, `KB`, `MB`, `GB`).
///
/// ```
/// use lion_engine_core::format_bytes;
///
/// assert_eq!(format_bytes(0, 1), "0 B");
/// assert_eq!(format_bytes(1_536, 1), "1.5 KB");
/// assert_eq!(format_bytes(1_048_576, 0), "1 MB");
/// ```
pub fn format_bytes(bytes: u64, decimals: usize) -> String {
    if bytes == 0 {
        return "0 B".to_string();
    }

    const K: f64 = 1024.0;
    const UNITS: [&str; 4] = ["B", "KB", "MB", "GB"];

    let exponent = ((bytes as f64).ln() / K.ln()).floor() as usize;
    let index = exponent.min(UNITS.len() - 1);
    let value = bytes as f64 / K.powi(index as i32);

    let formatted = trim_trailing_zeros(&format!("{value:.decimals$}"));
    format!("{formatted} {}", UNITS[index])
}

/// Removes trailing zeros (and a dangling decimal point) from a formatted float.
fn trim_trailing_zeros(input: &str) -> String {
    if !input.contains('.') {
        return input.to_string();
    }

    let trimmed = input.trim_end_matches('0').trim_end_matches('.');
    if trimmed.is_empty() {
        "0".to_string()
    } else {
        trimmed.to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn zero_bytes() {
        assert_eq!(format_bytes(0, 1), "0 B");
    }

    #[test]
    fn bytes_under_one_kb() {
        assert_eq!(format_bytes(42, 1), "42 B");
        assert_eq!(format_bytes(1023, 0), "1023 B");
    }

    #[test]
    fn kilobytes() {
        assert_eq!(format_bytes(1024, 1), "1 KB");
        assert_eq!(format_bytes(1536, 1), "1.5 KB");
        assert_eq!(format_bytes(1536, 2), "1.5 KB");
    }

    #[test]
    fn megabytes_and_gigabytes() {
        assert_eq!(format_bytes(1_048_576, 0), "1 MB");
        assert_eq!(format_bytes(1_073_741_824, 0), "1 GB");
    }

    #[test]
    fn rounds_to_requested_decimals() {
        assert_eq!(format_bytes(1234, 2), "1.21 KB");
        assert_eq!(format_bytes(1234, 0), "1 KB");
    }

    #[test]
    fn clamps_to_gigabytes() {
        assert_eq!(format_bytes(5_000_000_000_000, 2), "4656.61 GB");
    }

    #[test]
    fn trim_helper() {
        assert_eq!(trim_trailing_zeros("1.500"), "1.5");
        assert_eq!(trim_trailing_zeros("2.00"), "2");
        assert_eq!(trim_trailing_zeros("3"), "3");
    }
}
