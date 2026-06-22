-- Les colonnes start_time/end_time sont "timestamp without time zone" : Node les lit comme UTC.
-- Des RDV enregistrés avant le fix affichent 05:00 / 06:30 en Martinique au lieu de 07:00.
UPDATE "appointments"
SET
  "start_time" = "start_time" + (
    (
      7 * 60
      - (
        EXTRACT(HOUR FROM "start_time") * 60
        + EXTRACT(MINUTE FROM "start_time")
        - 4 * 60
      )
    ) || ' minutes'
  )::interval,
  "end_time" = "end_time" + (
    (
      7 * 60
      - (
        EXTRACT(HOUR FROM "start_time") * 60
        + EXTRACT(MINUTE FROM "start_time")
        - 4 * 60
      )
    ) || ' minutes'
  )::interval
WHERE
  (
    EXTRACT(HOUR FROM "start_time") * 60
    + EXTRACT(MINUTE FROM "start_time")
    - 4 * 60
  ) < 7 * 60
  AND (
    EXTRACT(HOUR FROM "start_time") * 60
    + EXTRACT(MINUTE FROM "start_time")
    - 4 * 60
  ) >= 3 * 60;
