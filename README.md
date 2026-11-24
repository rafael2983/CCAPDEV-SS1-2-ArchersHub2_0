# ArchersHub 2.0

A student portal for enlistment, schedules, records, organizations, and announcements. Built with **PHP, MySQL, and Apache** (LAMP) using the **MVC** pattern.

---

## Table of Contents

1. [Project Structure Overview](#project-structure-overview)
2. [Setup Guide: Windows (XAMPP)](#setup-guide-windows-xampp)
3. [Setup Guide: macOS (MAMP)](#setup-guide-macos-mamp)
4. [Setup Guide: Linux (Ubuntu / Debian LAMP)](#setup-guide-linux-ubuntu--debian-lamp)
5. [Default Login & Resetting the Database](#default-login--resetting-the-database)
6. [Troubleshooting](#troubleshooting)

---

## Project Structure Overview

Before starting, verify that you have the root project directory. Whether you cloned the repository or extracted a `.zip` archive, open the folders until you see `index.php`, `backEnd/`, and `frontEnd/` side by side. **That directory is your project root**, which must be placed in your web server's document root and named **`archershub`**.

```text
archershub/
├── index.php
├── archershub_query.sql       # Database schema (run first)
├── archershub_seed.sql        # Sample accounts & data (run second)
├── backEnd/
│   └── config/
│       └── config.example.php # Template for your local config.php
└── frontEnd/
```

> **Important:** The folder name **`archershub`** must match the `base_url` setting in your configuration file.

---

## Setup Guide: Windows (XAMPP)

### Step 1: Install and Start XAMPP
1. Download XAMPP from [apachefriends.org](https://www.apachefriends.org) and run the installer with default settings (installs to `C:\xampp`).
2. Open the **XAMPP Control Panel**.
3. Click **Start** next to **Apache** and **MySQL**. Wait until both module labels turn green.

### Step 2: Place the Project in `htdocs`
1. Navigate to your **Downloads** folder, right-click the downloaded `.zip` file, and select **Extract All...**
2. Locate the inner folder containing `index.php`, `backEnd`, and `frontEnd`.
3. Move or copy that folder into `C:\xampp\htdocs\` and rename it to **`archershub`**.
4. Confirm the path looks like this: `C:\xampp\htdocs\archershub\index.php`.

### Step 3: Create and Configure `config.php`
1. Open `C:\xampp\htdocs\archershub\backEnd\config\`.
2. Duplicate `config.example.php` and rename the copy to **`config.php`**.
   * *Tip:* In File Explorer, enable **View > Show > File name extensions** to ensure it is not accidentally named `config.php.txt`.
3. Open `config.php` in a text editor (e.g., VS Code or Notepad) and update the values:

| Setting | Value |
| :--- | :--- |
| `base_url` | `/archershub` |
| `db_host` | `127.0.0.1` |
| `db_port` | `3306` |
| `db_name` | `archershub` |
| `db_user` | `root` |
| `db_pass` | `''` *(leave empty)* |

### Step 4: Import the Database
1. Open your browser and navigate to `http://localhost/phpmyadmin`.
2. Click the **Import** tab at the top of the page (do **not** select an existing database first; the SQL script creates `archershub` automatically).
3. Click **Choose File**, select `archershub_query.sql` from your `archershub` folder, and click **Import** at the bottom.
4. Click the **Import** tab again, select `archershub_seed.sql`, and click **Import**.
   * **Note:** Always import `archershub_query.sql` **before** `archershub_seed.sql`.

### Step 5: Launch the Application
Open your browser and go to: **`http://localhost/archershub/`**

---

## Setup Guide: macOS (MAMP)

### Step 1: Install and Start MAMP
1. Download MAMP (free version) from [mamp.info](https://www.mamp.info) and install it into your `/Applications` folder.
2. Open **MAMP** from Applications.
3. Click **Start** (top right) to launch both the Apache and MySQL servers. Wait for the indicator dots to turn green.

### Step 2: Place the Project in `htdocs`
1. Double-click the downloaded `.zip` file in **Downloads** to extract it.
2. Locate the folder containing `index.php`, `backEnd`, and `frontEnd`.
3. Move that folder to `/Applications/MAMP/htdocs/` and rename it to **`archershub`**.
4. Confirm the path looks like this: `/Applications/MAMP/htdocs/archershub/index.php`.

### Step 3: Create and Configure `config.php`
1. Navigate to `/Applications/MAMP/htdocs/archershub/backEnd/config/`.
2. Copy `config.example.php` and rename the copy to **`config.php`**.
3. Open `config.php` in TextEdit, VS Code, or via Terminal (`nano config.php`) and set the MAMP-specific defaults:

| Setting | Value |
| :--- | :--- |
| `base_url` | `/archershub` |
| `db_host` | `127.0.0.1` |
| `db_port` | `8889` *(MAMP's default MySQL port)* |
| `db_name` | `archershub` |
| `db_user` | `root` |
| `db_pass` | `root` *(MAMP's default MySQL password)* |

### Step 4: Import the Database
1. In the MAMP window, click **WebStart** (or open `http://localhost:8888/phpMyAdmin/` in your browser).
2. Click the **Import** tab at the top without selecting a database on the left.
3. Click **Choose File**, select `/Applications/MAMP/htdocs/archershub/archershub_query.sql`, and click **Import**.
4. Repeat the process to import `archershub_seed.sql`.

### Step 5: Launch the Application
Because MAMP defaults to port `8888` for Apache, open your browser and go to: **`http://localhost:8888/archershub/`**

---

## Setup Guide: Linux (Ubuntu / Debian LAMP)

### Step 1: Install Apache, PHP, and MariaDB/MySQL
Open your terminal and run the following commands to update your package index and install the required LAMP stack packages:

```bash
sudo apt update
sudo apt install apache2 php libapache2-mod-php php-mysql mariadb-server unzip -y
```

Ensure both services are running and enabled on boot:

```bash
sudo systemctl enable --now apache2
sudo systemctl enable --now mariadb
```

### Step 2: Move Project Files and Set Permissions
1. Extract your downloaded archive (assuming it is in `~/Downloads/`):
   ```bash
   unzip ~/Downloads/*.zip -d ~/Downloads/archershub_extracted
   ```
2. Move the folder containing `index.php`, `backEnd`, and `frontEnd` to Apache's document root as **`archershub`**:
   ```bash
   sudo mv ~/Downloads/archershub_extracted/path/to/root /var/www/html/archershub
   ```
   *(Adjust the source path so `/var/www/html/archershub/index.php` exists directly inside it.)*
3. Set appropriate ownership so Apache (`www-data`) can read and serve the files:
   ```bash
   sudo chown -R www-data:www-data /var/www/html/archershub
   sudo chmod -R 755 /var/www/html/archershub
   ```

### Step 3: Create a Dedicated Database User
On modern Linux distributions, the database `root` user uses `unix_socket` authentication and cannot be used directly by PHP web applications. Create a dedicated database user for ArchersHub:

1. Open the MySQL/MariaDB shell:
   ```bash
   sudo mysql
   ```
2. Run the following SQL commands (replace `'your_user'` and `'your_password'` with your own credentials):
   ```sql
   CREATE USER 'your_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON archershub.* TO 'your_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

### Step 4: Import the Database via CLI
Navigate to your project directory and import the schema first, followed by the seed data:

```bash
cd /var/www/html/archershub
sudo mysql < archershub_query.sql
sudo mysql < archershub_seed.sql
```

### Step 5: Create and Configure `config.php`
1. Copy the example configuration file:
   ```bash
   sudo cp /var/www/html/archershub/backEnd/config/config.example.php /var/www/html/archershub/backEnd/config/config.php
   ```
2. Edit `config.php` using `nano` or your preferred editor:
   ```bash
   sudo nano /var/www/html/archershub/backEnd/config/config.php
   ```
3. Set the following values (using the credentials you created in Step 3):

| Setting | Value |
| :--- | :--- |
| `base_url` | `/archershub` |
| `db_host` | `127.0.0.1` |
| `db_port` | `3306` |
| `db_name` | `archershub` |
| `db_user` | `your_user` |
| `db_pass` | `your_password` |

### Step 6: Launch the Application
Open your browser and go to: **`http://localhost/archershub/`**

---

## Default Login & Resetting the Database

### Test Account
Once the site loads, log in using the sample account created by `archershub_seed.sql`:
* **ID:** `12300001`
* **Password:** `Password123`

### Resetting the Database
If you need a clean slate:
* **Windows / macOS (phpMyAdmin):** Select `archershub` in the left sidebar, click **Operations** at the top, and select **Drop the database (DROP)**. Then re-import `archershub_query.sql` and `archershub_seed.sql`.
* **Linux (CLI):**
  ```bash
  sudo mysql -e "DROP DATABASE IF EXISTS archershub;"
  cd /var/www/html/archershub
  sudo mysql < archershub_query.sql && sudo mysql < archershub_seed.sql
  ```

---

## Troubleshooting

* **Apache will not start on Windows:** Another program (such as Skype, IIS, or VMware) is occupying port `80`. Close the conflicting application, or in XAMPP click **Config > Service and Port Settings** to change Apache's main port (e.g., to `8080`, which changes your URL to `http://localhost:8080/archershub/`).
* **Database Connection Error:** Double-check that MySQL/MariaDB is actively running and that `db_port`, `db_user`, and `db_pass` in `backEnd/config/config.php` match your OS setup (`3306` / empty password on XAMPP; `8889` / `root` on MAMP; custom user on Linux).
* **404 Not Found or Broken Styling/Links:** Ensure the folder inside `htdocs` or `/var/www/html/` is named **`archershub`** in all lowercase and that `base_url` in `config.php` is set to `'/archershub'` without a trailing slash.
* **Git Note:** `config.php` is listed in `.gitignore` so each developer maintains their own local database credentials without affecting the repository.