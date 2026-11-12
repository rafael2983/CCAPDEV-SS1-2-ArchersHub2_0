-- =====================================================================
-- ArchersHub 2.0 sample data
--
-- Run it AFTER archershub_query.sql, on a database with no other rows:
--     SOURCE /full/path/to/archershub_seed.sql;
--
-- Dates are set around the current term (2026-2027, term 1). The
-- enlistment/add-drop/withdrawal/etc. 
-- =====================================================================

USE archershub;

-- ---------------------------------------------------------------------
-- UNIVERSITY STRUCTURE

INSERT INTO college (name) VALUES
    ('College of Computer Studies'),
    ('College of Science');

SET @ccs := (SELECT college_id FROM college WHERE name = 'College of Computer Studies');
SET @cos := (SELECT college_id FROM college WHERE name = 'College of Science');

INSERT INTO department (college_id, name) VALUES
    (@ccs, 'Software Technology'),
    (@ccs, 'Information Technology'),
    (@cos, 'Biology');

INSERT INTO program (college_id, name) VALUES
    (@ccs, 'BS Computer Science'),
    (@ccs, 'BS Information Systems'),
    (@cos, 'BS Biology');

SET @bscs  := (SELECT program_id FROM program WHERE name = 'BS Computer Science');
SET @bsis  := (SELECT program_id FROM program WHERE name = 'BS Information Systems');
SET @bsbio := (SELECT program_id FROM program WHERE name = 'BS Biology');

SET @dept_sofdev := (SELECT department_id FROM department WHERE name = 'Software Technology');
SET @dept_it     := (SELECT department_id FROM department WHERE name = 'Information Technology');

-- ---------------------------------------------------------------------
-- USERS  (IDs: 1000000x staff, 1000001x teachers, 1230000x students)

INSERT INTO users (user_id, email, password_hash, role, first_name, last_name, nickname, address, contact_number) VALUES
    (10000001, 'admin@archershub.test',    'Password123', 'Admin',   'Alex',   'Admin',    NULL,    NULL,                      NULL),
    (10000002, 'provost@archershub.test',  'Password123', 'Provost', 'Maria',  'Santos',   NULL,    NULL,                      NULL),
    (10000003, 'apo@archershub.test',      'Password123', 'APO',     'Carlo',  'Mendoza',  NULL,    NULL,                      NULL),
    (10000011, 'elena.cruz@archershub.test',      'Password123', 'Teacher', 'Elena', 'Cruz',     NULL, NULL, NULL),
    (10000012, 'ramon.bautista@archershub.test',  'Password123', 'Teacher', 'Ramon', 'Bautista', NULL, NULL, NULL),
    (12300001, 'ana.reyes@archershub.test',       'Password123', 'Student', 'Ana',     'Reyes',   'Ana',    'Taft Avenue, Manila',    '0917 123 4567'),
    (12300002, 'miguel.torres@archershub.test',   'Password123', 'Student', 'Miguel',  'Torres',  'Migs',   NULL,                     NULL),
    (12300003, 'sofia.lim@archershub.test',       'Password123', 'Student', 'Sofia',   'Lim',     NULL,     NULL,                     NULL),
    (12300004, 'daniel.garcia@archershub.test',   'Password123', 'Student', 'Daniel',  'Garcia',  'Dan',    NULL,                     NULL),
    (12300005, 'isabel.ramos@archershub.test',    'Password123', 'Student', 'Isabel',  'Ramos',   NULL,     NULL,                     NULL);

INSERT INTO admin    (user_id, created_by)            VALUES (10000001, NULL);
INSERT INTO provost  (user_id)                        VALUES (10000002);
INSERT INTO apo      (user_id, college_id, campus)    VALUES (10000003, @ccs, 'Manila');

INSERT INTO teacher (user_id, department_id, employment_type) VALUES
    (10000011, @dept_sofdev, 'Full-time'),
    (10000012, @dept_it,     'Part-time');

INSERT INTO student (user_id, program_id, academic_status, campus) VALUES
    (12300001, @bscs,  'Active', 'Manila'),
    (12300002, @bscs,  'Active', 'Laguna'),
    (12300003, @bsis,  'Active', 'Manila'),
    (12300004, @bsbio, 'Active', 'Manila'),
    (12300005, @bscs,  'LOA',    'Manila');

