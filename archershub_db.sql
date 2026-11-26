-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Nov 26, 2026 at 08:49 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `archershub_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `academic_terms`
--

CREATE TABLE `academic_terms` (
  `term_id` int(11) NOT NULL,
  `academic_year` varchar(20) NOT NULL,
  `term_number` tinyint(4) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `enrollment_start` date DEFAULT NULL,
  `enrollment_end` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 0
) ;

--
-- Dumping data for table `academic_terms`
--

INSERT INTO `academic_terms` (`term_id`, `academic_year`, `term_number`, `start_date`, `end_date`, `enrollment_start`, `enrollment_end`, `is_active`) VALUES
(1, '2026-2027', 2, '2026-11-01', '2027-02-28', '2026-11-01', '2027-02-15', 1);

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `announcement_id` int(10) UNSIGNED NOT NULL,
  `title` varchar(150) NOT NULL,
  `contents` text DEFAULT NULL,
  `is_important` tinyint(1) NOT NULL DEFAULT 0,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('draft','published') NOT NULL DEFAULT 'draft',
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`announcement_id`, `title`, `contents`, `is_important`, `start_date`, `end_date`, `status`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'Test Announcement', 'Testing MariaDB announcement publishing.TEST TEST', 0, '2026-11-18', '2026-11-21', 'published', 3, '2026-11-19 08:30:45', '2026-11-19 10:41:16'),
(2, 'Welcome to ArchersHub - Title Edited', 'We\'ve re-designed ArchersHub so that students and faculty alike will finally have the good experience they deserve.\nEDITED ON NOVEMBER 20!!!', 0, '2026-11-18', '2026-11-26', 'published', 3, '2026-11-19 10:45:02', '2026-11-20 03:47:35'),
(3, 'Test Announcement 2', 'Test November 20\nHello world!!', 0, '2026-11-19', '2026-11-29', 'published', 3, '2026-11-20 03:44:58', '2026-11-20 03:44:58');

-- --------------------------------------------------------

--
-- Table structure for table `announcement_attachments`
--

CREATE TABLE `announcement_attachments` (
  `attachment_id` int(10) UNSIGNED NOT NULL,
  `announcement_id` int(10) UNSIGNED NOT NULL,
  `original_filename` varchar(255) NOT NULL,
  `stored_filename` varchar(100) NOT NULL,
  `mime_type` varchar(150) NOT NULL,
  `file_size` int(10) UNSIGNED NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `course_id` int(11) NOT NULL,
  `course_code` varchar(20) NOT NULL,
  `course_name` varchar(150) NOT NULL,
  `units` decimal(4,1) NOT NULL DEFAULT 3.0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`course_id`, `course_code`, `course_name`, `units`, `is_active`) VALUES
(1, 'CBAPDEV', 'Web Application Development', 3.0, 1),
(2, 'GEWORLD', 'The Contemporary World', 3.0, 1),
(3, 'SAS3000', 'Student Affairs Services 3000', 0.0, 1),
(4, 'GEETHIC', 'Ethics', 3.0, 1),
(5, 'LCLSONE', 'Lasallian Studies 1', 1.0, 1),
(6, 'CCPROG3', 'Computer Programming 3', 3.0, 1),
(7, 'ITNET01', 'Introduction to Computer Networks', 3.0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `enrollments`
--

CREATE TABLE `enrollments` (
  `enrollment_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `status` enum('enrolled','dropped') NOT NULL DEFAULT 'enrolled',
  `enrolled_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `dropped_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `enrollments`
--

