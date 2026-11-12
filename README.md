# ArchersHub 2.0

A student portal for enlistment, schedules, records, organizations and announcements.
Built with **PHP, MySQL and Apache** (LAMP) using the **MVC** pattern.


## Quick start

You need: **Apache 2.4**, **PHP 8** (with PDO MySQL) and **MySQL 8 or MariaDB**.

| OS | Install |
|---|---|
| Windows | [XAMPP](https://www.apachefriends.org) (includes all three) |
| macOS | MAMP, or Homebrew |
| Linux (Ubuntu / Mint) | `sudo apt install apache2 php libapache2-mod-php php-mysql mysql-server` |

### 1. Put the project where Apache can serve it

The app must run inside a folder, for example `http://localhost/archershub/`.

**Windows / macOS:** copy the project folder into `htdocs`.

**Linux:** keep the project where you cloned it and add an Apache alias:

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

> The `chmod` lets Apache enter your home folder. Skip it and you get **403 Forbidden**.

### 2. Create your config file

```bash
cp backEnd/config/config.example.php backEnd/config/config.php
```

On Windows Command Prompt, use `copy` with backslashes instead.

Open `backEnd/config/config.php` and fill in:

| Setting | Value |
|---|---|
| `base_url` | The folder name from the URL, for example `/archershub` |
| `db_host` | `127.0.0.1` |
| `db_port` | `3306` |
| `db_name` | `archershub` |
| `db_user` | Your MySQL user (XAMPP default: `root`) |
| `db_pass` | Your MySQL password (XAMPP default: empty) |

`config.php` is ignored by git, so everyone uses their own values.

### 3. Load the database

Open the MySQL shell (`sudo mysql` on Linux, `mysql -u root -p` on macOS, or the **Shell** button in XAMPP), then run these **in order**:

```sql
SOURCE /full/path/to/archershub_query.sql;
SOURCE /full/path/to/archershub_seed.sql;
```

The first file creates the tables. The second adds sample accounts and data.
With XAMPP you can also use phpMyAdmin: **Import**, then pick each file in the same order.

> **Linux:** the MySQL `root` user often cannot log in from PHP. Create your own user and put it in `config.php`:
>
> ```sql
> CREATE USER 'your_user'@'localhost' IDENTIFIED BY 'your_password';
> GRANT ALL PRIVILEGES ON archershub.* TO 'your_user'@'localhost';
> FLUSH PRIVILEGES;
> ```

**To start over:** run `DROP DATABASE archershub;` and repeat this step.

### 4. Open it

Go to `http://localhost/<folder-name>/` and log in with a test account below.

---

## Test accounts

Every account uses the password **`Password123`**. You can log in with the email or the ID.

| Role | Email | ID |
|---|---|---|
| Admin | `admin@archershub.test` | `10000001` |
| Provost | `provost@archershub.test` | `10000002` |
| APO | `apo@archershub.test` | `10000003` |
| Teacher | `elena.cruz@archershub.test` | `10000011` |
| Teacher | `ramon.bautista@archershub.test` | `10000012` |
| Student | `ana.reyes@archershub.test` | `12300001` |
| Student | `miguel.torres@archershub.test` | `12300002` |
| Student | `sofia.lim@archershub.test` | `12300003` |
| Student | `daniel.garcia@archershub.test` | `12300004` |
| Student | `isabel.ramos@archershub.test` | `12300005` |

**Who sees what:**

| Role | Sidebar pages |
|---|---|
| Student | General pages + student pages (enlistment, add/drop, records, ...) |
| Teacher | General pages + grade encoding and applications |
| APO / Provost | General pages + announcements |
| Admin | Everything, including account management |

The seed dates are set wide on purpose so every feature can be tried at any time.

---

## Project layout

```
index.php               Entry point. All routes are registered here.
archershub_query.sql    Database schema (tables)
archershub_seed.sql     Sample data for testing

backEnd/
  config/               config.example.php (template) and your config.php
  core/                 Router, database connection, helpers, sidebar menu
  controllers/          Auth, Home, Page and Profile controllers
  models/               user.php (database queries)
  views/                PHP pages (auth/, pages/, partials/)

frontEnd/
  styles/               CSS files
  scripts/              JavaScript (nav.js handles the hamburger menu,
                        dark mode and filter panel)
  views/images/         Logo and pictures
```

**How a request flows:** the browser opens `index.php?route=profile`, the router finds the controller, the controller asks the model for data, then it loads a view.

### Adding a new page

1. Add the page to `backEnd/core/menu.php` (route, label, who can see it).
2. Create `backEnd/views/pages/<route>.php`.

Until the view file exists, the page shows an "under construction" message.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| **403 Forbidden** (Linux) | Run `chmod o+x /home/<your-username>` |
| Blank page or error about `config.php` | You skipped step 2. Copy `config.example.php` to `config.php` |
| Database connection error | Check `db_user` and `db_pass` in `config.php` |
| Login says "Invalid email or password" | The seed file was not loaded, or you typed the password wrong |
| Page has no styling | `base_url` in `config.php` does not match your folder name |

---

## Ignore these

- `backEnd_old/`, `.env` and `start-server.bat` belong to the old Node.js version. The app no longer uses them.
- `frontEnd/*.html` and `frontEnd/views/**/*.html` are the original static mockups. The PHP views replaced them.