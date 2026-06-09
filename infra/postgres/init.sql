-- Create schemas for service isolation
CREATE SCHEMA IF NOT EXISTS keycloak;
CREATE SCHEMA IF NOT EXISTS n8n;
CREATE SCHEMA IF NOT EXISTS app;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Grant schema access
GRANT ALL PRIVILEGES ON SCHEMA keycloak TO payments_user;
GRANT ALL PRIVILEGES ON SCHEMA n8n TO payments_user;
GRANT ALL PRIVILEGES ON SCHEMA app TO payments_user;
GRANT ALL PRIVILEGES ON DATABASE payments_db TO payments_user;

-- Set default search path
ALTER USER payments_user SET search_path TO app, public;
