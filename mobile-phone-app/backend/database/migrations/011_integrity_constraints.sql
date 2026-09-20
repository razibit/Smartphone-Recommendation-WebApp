-- Enforce the one-to-one relationships represented by the data model.
ALTER TABLE phone_specifications
  ADD UNIQUE KEY uq_phone_specifications_phone (phone_id);

ALTER TABLE display_specifications
  ADD UNIQUE KEY uq_display_specifications_phone (phone_id);

ALTER TABLE physical_specifications
  ADD UNIQUE KEY uq_physical_specifications_phone (phone_id);

ALTER TABLE camera_specifications
  ADD UNIQUE KEY uq_camera_specifications_phone (phone_id);

ALTER TABLE audio_features
  ADD UNIQUE KEY uq_audio_features_phone (phone_id);

ALTER TABLE additional_features
  ADD UNIQUE KEY uq_additional_features_phone (phone_id);

ALTER TABLE phone_pricing
  ADD UNIQUE KEY uq_phone_pricing_variant (phone_id, variant_description);
