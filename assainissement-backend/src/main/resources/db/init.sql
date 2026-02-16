-- ============================================
-- AssainissementPro Database Initialization
-- Run this script in PostgreSQL to create the database
-- ============================================

-- Create database (run as superuser)
-- CREATE DATABASE assainissement_db;

-- Connect to the database
-- \c assainissement_db

-- The tables will be created automatically by Hibernate (ddl-auto=update)
-- This file is for reference and manual setup if needed

-- ============================================
-- Optional: Create initial admin user
-- Password: admin123 (BCrypt encoded)
-- ============================================

-- INSERT INTO users (email, password, first_name, last_name, role, active, created_at, updated_at)
-- VALUES (
--     'admin@assainissement.fr',
--     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n0.FBNXuRz5iyApY/j4k.', -- admin123
--     'Admin',
--     'System',
--     'ADMIN',
--     true,
--     NOW(),
--     NOW()
-- );
