-- Online Public Complaint Management System
-- Database schema implementing the ERD in Section 4.3 of the proposal:
-- CITIZEN, DEPARTMENT, OFFICER, COMPLAINT, RESPONSE

CREATE DATABASE IF NOT EXISTS complaint_management_system;
USE complaint_management_system;

-- 1. CITIZEN ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS citizen (
    citizen_id      INT AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(150) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    phone_number    VARCHAR(20)  NOT NULL UNIQUE,
    national_id     VARCHAR(20)  NULL,
    password_hash   VARCHAR(255) NOT NULL,
    date_registered TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. DEPARTMENT -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS department (
    dept_id   INT AUTO_INCREMENT PRIMARY KEY,
    dept_name VARCHAR(100) NOT NULL UNIQUE
);

-- 3. OFFICER (many Officers -> one Department) -------------------------------
CREATE TABLE IF NOT EXISTS officer (
    officer_id    INT AUTO_INCREMENT PRIMARY KEY,
    full_name     VARCHAR(150) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    department_id INT NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_admin      BOOLEAN DEFAULT FALSE, -- TRUE = System Administrator role
    FOREIGN KEY (department_id) REFERENCES department(dept_id)
);

-- 4. COMPLAINT (one Citizen -> many Complaints, one Officer -> many Complaints)
CREATE TABLE IF NOT EXISTS complaint (
    complaint_id   INT AUTO_INCREMENT PRIMARY KEY,
    reference_no   VARCHAR(20) NOT NULL UNIQUE,
    title          VARCHAR(200) NOT NULL,
    description    TEXT NOT NULL,
    category       ENUM('Roads','Water','Sanitation','Public Health','Other') NOT NULL,
    location       VARCHAR(200) NOT NULL,
    photo_url      VARCHAR(255) NULL,
    status         ENUM('Pending','In Progress','Resolved','Rejected') DEFAULT 'Pending',
    date_submitted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_resolved  TIMESTAMP NULL,
    citizen_id     INT NOT NULL,
    officer_id     INT NULL,
    FOREIGN KEY (citizen_id) REFERENCES citizen(citizen_id),
    FOREIGN KEY (officer_id) REFERENCES officer(officer_id)
);

-- 5. RESPONSE (one Complaint -> many Responses) ------------------------------
CREATE TABLE IF NOT EXISTS response (
    response_id    INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id   INT NOT NULL,
    officer_id     INT NOT NULL,
    message        TEXT NOT NULL,
    date_responded TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaint(complaint_id),
    FOREIGN KEY (officer_id) REFERENCES officer(officer_id)
);

-- Helpful indexes for the dashboards / reporting sub-module (Section 4.4.5)
CREATE INDEX idx_complaint_status ON complaint(status);
CREATE INDEX idx_complaint_citizen ON complaint(citizen_id);
CREATE INDEX idx_complaint_officer ON complaint(officer_id);
CREATE INDEX idx_complaint_category ON complaint(category);

-- Seed departments referenced by the complaint categories
INSERT INTO department (dept_name) VALUES
    ('Roads'), ('Water'), ('Sanitation'), ('Public Health'), ('General Services')
ON DUPLICATE KEY UPDATE dept_name = VALUES(dept_name);