INSERT INTO `enrollments` (`enrollment_id`, `student_id`, `section_id`, `status`, `enrolled_at`, `dropped_at`) VALUES
(1, 1, 1, 'dropped', '2026-11-26 13:32:34', '2026-11-26 13:32:47'),
(3, 1, 5, 'dropped', '2026-11-26 13:34:43', '2026-11-26 13:35:01'),
(4, 1, 6, 'enrolled', '2026-11-26 13:35:01', NULL),
(5, 1, 2, 'enrolled', '2026-11-26 13:35:30', NULL),
(8, 1, 4, 'enrolled', '2026-11-26 15:36:36', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `faculty_assignments`
--

CREATE TABLE `faculty_assignments` (
  `assignment_id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `faculty_assignments`
--

INSERT INTO `faculty_assignments` (`assignment_id`, `faculty_id`, `section_id`, `assigned_at`) VALUES
(1, 2, 2, '2026-11-26 11:36:44'),
(2, 2, 4, '2026-11-26 11:36:44'),
(3, 2, 6, '2026-11-26 11:36:44'),
(4, 2, 1, '2026-11-26 11:36:44');

-- --------------------------------------------------------

--
-- Table structure for table `grades`
--

CREATE TABLE `grades` (
  `grade_id` int(11) NOT NULL,
  `enrollment_id` int(11) NOT NULL,
  `encoded_by` int(11) NOT NULL,
  `grade` decimal(2,1) NOT NULL,
  `status` enum('draft','finalized') NOT NULL DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `finalized_at` timestamp NULL DEFAULT NULL
) ;

--
-- Dumping data for table `grades`
--

INSERT INTO `grades` (`grade_id`, `enrollment_id`, `encoded_by`, `grade`, `status`, `created_at`, `updated_at`, `finalized_at`) VALUES
(4, 5, 2, 4.0, 'draft', '2026-11-26 14:44:59', '2026-11-26 17:35:58', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `programs`
--

CREATE TABLE `programs` (
  `program_id` int(11) NOT NULL,
  `program_code` varchar(30) NOT NULL,
  `program_name` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `programs`
--

INSERT INTO `programs` (`program_id`, `program_code`, `program_name`) VALUES
(1, 'BSIT', 'Bachelor of Science in Information Technology'),
(2, 'BSCS', 'Bachelor of Science in Computer Science'),
(3, 'BSIS', 'Bachelor of Science in Information Systems');

-- --------------------------------------------------------

--
-- Table structure for table `sections`
--

CREATE TABLE `sections` (
  `section_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `term_id` int(11) NOT NULL,
  `section_code` varchar(20) NOT NULL,
  `campus` enum('Laguna','Manila') NOT NULL,
  `capacity` int(11) NOT NULL DEFAULT 40,
  `status` enum('open','closed','cancelled') NOT NULL DEFAULT 'open'
) ;

--
-- Dumping data for table `sections`
--

INSERT INTO `sections` (`section_id`, `course_id`, `term_id`, `section_code`, `campus`, `capacity`, `status`) VALUES
(1, 1, 1, 'X01', 'Laguna', 40, 'open'),
(2, 2, 1, 'XZ08', 'Laguna', 40, 'open'),
(3, 3, 1, 'X05', 'Laguna', 40, 'open'),
(4, 4, 1, 'XZ09', 'Laguna', 40, 'open'),
(5, 5, 1, 'XB1A', 'Laguna', 40, 'open'),
(6, 5, 1, 'XB2A', 'Laguna', 40, 'open'),
(7, 6, 1, 'S11', 'Manila', 40, 'open'),
(8, 7, 1, 'S12', 'Manila', 40, 'open');

-- --------------------------------------------------------

--
-- Table structure for table `section_schedules`
--

CREATE TABLE `section_schedules` (
  `schedule_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `day_of_week` enum('MON','TUE','WED','THU','FRI','SAT','SUN') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `room` varchar(50) DEFAULT NULL,
  `delivery_mode` enum('onsite','online','hybrid') NOT NULL DEFAULT 'onsite'
) ;

--
-- Dumping data for table `section_schedules`
--

INSERT INTO `section_schedules` (`schedule_id`, `section_id`, `day_of_week`, `start_time`, `end_time`, `room`, `delivery_mode`) VALUES
(1, 2, 'MON', '19:30:00', '21:00:00', 'online', 'online'),
(2, 2, 'THU', '19:30:00', '21:00:00', 'LR302', 'onsite'),
(3, 3, 'SAT', '10:00:00', '16:00:00', 'EXR004', 'onsite'),
(4, 4, 'MON', '21:15:00', '22:45:00', 'online', 'online'),
(5, 4, 'THU', '21:15:00', '22:45:00', 'LR302', 'onsite'),
(6, 5, 'SAT', '09:15:00', '10:45:00', 'EXR004', 'onsite'),
(7, 6, 'SAT', '09:15:00', '10:45:00', 'EXR005', 'onsite'),
(8, 7, 'MON', '10:00:00', '11:30:00', 'G301', 'onsite'),
(9, 8, 'TUE', '13:00:00', '15:00:00', 'G302', 'onsite');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `school_id` varchar(30) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('student','faculty','admin') NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `program_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `school_id`, `first_name`, `middle_name`, `last_name`, `email`, `password_hash`, `role`, `status`, `program_id`, `created_at`) VALUES
(1, '12345678', 'Juan', NULL, 'Dela Cruz', 'juan.demo@example.test', '$2y$10$x7SYJYv8.1ipCv4fzmxZ8eebI23PRhR6b4n7DilHbVjfBep.5hwDi', 'student', 'active', 1, '2026-11-19 01:56:43'),
(2, 'FAC10001', 'Maria', NULL, 'Santos', 'maria.demo@example.test', '$2y$10$cVakwusB2c3bvzP6ijTnKOrWrQ4AmRlm9G6wC432g/j7ZLnvaS9J.', 'faculty', 'active', NULL, '2026-11-19 01:56:43'),
(3, 'ADM10001', 'Alex', NULL, 'Reyes', 'alex.demo@example.test', '$2y$10$CwP5am2hyfPoiKK0tplR9.5Tj3W9R0fqX3bl5foe6js57cEChIy3i', 'admin', 'active', NULL, '2026-11-19 01:56:43'),
(4, '87654322', 'Garcia', NULL, 'Miguel', 'carlos.garcia@example.com', '$2y$10$cmeVBq1Jma077WK718L49eVF/53.qhN8sec6vk.TXIFRvep5J6LVm', 'student', 'active', NULL, '2026-11-19 06:59:10'),
(7, '99990002', 'Registration', NULL, 'Test', 'registration.test@dlsu.edu.ph', '$2y$10$SjnbvdbYBmWqyJIY5BB/DuARaC0w3UXKxtXH6YvoEj9lwGyySlWia', 'student', 'active', 1, '2026-11-26 19:39:16'),
(10, '12202648', 'Elliot', NULL, 'Fletcher', 'elliot_fletcher@dlsu.edu.ph', '$2y$10$gUIcRxZ8JFJyOGvFKuaJDOdF64duWdmx8o8m720kugm0pIfdhcw/q', 'student', 'active', 3, '2026-11-26 19:48:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `academic_terms`
--
ALTER TABLE `academic_terms`
  ADD PRIMARY KEY (`term_id`),
  ADD UNIQUE KEY `uq_academic_term` (`academic_year`,`term_number`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`announcement_id`),
  ADD KEY `idx_announcement_visibility` (`status`,`start_date`,`end_date`),
  ADD KEY `fk_announcements_created_by` (`created_by`);

--
-- Indexes for table `announcement_attachments`
--
ALTER TABLE `announcement_attachments`
  ADD PRIMARY KEY (`attachment_id`),
  ADD UNIQUE KEY `uq_attachment_filename` (`stored_filename`),
  ADD KEY `idx_attachment_announcement` (`announcement_id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`course_id`),
  ADD UNIQUE KEY `uq_course_code` (`course_code`);

--
-- Indexes for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`enrollment_id`),
  ADD UNIQUE KEY `uq_student_section` (`student_id`,`section_id`),
  ADD KEY `idx_enrollment_section_status` (`section_id`,`status`);

--
-- Indexes for table `faculty_assignments`
--
ALTER TABLE `faculty_assignments`
  ADD PRIMARY KEY (`assignment_id`),
  ADD UNIQUE KEY `uq_faculty_section` (`faculty_id`,`section_id`),
  ADD KEY `fk_assignment_section` (`section_id`);

--
-- Indexes for table `grades`
--
ALTER TABLE `grades`
  ADD PRIMARY KEY (`grade_id`),
  ADD UNIQUE KEY `uq_grade_enrollment` (`enrollment_id`),
  ADD KEY `fk_grade_faculty` (`encoded_by`);

--
-- Indexes for table `programs`
--
ALTER TABLE `programs`
  ADD PRIMARY KEY (`program_id`),
  ADD UNIQUE KEY `program_code` (`program_code`);

--
-- Indexes for table `sections`
--
ALTER TABLE `sections`
  ADD PRIMARY KEY (`section_id`),
  ADD UNIQUE KEY `uq_section_offering` (`course_id`,`term_id`,`section_code`,`campus`),
  ADD KEY `idx_section_term` (`term_id`);

--
-- Indexes for table `section_schedules`
--
ALTER TABLE `section_schedules`
  ADD PRIMARY KEY (`schedule_id`),
  ADD KEY `idx_schedule_section` (`section_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `school_id` (`school_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `program_id` (`program_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `academic_terms`
--
ALTER TABLE `academic_terms`
  MODIFY `term_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `announcement_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `announcement_attachments`
--
ALTER TABLE `announcement_attachments`
  MODIFY `attachment_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `course_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `enrollments`
--
ALTER TABLE `enrollments`
  MODIFY `enrollment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `faculty_assignments`
--
ALTER TABLE `faculty_assignments`
  MODIFY `assignment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `grades`
--
ALTER TABLE `grades`
  MODIFY `grade_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `programs`
--
ALTER TABLE `programs`
  MODIFY `program_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `sections`
--
ALTER TABLE `sections`
  MODIFY `section_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `section_schedules`
--
ALTER TABLE `section_schedules`
  MODIFY `schedule_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `fk_announcements_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `announcement_attachments`
--
ALTER TABLE `announcement_attachments`
  ADD CONSTRAINT `fk_attachment_announcement` FOREIGN KEY (`announcement_id`) REFERENCES `announcements` (`announcement_id`);

--
-- Constraints for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD CONSTRAINT `fk_enrollment_section` FOREIGN KEY (`section_id`) REFERENCES `sections` (`section_id`),
  ADD CONSTRAINT `fk_enrollment_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `faculty_assignments`
--
ALTER TABLE `faculty_assignments`
  ADD CONSTRAINT `fk_assignment_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `fk_assignment_section` FOREIGN KEY (`section_id`) REFERENCES `sections` (`section_id`);

--
-- Constraints for table `grades`
--
ALTER TABLE `grades`
  ADD CONSTRAINT `fk_grade_enrollment` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`enrollment_id`),
  ADD CONSTRAINT `fk_grade_faculty` FOREIGN KEY (`encoded_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `sections`
--
ALTER TABLE `sections`
  ADD CONSTRAINT `fk_sections_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`),
  ADD CONSTRAINT `fk_sections_term` FOREIGN KEY (`term_id`) REFERENCES `academic_terms` (`term_id`);

--
-- Constraints for table `section_schedules`
--
ALTER TABLE `section_schedules`
  ADD CONSTRAINT `fk_schedule_section` FOREIGN KEY (`section_id`) REFERENCES `sections` (`section_id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `programs` (`program_id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