INSERT INTO student_status_history (student_id, status, start_date, end_date, note) VALUES
    (12300001, 'Active', '2025-08-25', NULL,         NULL),
    (12300005, 'Active', '2025-08-25', '2026-08-23', NULL),
    (12300005, 'LOA',    '2026-08-24', NULL,         'Approved leave of absence');

-- ---------------------------------------------------------------------
-- COURSES AND CURRICULUM

INSERT INTO course (course_code, title, units) VALUES
    ('CCPROG1', 'Introduction to Programming 1', 3),
    ('CCPROG2', 'Introduction to Programming 2', 3),
    ('CCDSTRU', 'Data Structures',               3),
    ('CCAPDEV', 'Web Application Development',   3),
    ('CSMATH1', 'Discrete Mathematics',          3),
    ('GEETHIC', 'Ethics',                        3),
    ('BIO101',  'General Biology',               3);

INSERT INTO course_requirements (course_code, pre_req_code) VALUES
    ('CCPROG2', 'CCPROG1'),
    ('CCDSTRU', 'CCPROG2'),
    ('CCAPDEV', 'CCPROG2');

INSERT INTO curriculum_course (program_id, course_code, year_lvl, term_no, category) VALUES
    (@bscs,  'CCPROG1', 1, 1, 'Major'),
    (@bscs,  'CSMATH1', 1, 1, 'Major'),
    (@bscs,  'GEETHIC', 1, 1, 'GE'),
    (@bscs,  'CCPROG2', 1, 2, 'Major'),
    (@bscs,  'CCDSTRU', 2, 1, 'Major'),
    (@bscs,  'CCAPDEV', 2, 1, 'Major'),
    (@bsis,  'CCPROG1', 1, 1, 'Major'),
    (@bsis,  'GEETHIC', 1, 1, 'GE'),
    (@bsis,  'CCPROG2', 1, 2, 'Major'),
    (@bsbio, 'BIO101',  1, 1, 'Major'),
    (@bsbio, 'GEETHIC', 1, 1, 'GE');

-- ---------------------------------------------------------------------
-- TERMS

INSERT INTO term (school_year, term_no, start_date, end_date) VALUES
    ('2025-2026', 3, '2026-04-20', '2026-07-25'),
    ('2026-2027', 1, '2026-08-31', '2026-12-12');

SET @past := (SELECT term_id FROM term WHERE school_year = '2025-2026' AND term_no = 3);
SET @cur  := (SELECT term_id FROM term WHERE school_year = '2026-2027' AND term_no = 1);

INSERT INTO term_period (term_id, period_type, start_date, end_date) VALUES
    (@cur, 'Enlistment',       '2026-08-01 08:00:00', '2026-12-31 23:59:00'),
    (@cur, 'Add/Drop',         '2026-08-01 08:00:00', '2026-12-31 23:59:00'),
    (@cur, 'Withdrawal',       '2026-08-01 08:00:00', '2026-12-31 23:59:00'),
    (@cur, 'Special Class',    '2026-08-01 08:00:00', '2026-12-31 23:59:00'),
    (@cur, 'Program Exchange', '2026-08-01 08:00:00', '2026-12-31 23:59:00'),
    (@cur, 'Grade Encoding',   '2026-08-01 08:00:00', '2026-12-31 23:59:00');

-- ---------------------------------------------------------------------
-- SECTIONS AND CLASS MEETINGS
-- S31 has only 2 slots, and BIO101 S71 has no teacher assigned yet.

INSERT INTO section (section_code, course_code, term_id, teacher_id, campus, slots) VALUES
    ('S11', 'CCPROG1', @cur,  10000011, 'Manila', 40),
    ('S12', 'CCPROG1', @cur,  10000011, 'Laguna', 40),
    ('S21', 'CCPROG2', @cur,  10000011, 'Manila', 40),
    ('S31', 'CCDSTRU', @cur,  10000011, 'Manila', 2),
    ('S41', 'CCAPDEV', @cur,  10000012, 'Manila', 40),
    ('S51', 'CSMATH1', @cur,  10000012, 'Manila', 40),
    ('S61', 'GEETHIC', @cur,  10000012, 'Manila', 40),
    ('S71', 'BIO101',  @cur,  NULL,     'Manila', 40),
    ('P11', 'CCPROG1', @past, 10000011, 'Manila', 40),
    ('P51', 'CSMATH1', @past, 10000012, 'Manila', 40);

