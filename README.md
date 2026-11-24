# ArchersHub 2.0

A student portal for enlistment, schedules, records, organizations, and announcements. Built with **PHP, MySQL, and Apache** (LAMP) using the **MVC** pattern.

## Table of Contents

1. [Project Structure Overview](#project-structure-overview)
2. [Quick start (Windows + XAMPP)](#quick-start-windows--xampp)
3. [Linux setup (Ubuntu / Linux Mint)](#linux-setup-ubuntu--linux-mint)
4. [Mac setup (MAMP)](#mac-setup-mamp)
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
    └── uploads/               # User uploads directory
```

> **Important:** The folder name **`archershub`** must match the `base_url` setting in your configuration file.

---

## Quick start (Windows + XAMPP)

This is for someone who just downloaded the project as a `.zip` and it is sitting in the **Downloads** folder.

### 1. Install XAMPP

1. Download XAMPP from https://www.apachefriends.org and install it with the default options (it installs to `C:\xampp`).
2. Open the **XAMPP Control Panel** and click **Start** next to **Apache** and **MySQL**. Both should turn green.

> If Apache will not start, another program is using port 80 (Skype and IIS are common). Close it, or click **Config > Service and Port Settings** to change the Apache port.

### 2. Unzip the project into `htdocs`

1. Open **Downloads**, right-click the `.zip`, and choose **Extract All...**
2. Open the extracted folder. Keep going inside until you see `index.php`, `backEnd`, and `frontEnd` side by side. **That** is the project folder.
3. Copy that folder into `C:\xampp\htdocs\` and rename it to **`archershub`**.

You should end up with `C:\xampp\htdocs\archershub\index.php`.

> The folder name matters. The app is opened at `http://localhost/archershub/`, and the same name goes in the config file in the next step.

### 3. Create your config file

1. Go to `C:\xampp\htdocs\archershub\backEnd\config\`.
2. Copy `config.example.php` and rename the **copy** to `config.php`.
3. Open `config.php` in Notepad (or VS Code) and set:

| Setting | Value |
|---|---|
| `base_url` | `/archershub` (must match the folder name from step 2) |
| `db_host` | `127.0.0.1` |
| `db_port` | `3306` |
| `db_name` | `archershub` |
| `db_user` | `root` |
| `db_pass` | leave empty (`''`) |

> **Make sure the file is really named `config.php`**, not `config.php.txt`. In File Explorer, turn on **View > Show > File name extensions** to check.
> `config.php` is ignored by git, so each person uses their own.

### 4. Load the database

1. Make sure **MySQL** is running (green) in the XAMPP Control Panel.
2. Open http://localhost/phpmyadmin in your browser.
3. Click the **Import** tab at the top. Do **not** select a database first. The file creates `archershub` by itself.
4. Click **Choose File**, pick `archershub_query.sql` from the project folder, and click **Import** at the bottom. This creates the tables.
5. Click the **Import** tab again, pick `archershub_seed.sql`, and click **Import**. This adds the sample accounts and data.

**Always import the two files in that order.**

### 5. Open it

Go to **http://localhost/archershub/** and log in with a test account below (for example ID `12300001`, password `Password123`).

---

## Linux setup (Ubuntu / Linux Mint)

Open a terminal and run each step in order.

### 1. Install Apache, PHP and the database

```bash
sudo apt update
sudo apt install apache2 php libapache2-mod-php php-mysql php-mbstring mariadb-server unzip
```

> `php-mbstring` must be listed. On Linux it is a separate package and is **not** installed by default.
> Check the PHP version with `php -v`. It must be 8.0 or newer.

### 2. Unzip the project into Apache's folder

```bash
cd ~/Downloads
unzip <name-of-the-zip-file>.zip
```

Look inside the new folder until you find the one that has `index.php` in it, then copy it:

```bash
sudo cp -r <path-to-folder-with-index.php> /var/www/html/archershub
```

Give yourself permission to edit it, and let Apache write uploaded files:

```bash
sudo chown -R $USER:www-data /var/www/html/archershub
sudo chmod -R 775 /var/www/html/archershub/frontEnd/uploads
```

### 3. Create the config file

```bash
cd /var/www/html/archershub
cp backEnd/config/config.example.php backEnd/config/config.php
nano backEnd/config/config.php
```

Set `base_url` to `/archershub`, `db_name` to `archershub`, and use the database user you create in step 4.
In nano: save with `Ctrl+O` then `Enter`, exit with `Ctrl+X`.

### 4. Load the database and create a database user

```bash
sudo systemctl start mariadb
sudo mysql < archershub_query.sql
sudo mysql < archershub_seed.sql
sudo mysql
```

In the MariaDB prompt that opens, run this (use your own name and password, and put the same ones in `config.php`), then type `exit;`:

```sql
CREATE USER 'archers'@'localhost' IDENTIFIED BY 'choose_a_password';
GRANT ALL PRIVILEGES ON archershub.* TO 'archers'@'localhost';
FLUSH PRIVILEGES;
```

> Do not use `root` in `config.php` on Linux. PHP usually cannot log in as `root`.

### 5. Start Apache and open it

```bash
sudo systemctl start apache2
```

Go to **http://localhost/archershub/**

---

## Mac setup (MAMP)

1. Download **MAMP** (the free version) from https://www.mamp.info and install it.
2. Open MAMP and go to **MAMP > Preferences > PHP**. Pick a PHP version that is **8.0 or newer**.
3. Click **Start Servers**. Wait until the Apache and MySQL lights are green.
4. Open **Finder > Downloads**, double-click the `.zip` to unzip it, and find the folder that has `index.php` in it.
5. Copy that folder to `/Applications/MAMP/htdocs/` and rename it `archershub`.
6. In `archershub/backEnd/config/`, copy `config.example.php` to `config.php` and set:

| Setting | Value |
|---|---|
| `base_url` | `/archershub` |
| `db_host` | `127.0.0.1` |
| `db_port` | `8889` |
| `db_name` | `archershub` |
| `db_user` | `root` |
| `db_pass` | `root` |

7. On the MAMP start page, open **Tools > phpMyAdmin**. Click the **Import** tab, import `archershub_query.sql`, then import `archershub_seed.sql`.
8. Go to **http://localhost:8888/archershub/**

> MAMP uses port `8888` for the website and `8889` for the database. If you changed the ports in MAMP preferences, use your own numbers.

---

## Default Login & Resetting the Database

### Test Account
Once the site loads, log in using the sample account created by `archershub_seed.sql`:
* **ID:** `12300001`
* **Password:** `Password123`

### To start over (Resetting the Database)
* **Windows / macOS (phpMyAdmin):** Click `archershub` on the left, go to **Operations > Delete the database** (or **Drop the database**), then re-import `archershub_query.sql` followed by `archershub_seed.sql`.
* **Linux (CLI):**
  ```bash
  sudo mysql -e "DROP DATABASE IF EXISTS archershub;"
  cd /var/www/html/archershub
  sudo mysql < archershub_query.sql && sudo mysql < archershub_seed.sql
  ```

---

## Troubleshooting

* **Apache will not start on Windows:** Another program (such as Skype or IIS) is occupying port `80`. Close the conflicting application, or in XAMPP click **Config > Service and Port Settings** to change Apache's main port.
* **Database Connection Error:** Double-check that MySQL/MariaDB is actively running and that `db_port`, `db_user`, and `db_pass` in `backEnd/config/config.php` match your OS setup (`3306` / empty password on XAMPP; `8889` / `root` on MAMP; your dedicated user on Linux).
* **404 Not Found or Broken Styling/Links:** Ensure the folder inside `htdocs` or `/var/www/html/` is named **`archershub`** in all lowercase and that `base_url` in `config.php` is set to `'/archershub'`.
* **Git Note:** `config.php` is ignored by git so each person uses their own local database credentials.