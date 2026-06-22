-- Corriger les RDV enregistrés avant le fix fuseau (heure UTC prise pour heure locale).
-- Ex. 09:00 UTC affiché 05:00 en Martinique → recale au premier créneau manqué (07:00 local).
UPDATE "appointments"
SET
  "start_time" = "start_time" + (
    (
      7 * 60
      - (
        EXTRACT(HOUR FROM "start_time" AT TIME ZONE 'America/Martinique') * 60
        + EXTRACT(MINUTE FROM "start_time" AT TIME ZONE 'America/Martinique')
      )
    ) || ' minutes'
  )::interval,
  "end_time" = "end_time" + (
    (
      7 * 60
      - (
        EXTRACT(HOUR FROM "start_time" AT TIME ZONE 'America/Martinique') * 60
        + EXTRACT(MINUTE FROM "start_time" AT TIME ZONE 'America/Martinique')
      )
    ) || ' minutes'
  )::interval
WHERE
  (
    EXTRACT(HOUR FROM "start_time" AT TIME ZONE 'America/Martinique') * 60
    + EXTRACT(MINUTE FROM "start_time" AT TIME ZONE 'America/Martinique')
  ) < 7 * 60
  AND EXTRACT(DOW FROM "start_time" AT TIME ZONE 'America/Martinique') <> 6;
