-- Enable necessary extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create scheduled job to automatically sync aging WIP data every 2 hours
-- This ensures that when invoices are posted in Tekmetric and work orders 
-- change status, they automatically drop off the aging WIP list

SELECT cron.schedule(
  'sync-aging-wip-auto',
  '0 */2 * * *', -- Every 2 hours at the top of the hour (00:00, 02:00, 04:00, etc.)
  $$
  SELECT
    net.http_post(
        url:='https://svxcvsrvqhpuadhfeyen.supabase.co/functions/v1/sync-aging-wip',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2eGN2c3J2cWhwdWFkaGZleWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMzI0NTQsImV4cCI6MjA3MjkwODQ1NH0.tHWD8kA0WNAplP-bi-YNY9qNYn78QPhooLHE2G5V_g0"}'::jsonb,
        body:='{"scheduled": true, "sync_time": "' || now() || '"}'::jsonb
    ) as request_id;
  $$
);

-- Create a more frequent sync during business hours for faster updates
SELECT cron.schedule(
  'sync-aging-wip-business-hours',
  '0 8-17 * * 1-5', -- Every hour from 8 AM to 5 PM, Monday through Friday
  $$
  SELECT
    net.http_post(
        url:='https://svxcvsrvqhpuadhfeyen.supabase.co/functions/v1/sync-aging-wip',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2eGN2c3J2cWhwdWFkaGZleWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMzI0NTQsImV4cCI6MjA3MjkwODQ1NH0.tHWD8kA0WNAplP-bi-YNY9qNYn78QPhooLHE2G5V_g0"}'::jsonb,
        body:='{"scheduled": true, "business_hours": true, "sync_time": "' || now() || '"}'::jsonb
    ) as request_id;
  $$
);