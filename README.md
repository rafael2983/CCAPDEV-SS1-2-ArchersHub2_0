# ArchersHub 2.0

LAMP stack (Linux, Apache, MySQL/MariaDB, PHP) using the MVC pattern.

## Setup (local)

### 1. Requirements
- Apache 2.4
- PHP 8 with the PDO MySQL driver
- MySQL 8 or MariaDB

| OS | How to get them |
|---|---|
| Linux (Ubuntu / Mint) | `sudo apt install apache2 php libapache2-mod-php php-mysql mysql-server` |
| Windows | Install [XAMPP](https://www.apachefriends.org) (Apache, PHP, and MariaDB in one installer) |
| macOS | Install MAMP, or use Homebrew |

### 2. Serve the project folder
The app must be reachable under a folder name, for example `http://localhost/archershub/`.

- **Windows (XAMPP) / macOS (MAMP):** put the project folder inside `htdocs`. The URL is `http://localhost/<folder-name>/`.
- **Linux:** create an Apache alias so the project can stay where you cloned it:

```bash
sudo nano /etc/apache2/conf-available/archershub.conf
```

```apache
Alias /archershub /full/path/to/the/project

<Directory /full/path/to/the/project>
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>
```

```bash
chmod o+x /home/<your-username>
sudo a2enconf archershub
sudo systemctl restart apache2
```

The `chmod` lets Apache enter your home folder. Without it you get a `403 Forbidden`.

### 3. Configuration
Copy the template to a real config file:

| OS | Command |
|---|---|
| Windows (Command Prompt) | `copy backEnd\config\config.example.php backEnd\config\config.php` |
| Windows (PowerShell / Git Bash), macOS, Linux | `cp backEnd/config/config.example.php backEnd/config/config.php` |

Then open `backEnd/config/config.php` and fill in your own values:

| Setting | What it is |
|---|---|
| `base_url` | The folder path from the URL, for example `/archershub` |
| `db_host` | Usually `127.0.0.1` |
| `db_port` | Usually `3306` |
| `db_name` | `archershub` |
| `db_user` | Your MySQL user (XAMPP default: `root`) |
| `db_pass` | Your MySQL password (XAMPP default: empty) |

`config.php` is ignored by git, so each person uses their own values.

### 4. Create the database
Open the MySQL shell:

| OS | How |
|---|---|
| Linux | `sudo mysql` |
| Windows (XAMPP) | XAMPP Control Panel, click **Shell**, then `mysql -u root` |
| macOS | `mysql -u root -p` |

Load the schema, using the full path to the file with forward slashes:

```sql
SOURCE /full/path/to/archershub_query.sql;
```

(In XAMPP you can also use phpMyAdmin: **Import**, choose `archershub_query.sql`.)

On Linux, the MySQL `root` user often cannot log in from PHP. Create a dedicated user and put its details in `config.php`:

```sql
CREATE USER 'your_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON archershub.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

### 5. Add test accounts
The schema does not insert any data, so add a college, a program, and a few accounts. Passwords are stored as plain text for this phase (hashing comes later).

```sql
USE archershub;

INSERT INTO college (name) VALUES ('College of Computer Studies');
INSERT INTO program (college_id, name) VALUES (LAST_INSERT_ID(), 'BS Computer Science');

INSERT INTO users (user_id, email, password_hash, role, first_name, last_name)
VALUES (1, 'admin@example.com', 'admin1234', 'Admin', 'Test', 'Admin');

INSERT INTO users (user_id, email, password_hash, role, first_name, last_name)
VALUES (12345678, 'student@example.com', 'student1234', 'Student', 'Test', 'Student');

INSERT INTO student (user_id, program_id, academic_status, campus)
VALUES (12345678, (SELECT program_id FROM program WHERE name = 'BS Computer Science'), 'Active', 'Manila');
```

Run the college and program lines one after the other, with nothing in between. To test the other roles, add more rows to `users` with the role `Teacher`, `APO`, or `Provost` (those don't need a `student` row).

### 6. Run
Open `http://localhost/<folder-name>/`. You are sent to the login page. Log in with either the email or the user ID, for example `admin@example.com` or `12345678`, and the password from step 5.
`frontEnd/scripts/nav.js` for the hamburger menu, dark mode, and filter panel
