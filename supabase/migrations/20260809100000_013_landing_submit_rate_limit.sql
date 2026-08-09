-- Distributed rate limiting for public landing submit endpoints (service_role only).

CREATE TABLE IF NOT EXISTS landing_submit_rate_limits (
  rate_key TEXT PRIMARY KEY,
  hit_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_landing_submit_rate_limits_window
  ON landing_submit_rate_limits (window_start);

CREATE OR REPLACE FUNCTION internal_landing_rate_limit(
  p_key TEXT,
  p_limit INTEGER,
  p_window_seconds INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMPTZ := timezone('utc', now());
  v_row landing_submit_rate_limits%ROWTYPE;
  v_window_start TIMESTAMPTZ;
BEGIN
  IF p_key IS NULL OR length(trim(p_key)) = 0 THEN
    RETURN jsonb_build_object('ok', false, 'remaining', 0);
  END IF;

  IF p_limit <= 0 OR p_window_seconds <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'remaining', 0);
  END IF;

  v_window_start := v_now - make_interval(secs => p_window_seconds);

  SELECT *
  INTO v_row
  FROM landing_submit_rate_limits
  WHERE rate_key = p_key
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO landing_submit_rate_limits (rate_key, hit_count, window_start)
    VALUES (p_key, 1, v_now);

    RETURN jsonb_build_object('ok', true, 'remaining', p_limit - 1);
  END IF;

  IF v_row.window_start < v_window_start THEN
    UPDATE landing_submit_rate_limits
    SET hit_count = 1,
        window_start = v_now
    WHERE rate_key = p_key;

    RETURN jsonb_build_object('ok', true, 'remaining', p_limit - 1);
  END IF;

  IF v_row.hit_count >= p_limit THEN
    RETURN jsonb_build_object('ok', false, 'remaining', 0);
  END IF;

  UPDATE landing_submit_rate_limits
  SET hit_count = hit_count + 1
  WHERE rate_key = p_key;

  RETURN jsonb_build_object(
    'ok', true,
    'remaining', greatest(p_limit - v_row.hit_count - 1, 0)
  );
END;
$$;

REVOKE ALL ON TABLE landing_submit_rate_limits FROM PUBLIC;
REVOKE ALL ON TABLE landing_submit_rate_limits FROM anon;
REVOKE ALL ON TABLE landing_submit_rate_limits FROM authenticated;

REVOKE ALL ON FUNCTION internal_landing_rate_limit(TEXT, INTEGER, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION internal_landing_rate_limit(TEXT, INTEGER, INTEGER) FROM anon;
REVOKE ALL ON FUNCTION internal_landing_rate_limit(TEXT, INTEGER, INTEGER) FROM authenticated;
GRANT EXECUTE ON FUNCTION internal_landing_rate_limit(TEXT, INTEGER, INTEGER) TO service_role;
