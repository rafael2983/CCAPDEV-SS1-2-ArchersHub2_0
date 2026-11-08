ArchersHub 2.0
Setup

These steps work on Windows, macOS, and Linux. Where commands differ, each OS is listed.

1. Requirements

Node.js (LTS)

Windows / macOS: download the LTS installer from nodejs.org.
Linux: install with nvm (nvm install --lts). The version in apt is often too old.

Check it worked (open a new terminal first):

bash
node -v
npm -v

MySQL 8

Windows: MySQL Installer.
macOS: brew install mysql, then brew services start mysql.
Linux (Ubuntu / Mint): sudo apt install mysql-server, then sudo systemctl start mysql.

2. Install backend dependencies
bash
cd backEnd
npm install

3. Environment variables

Copy the template to a real .env file in the project root (same folder as archershub_query.sql):

OS	Command
Windows (Command Prompt)	copy .env.example .env
Windows (PowerShell / Git Bash), macOS, Linux	cp .env.example .env

Then open .env and fill in your own values:

PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=<your mysql user>
DB_PASSWORD=<your mysql password>
DB_NAME=archershub

.env is ignored by git, so each person uses their own credentials.

4. Create the database

Open the MySQL shell:

OS	Command
Windows	Open MySQL Command Line Client from the Start menu, or run mysql -u root -p
macOS	mysql -u root -p
Linux	sudo mysql

Inside the MySQL shell, load the schema. Use the full path to the file, with forward slashes (this works on Windows too):

sql
SOURCE /full/path/to/archershub_query.sql;

Check that it worked:

sql
USE archershub;
SHOW TABLES;

Which MySQL user goes in .env?

Windows / macOS: you can usually use root and the password you set.
Linux: root often uses socket authentication and cannot log in from Node ("Access denied"). Create a dedicated user in the MySQL shell instead:
CREATE USER 'your_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON archershub.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;

Then use your_user and your_password in .env. (Any OS can use this approach if you prefer not to use root.)

5. Add a test user

The schema does not insert any users, and passwords must be bcrypt hashes. Generate one (same command on every OS):
cd backEnd
node -e "require('bcrypt').hash('your_test_password', 10).then(console.log)"

Copy the line it prints (it starts with $2b$10$). Then, in the MySQL shell:

sql
USE archershub;
INSERT INTO users (user_id, email, password_hash, role, first_name, last_name)
VALUES (1, 'test@example.com', '<paste hash>', 'Admin', 'Test', 'User');

Note: paste hash means the printed line when using the node command

Keep the quotes around the email and the hash.

6. Run the backend
bash
cd backEnd
npm run dev

Expected output:

Sequelize connected to MySQL
ArchersHub API running at http://localhost:3000
