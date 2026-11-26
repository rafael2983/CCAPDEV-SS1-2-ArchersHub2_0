
CREATE DATABASE IF NOT EXISTS archershub_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE archershub_db;

-- =====================================
-- DEGREE PROGRAMS
-- =====================================

CREATE TABLE IF NOT EXISTS programs (

    program_id INT AUTO_INCREMENT PRIMARY KEY,

    program_code VARCHAR(30) NOT NULL UNIQUE,

    program_name VARCHAR(150) NOT NULL

);


-- =====================================
-- USER ACCOUNTS
-- =====================================

CREATE TABLE IF NOT EXISTS users (

    user_id INT AUTO_INCREMENT PRIMARY KEY,

    school_id VARCHAR(30) NOT NULL UNIQUE,

    first_name VARCHAR(100) NOT NULL,

    middle_name VARCHAR(100),

    last_name VARCHAR(100) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    role ENUM(
        'student',
        'faculty',
        'admin'
    ) NOT NULL,

    status ENUM(
        'active',
        'inactive'
    ) NOT NULL DEFAULT 'active',

    program_id INT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (program_id)
        REFERENCES programs(program_id)
        ON DELETE SET NULL

);