SET @s11 := (SELECT section_id FROM section WHERE course_code = 'CCPROG1' AND term_id = @cur  AND section_code = 'S11');
SET @s12 := (SELECT section_id FROM section WHERE course_code = 'CCPROG1' AND term_id = @cur  AND section_code = 'S12');
SET @s21 := (SELECT section_id FROM section WHERE course_code = 'CCPROG2' AND term_id = @cur  AND section_code = 'S21');
SET @s31 := (SELECT section_id FROM section WHERE course_code = 'CCDSTRU' AND term_id = @cur  AND section_code = 'S31');
SET @s41 := (SELECT section_id FROM section WHERE course_code = 'CCAPDEV' AND term_id = @cur  AND section_code = 'S41');
SET @s51 := (SELECT section_id FROM section WHERE course_code = 'CSMATH1' AND term_id = @cur  AND section_code = 'S51');
SET @s61 := (SELECT section_id FROM section WHERE course_code = 'GEETHIC' AND term_id = @cur  AND section_code = 'S61');
SET @s71 := (SELECT section_id FROM section WHERE course_code = 'BIO101'  AND term_id = @cur  AND section_code = 'S71');
SET @p11 := (SELECT section_id FROM section WHERE course_code = 'CCPROG1' AND term_id = @past AND section_code = 'P11');
SET @p51 := (SELECT section_id FROM section WHERE course_code = 'CSMATH1' AND term_id = @past AND section_code = 'P51');

INSERT INTO section_meeting (section_id, day, start_time, end_time, room) VALUES
    (@s11, 'Mon', '08:00:00', '09:30:00', 'G201'),
    (@s11, 'Thu', '08:00:00', '09:30:00', 'G201'),
    (@s12, 'Tue', '09:45:00', '11:15:00', 'L212'),
    (@s12, 'Fri', '09:45:00', '11:15:00', 'L212'),
    (@s21, 'Mon', '09:45:00', '11:15:00', 'G202'),
    (@s21, 'Thu', '09:45:00', '11:15:00', 'G202'),
    (@s31, 'Tue', '08:00:00', '09:30:00', 'G203'),
    (@s31, 'Fri', '08:00:00', '09:30:00', 'G203'),
    (@s41, 'Mon', '11:30:00', '13:00:00', 'online'),
    (@s41, 'Thu', '11:30:00', '13:00:00', 'LR302'),
    (@s51, 'Wed', '13:00:00', '16:00:00', 'G301'),
    (@s61, 'Tue', '11:30:00', '13:00:00', 'G204'),
    (@s61, 'Fri', '11:30:00', '13:00:00', 'G204'),
    (@s71, 'Mon', '13:15:00', '14:45:00', 'S404'),
    (@s71, 'Thu', '13:15:00', '14:45:00', 'S404'),
    (@p11, 'Mon', '08:00:00', '10:00:00', 'G201'),
    (@p51, 'Wed', '10:00:00', '12:00:00', 'G301');

-- ---------------------------------------------------------------------
-- ENROLLMENTS AND GRADES

INSERT INTO enrollment (student_id, section_id, status, reason, date_enrolled, enrolled_by) VALUES
    -- Ana: finished two courses last term, enlisted in two now, one still pending
    (12300001, @p11, 'Enlisted', NULL, '2026-04-10 09:00:00', 12300001),
    (12300001, @p51, 'Enlisted', NULL, '2026-04-10 09:05:00', 12300001),
    (12300001, @s21, 'Enlisted', NULL, '2026-08-05 10:00:00', 12300001),
    (12300001, @s41, 'Enlisted', NULL, '2026-08-05 10:05:00', 12300001),
    (12300001, @s51, 'Pending',  NULL, '2026-08-05 10:10:00', 12300001),
    -- Miguel: two enlisted, one dropped
    (12300002, @s11, 'Enlisted', NULL,                '2026-08-06 11:00:00', 12300002),
    (12300002, @s61, 'Enlisted', NULL,                '2026-08-06 11:05:00', 12300002),
    (12300002, @s31, 'Dropped',  'Schedule conflict', '2026-08-06 11:10:00', 12300002),
    -- Sofia, Daniel
    (12300003, @s12, 'Enlisted', NULL, '2026-08-07 09:30:00', 12300003),
    (12300004, @s71, 'Enlisted', NULL, '2026-08-07 09:40:00', 12300004),
    -- Isabel (on leave): last term's course
    (12300005, @p11, 'Enlisted', NULL, '2026-04-11 09:00:00', 12300005);

