-- Supported performance indexes for the PhoneDB query workload.
-- Expensive partitioning and engine-specific expression indexes are intentionally
-- excluded; the application uses portable, parameterized queries instead.

CREATE INDEX idx_phones_brand_status_release
  ON phones (brand_id, status, release_date);

CREATE INDEX idx_phone_specs_filter_values
  ON phone_specifications (chipset_id, ram_gb, internal_storage_gb);

CREATE INDEX idx_display_specs_filter_size
  ON display_specifications (screen_size);

CREATE INDEX idx_phone_pricing_range
  ON phone_pricing (price_unofficial, price_official);

CREATE INDEX idx_phone_colors_name
  ON phone_colors (phone_id, color_name);
