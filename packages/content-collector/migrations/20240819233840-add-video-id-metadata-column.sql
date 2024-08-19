-- +migrate Up
ALTER TABLE metadata ADD COLUMN videoId TEXT DEFAULT '';

-- +migrate Down
ALTER TABLE metadata DROP COLUMN videoId;