INSERT INTO grade (enrollment_id, encoded_by, grade_value)
    SELECT enrollment_id, 10000011, '3.5' FROM enrollment WHERE student_id = 12300001 AND section_id = @p11;
INSERT INTO grade (enrollment_id, encoded_by, grade_value)
    SELECT enrollment_id, 10000012, '3.0' FROM enrollment WHERE student_id = 12300001 AND section_id = @p51;
INSERT INTO grade (enrollment_id, encoded_by, grade_value)
    SELECT enrollment_id, 10000011, '1.0' FROM enrollment WHERE student_id = 12300005 AND section_id = @p11;

-- ---------------------------------------------------------------------
-- APPLICATIONS

INSERT INTO special_class_application (student_id, course_code, term_id, campus, reason, status, reviewed_by) VALUES
    (12300002, 'CCDSTRU', @cur, 'Either', 'The regular section clashes with my other classes.', 'Pending',  NULL),
    (12300003, 'CCPROG2', @cur, 'Manila', 'I need the course to stay on track with my program.', 'Approved', 10000003);

INSERT INTO program_exchange_application (student_id, target_program_id, status, reviewed_by) VALUES
    (12300003, @bscs, 'Pending', NULL);

-- ---------------------------------------------------------------------
-- ORGANIZATIONS

INSERT INTO organization (name, description) VALUES
    ('Computer Society',   'Workshops, hackathons and study groups for computing students.'),
    ('Digital Arts Guild', 'Illustration, animation and game art for all programs.'),
    ('Science Circle',     'Lab visits, talks and field trips for science students.');

SET @org_cs  := (SELECT org_id FROM organization WHERE name = 'Computer Society');
SET @org_da  := (SELECT org_id FROM organization WHERE name = 'Digital Arts Guild');
SET @org_sci := (SELECT org_id FROM organization WHERE name = 'Science Circle');

INSERT INTO org_member (org_id, student_id, position, can_post) VALUES
    (@org_cs,  12300001, 'President', TRUE),
    (@org_cs,  12300002, 'Member',    FALSE),
    (@org_da,  12300001, 'Member',    FALSE),
    (@org_sci, 12300004, 'President', TRUE);

INSERT INTO org_application (student_id, org_id, status) VALUES
    (12300003, @org_cs, 'Pending');

INSERT INTO org_post (org_id, posted_by, title, content, posted_at) VALUES
    (@org_cs,  12300001, 'Welcome new members!',  'Our first meeting is on Friday at 5 PM. Everyone is welcome.', '2026-09-02 10:00:00'),
    (@org_cs,  12300001, 'Hackathon sign-ups',    'Team sign-ups for the term hackathon are now open.',          '2026-10-15 14:30:00'),
    (@org_sci, 12300004, 'Lab visit this month',  'We are visiting the biology lab on the 25th. Sign up with us.', '2026-11-03 09:15:00');

-- ---------------------------------------------------------------------
-- PROVOST: CALENDAR AND ANNOUNCEMENTS

INSERT INTO calendar_event (created_by, title, start_date, end_date, is_important) VALUES
    (10000002, 'Start of Classes',          '2026-08-31 08:00:00', NULL,                  TRUE),
    (10000002, 'Last Day of Withdrawal',    '2026-11-20 17:00:00', NULL,                  TRUE),
    (10000002, 'University Foundation Week','2026-11-23 08:00:00', '2026-11-27 17:00:00', FALSE),
    (10000002, 'Final Examinations',        '2026-12-07 08:00:00', '2026-12-12 17:00:00', TRUE),
    (10000002, 'Christmas Break Begins',    '2026-12-19 00:00:00', NULL,                  FALSE);

INSERT INTO announcement (provost_id, title, content, is_important, start_date, end_date) VALUES
    (10000002, 'Welcome back, Archers!',
        'Classes for the first term of 2026-2027 are now ongoing. Check your schedules.',
        FALSE, '2026-08-24 08:00:00', '2026-09-04 17:00:00'),
    (10000002, 'Reminder: withdrawal period ends on November 20',
        'Students who wish to withdraw from a course must do so before the deadline.',
        TRUE,  '2026-11-01 08:00:00', '2026-11-20 17:00:00'),
    (10000002, 'Extended library hours during finals',
        'The library will open until 10 PM from December 1 to December 12.',
        FALSE, '2026-12-01 08:00:00', '2026-12-12 22:00:00');
