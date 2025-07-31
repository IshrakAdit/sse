CREATE USER sse_user WITH PASSWORD 'sse_password';
CREATE DATABASE sse_db;

GRANT ALL PRIVILEGES ON DATABASE sse_db TO sse_user;

\connect sse_db
GRANT ALL ON SCHEMA public TO sse_user;
ALTER SCHEMA public OWNER TO sse_user;
