-- =====================================================================
-- ArchersHub 2.0 database schema (MySQL 8)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS archershub
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE archershub;

-- ---------------------------------------------------------------------
-- UNIVERSITY STRUCTURE

CREATE TABLE IF NOT EXISTS college (
    college_id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS department (
    department_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    college_id    INT UNSIGNED NOT NULL,
    name          VARCHAR(100) NOT NULL,
    UNIQUE (college_id, name),
    FOREIGN KEY (college_id) REFERENCES college (college_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS program (
    program_id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    college_id   INT UNSIGNED NOT NULL,
    name         VARCHAR(150) NOT NULL UNIQUE,
    FOREIGN KEY (college_id) REFERENCES college (college_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- USERS AND ROLES
-- user_id is the school ID number (e.g. 12208469), assigned by the
-- admin

CREATE TABLE IF NOT EXISTS users (
    user_id         INT UNSIGNED PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,           -- bcrypt hash, never plain text
    role            ENUM('Student','Teacher','APO','Provost','Admin') NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    nickname        VARCHAR(100) NULL,
    address         VARCHAR(255) NULL,
    contact_number  VARCHAR(30)  NULL,
    profile_picture VARCHAR(255) NULL,               -- path to the image file, not the image itself
    account_status  ENUM('Active','Disabled') NOT NULL DEFAULT 'Active',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS admin (
    user_id     INT UNSIGNED PRIMARY KEY,
    created_by  INT UNSIGNED NULL,                   -- NULL for the very first admin
    FOREIGN KEY (user_id)    REFERENCES users (user_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users (user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS teacher (
    user_id          INT UNSIGNED PRIMARY KEY,
    department_id    INT UNSIGNED NOT NULL,
    employment_type  VARCHAR(30) NOT NULL,           -- e.g. Full-time, Part-time
    FOREIGN KEY (user_id)       REFERENCES users (user_id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES department (department_id)
) ENGINE=InnoDB;

-- A student's college is found through program.college_id,
-- so it is not stored again here.
CREATE TABLE IF NOT EXISTS student (
    user_id          INT UNSIGNED PRIMARY KEY,
    program_id       INT UNSIGNED NOT NULL,
    academic_status  ENUM('Active','LOA','Discontinued','Expulsion','Graduate')
                     NOT NULL DEFAULT 'Active',
    campus           VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id)    REFERENCES users (user_id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES program (program_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS student_status_history (
    history_id  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id  INT UNSIGNED NOT NULL,
    status      ENUM('Active','LOA','Discontinued','Expulsion','Graduate') NOT NULL,
    start_date  DATE NOT NULL,
    end_date    DATE NULL,
    note        VARCHAR(255) NULL,
    FOREIGN KEY (student_id) REFERENCES student (user_id) ON DELETE CASCADE,
    CHECK (end_date IS NULL OR end_date >= start_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS apo (
    user_id     INT UNSIGNED PRIMARY KEY,
    college_id  INT UNSIGNED NOT NULL,
    campus      VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id)    REFERENCES users (user_id) ON DELETE CASCADE,
    FOREIGN KEY (college_id) REFERENCES college (college_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS provost (
    user_id  INT UNSIGNED PRIMARY KEY,
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- One-time passwords for the Forgot Password page (store a hash, not the OTP).
CREATE TABLE IF NOT EXISTS password_reset_otp (
    otp_id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NOT NULL,
    otp_hash    VARCHAR(255) NOT NULL,
    expires_at  DATETIME NOT NULL,
    used        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- COURSES AND CURRICULUM

CREATE TABLE IF NOT EXISTS course (
    course_code  VARCHAR(15) PRIMARY KEY,
    title        VARCHAR(150) NOT NULL,
    units        TINYINT UNSIGNED NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS course_requirements (
    course_code   VARCHAR(15) NOT NULL,
    pre_req_code  VARCHAR(15) NOT NULL,
    PRIMARY KEY (course_code, pre_req_code),
    FOREIGN KEY (course_code)  REFERENCES course (course_code),
    FOREIGN KEY (pre_req_code) REFERENCES course (course_code),
    CHECK (course_code <> pre_req_code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS curriculum_course (
    program_id   INT UNSIGNED NOT NULL,
    course_code  VARCHAR(15) NOT NULL,
    year_lvl     TINYINT UNSIGNED NOT NULL,
    term_no      TINYINT UNSIGNED NOT NULL,
    category     VARCHAR(50) NOT NULL,               -- e.g. Major, GE, Elective
    PRIMARY KEY (program_id, course_code),
    FOREIGN KEY (program_id)  REFERENCES program (program_id),
    FOREIGN KEY (course_code) REFERENCES course (course_code)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- TERMS AND SECTIONS

CREATE TABLE IF NOT EXISTS term (
    term_id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    school_year  VARCHAR(9) NOT NULL,                -- e.g. 2026-2027
    term_no      TINYINT UNSIGNED NOT NULL,
    start_date   DATE NOT NULL,
    end_date     DATE NOT NULL,
    UNIQUE (school_year, term_no),
    CHECK (end_date >= start_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS term_period (
    period_id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    term_id      INT UNSIGNED NOT NULL,
    period_type  ENUM('Enlistment','Add/Drop','Withdrawal','Special Class','Program Exchange','Grade Encoding') NOT NULL,
    start_date   DATETIME NOT NULL,
    end_date     DATETIME NOT NULL,
    FOREIGN KEY (term_id) REFERENCES term (term_id) ON DELETE CASCADE,
    CHECK (end_date >= start_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS section (
    section_id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    section_code  VARCHAR(10) NOT NULL,              -- e.g. X05, N24
    course_code   VARCHAR(15) NOT NULL,
    term_id       INT UNSIGNED NOT NULL,
    teacher_id    INT UNSIGNED NULL,                 -- NULL = teacher not assigned yet
    campus        VARCHAR(50) NOT NULL,
    slots         SMALLINT UNSIGNED NOT NULL,
    UNIQUE (course_code, term_id, section_code),
    FOREIGN KEY (course_code) REFERENCES course (course_code),
    FOREIGN KEY (term_id)     REFERENCES term (term_id),
    FOREIGN KEY (teacher_id)  REFERENCES teacher (user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- One row per class meeting, e.g. XZ08 = MON 19:30-21:00 online + THU 19:30-21:00 LR302.
-- Also to detect schedule conflicts during enlistment.
CREATE TABLE IF NOT EXISTS section_meeting (
    meeting_id  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    section_id  INT UNSIGNED NOT NULL,
    day         ENUM('Mon','Tue','Wed','Thu','Fri','Sat','Sun') NOT NULL,
    start_time  TIME NOT NULL,
    end_time    TIME NOT NULL,
    room        VARCHAR(30) NULL,                    -- room code, or 'online'
    FOREIGN KEY (section_id) REFERENCES section (section_id) ON DELETE CASCADE,
    CHECK (end_time > start_time)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- ENROLLMENT AND GRADES
-- Pending = saved but not submitted yet.

CREATE TABLE IF NOT EXISTS enrollment (
    enrollment_id  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id     INT UNSIGNED NOT NULL,
    section_id     INT UNSIGNED NOT NULL,
    status         ENUM('Pending','Enlisted','Dropped','Withdrawn') NOT NULL DEFAULT 'Pending',
    reason         VARCHAR(255) NULL,                -- reason chosen when dropping or withdrawing
    date_enrolled  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    enrolled_by    INT UNSIGNED NULL,                -- the student or the APO who did it
    UNIQUE (student_id, section_id),
    FOREIGN KEY (student_id)  REFERENCES student (user_id),
    FOREIGN KEY (section_id)  REFERENCES section (section_id),
    FOREIGN KEY (enrolled_by) REFERENCES users (user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- grade_value is text because grades are not all numbers (INC, DRP ...).
CREATE TABLE IF NOT EXISTS grade_scale (
    grade_value  VARCHAR(5) PRIMARY KEY,
    description  VARCHAR(100) NOT NULL,
    is_passing   BOOLEAN NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS grade (
    grade_id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    enrollment_id  INT UNSIGNED NOT NULL UNIQUE,     -- one grade per enrollment
    encoded_by     INT UNSIGNED NOT NULL,            -- the teacher, or an admin correcting a grade
    grade_value    VARCHAR(5) NOT NULL,
    date_encoded   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (enrollment_id) REFERENCES enrollment (enrollment_id),
    FOREIGN KEY (encoded_by)    REFERENCES users (user_id),
    FOREIGN KEY (grade_value)   REFERENCES grade_scale (grade_value)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- APPLICATIONS

CREATE TABLE IF NOT EXISTS special_class_application (
    application_id  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id      INT UNSIGNED NOT NULL,
    course_code     VARCHAR(15) NOT NULL,
    term_id         INT UNSIGNED NOT NULL,
    campus          VARCHAR(50) NOT NULL,             -- Manila, Laguna or Either
    reason          TEXT NULL,
    status          ENUM('Pending','Approved','Rejected','Withdrawn') NOT NULL DEFAULT 'Pending',
    reviewed_by     INT UNSIGNED NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id)  REFERENCES student (user_id),
    FOREIGN KEY (course_code) REFERENCES course (course_code),
    FOREIGN KEY (term_id)     REFERENCES term (term_id),
    FOREIGN KEY (reviewed_by) REFERENCES users (user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS program_exchange_application (
    application_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id         INT UNSIGNED NOT NULL,
    target_program_id  INT UNSIGNED NOT NULL,
    status             ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
    reviewed_by        INT UNSIGNED NULL,
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id)        REFERENCES student (user_id),
    FOREIGN KEY (target_program_id) REFERENCES program (program_id),
    FOREIGN KEY (reviewed_by)       REFERENCES users (user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- ORGANIZATIONS

CREATE TABLE IF NOT EXISTS organization (
    org_id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(150) NOT NULL UNIQUE,
    description  TEXT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS org_member (
    org_id      INT UNSIGNED NOT NULL,
    student_id  INT UNSIGNED NOT NULL,
    position    VARCHAR(50) NOT NULL DEFAULT 'Member',
    can_post    BOOLEAN NOT NULL DEFAULT FALSE,
    joined_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (org_id, student_id),
    FOREIGN KEY (org_id)     REFERENCES organization (org_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES student (user_id) ON DELETE CASCADE
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS org_application (
    application_id  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id      INT UNSIGNED NOT NULL,
    org_id          INT UNSIGNED NOT NULL,
    status          ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, org_id),
    FOREIGN KEY (student_id) REFERENCES student (user_id),
    FOREIGN KEY (org_id)     REFERENCES organization (org_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS org_post (
    post_id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    org_id     INT UNSIGNED NOT NULL,
    posted_by  INT UNSIGNED NULL,
    title      VARCHAR(200) NOT NULL,
    content    TEXT NOT NULL,
    posted_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id)    REFERENCES organization (org_id) ON DELETE CASCADE,
    FOREIGN KEY (posted_by) REFERENCES users (user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- PROVOST: CALENDAR AND ANNOUNCEMENTS

CREATE TABLE IF NOT EXISTS calendar_event (
    event_id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_by    INT UNSIGNED NULL,
    title         VARCHAR(200) NOT NULL,
    start_date    DATETIME NOT NULL,
    end_date      DATETIME NULL,
    is_important  BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (created_by) REFERENCES provost (user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS announcement (
    announcement_id  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    provost_id       INT UNSIGNED NULL,
    title            VARCHAR(200) NOT NULL,
    content          TEXT NOT NULL,
    is_important     BOOLEAN NOT NULL DEFAULT FALSE,
    start_date       DATETIME NOT NULL,
    end_date         DATETIME NULL,
    FOREIGN KEY (provost_id) REFERENCES provost (user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Files attached to an announcement (the file lives on disk, only its path is stored).
CREATE TABLE IF NOT EXISTS announcement_attachment (
    attachment_id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    announcement_id  INT UNSIGNED NOT NULL,
    file_name        VARCHAR(255) NOT NULL,
    file_path        VARCHAR(500) NOT NULL,
    uploaded_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (announcement_id) REFERENCES announcement (announcement_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- STARTER DATA 

INSERT IGNORE INTO grade_scale (grade_value, description, is_passing) VALUES
    ('4.0', 'Perfect',       TRUE),
    ('3.5', 'Very Good',       TRUE),
    ('3.0', 'Good',            TRUE),
    ('2.5', 'Satisfactory',    TRUE),
    ('2.0', 'Fair',            TRUE),
    ('1.5', 'Poor',            TRUE),
    ('1.0', 'Passing',         TRUE),
    ('0.0', 'Failed',          FALSE),
    ('INC', 'Incomplete',      FALSE),
    ('DRP', 'Dropped',         FALSE),
    ('P', 'Passed', TRUE),
    ('Fail', 'Failed', FALSE);
