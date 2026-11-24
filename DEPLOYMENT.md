# Deploying LabFix on the AWS Free Tier

This is a beginner-friendly, step-by-step guide for deploying LabFix on AWS using **EC2** (web server), **RDS MySQL** (database), **S3** (photos), and an **IAM Role** (permissions without access keys).

```
 Phone / Laptop
      │  HTTP :80
      ▼
┌──────────────────── EC2 t3.micro (Amazon Linux 2023) ───────────────────┐
│  Nginx :80  ──►  Next.js (PM2) :3000                                     │
│                     │            │                                       │
│        IAM Role ────┘            │                                       │
└─────────────────────┼────────────┼───────────────────────────────────────┘
                      ▼            ▼  port 3306 (private)
              S3 bucket (private)  RDS MySQL db.t4g.micro (no public access)
```

The guide has three parts, so the app keeps working after each one:

- **Part A**: Deploy the current app (mock data) on EC2. This alone is enough to show the interface online.
- **Part B**: Add S3 + the IAM Role for photos.
- **Part C**: Add RDS MySQL for real data.

---

## Step 0: Before you start (avoid surprise bills)

### Know which Free Tier you have
AWS changed its Free Tier on **July 15, 2025**:

| Your account was created... | What you get |
|---|---|
| **Before July 15, 2025** (legacy Free Tier) | 12 months free: 750 hrs/month of EC2 `t2.micro`/`t3.micro`, 750 hrs/month of RDS `db.t2/t3/t4g.micro` Single-AZ + 20 GB storage, 5 GB of S3 |
| **On/after July 15, 2025** (new Free plan) | AWS credits (starts at $100, and you can earn more) to use within 6 months, on free-tier-eligible types such as EC2 `t3.micro`/`t4g.micro` and RDS `db.t3.micro`/`db.t4g.micro` |

Check yours in the console: **Billing and Cost Management → Free Tier** (or **Credits**). Limits change, so check the official **AWS Free Tier** page too.

### Set a budget alert first (5 minutes, strongly recommended)
1. Open **Billing and Cost Management → Budgets → Create budget**.
2. Choose **Use a template → Zero spend budget** (or a Monthly cost budget of **$1**).
3. Enter your email and click **Create budget**.

### Things that cost money (avoid them)
- ❌ **NAT Gateway**. This guide does not need one.
- ❌ **Multi-AZ** RDS, or instance types larger than micro.
- ❌ **Elastic IPs** that are not attached to a running instance.
- ⚠️ **Public IPv4 addresses** are billed per hour (since Feb 2024). Use only **one** (the EC2 instance) and give RDS **no public access**.
- ❌ Leftover **RDS snapshots**, stopped instances with large disks, or a forgotten running instance after the project is graded. See [Step 11](#step-11-cleanup-after-grading).

### Pick ONE region and use it for everything
For example, **Asia Pacific (Singapore) `ap-southeast-1`**. Choose it in the top-right of the console. EC2, RDS, and S3 must all be in the same region.

---

# Part A: Deploy the app on EC2

## Step 1: Create the security groups

**EC2 → Security Groups → Create security group** (use the default VPC):

**`labfix-web-sg`** (for the EC2 web server)

| Type | Port | Source | Why |
|---|---|---|---|
| SSH | 22 | **My IP** | Only you can log in to the server |
| HTTP | 80 | Anywhere-IPv4 (0.0.0.0/0) | Users open the website |

> Do **not** open port 3000. Users only reach the app through Nginx on port 80.

**`labfix-db-sg`** (for RDS, used in Part C)

| Type | Port | Source |
|---|---|---|
| MYSQL/Aurora | 3306 | **Custom → `labfix-web-sg`** (choose the security group, not an IP) |

This means **only** the EC2 web server can talk to the database.

## Step 2: Launch the EC2 instance

**EC2 → Instances → Launch instances**

| Setting | Value |
|---|---|
| Name | `labfix-web` |
| AMI | **Amazon Linux 2023** (64-bit x86) |
| Instance type | **`t3.micro`** (marked "Free tier eligible") |
| Key pair | Create new → `labfix-key` → `.pem` → download it and keep it safe |
| Network | Default VPC, **Auto-assign public IP: Enable** |
| Security group | Select existing → **`labfix-web-sg`** |
| Storage | 8–20 GB **gp3** (Free Tier covers up to 30 GB) |
| Advanced → IAM instance profile | Leave empty for now (added in Part B) |

Click **Launch instance**, then copy its **Public IPv4 address**.

## Step 3: Connect to the server

Option 1, from the browser: **EC2 → select instance → Connect → EC2 Instance Connect → Connect**.

Option 2, from your computer:

```bash
# Linux / macOS (Windows PowerShell works the same, without chmod)
chmod 400 labfix-key.pem
ssh -i labfix-key.pem ec2-user@<EC2_PUBLIC_IP>
```

## Step 4: Install Node.js, Nginx, Git, and PM2

```bash
# Update the system and install Nginx + Git
sudo dnf update -y
sudo dnf install -y nginx git

# Install Node.js 22 with nvm (Next.js 16 needs Node 20.9+)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 22
node -v   # should print v22.x

# PM2 keeps the app running and restarts it after a crash or reboot
npm install -g pm2
```

### Add a swap file (important on a 1 GB t3.micro)
`next build` can run out of memory on 1 GB RAM. A 1 GB swap file prevents that:

```bash
sudo dd if=/dev/zero of=/swapfile bs=128M count=8
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab
free -h   # "Swap:" should now show about 1.0G
```

## Step 5: Copy the code to the server

**Option 1: GitHub (recommended).** Push the project to GitHub first (`.gitignore` already keeps `.env.local` and `node_modules` out). Then on EC2:

```bash
cd ~
git clone https://github.com/<your-username>/labfix.git
cd labfix
```

**Option 2: Upload from your computer** (without `node_modules` and `.next`):

```bash
# Run on YOUR computer, inside the folder that contains LabFix
scp -i labfix-key.pem -r LabFix/app LabFix/components LabFix/lib LabFix/public \
  LabFix/package.json LabFix/package-lock.json LabFix/next.config.mjs \
  LabFix/postcss.config.mjs LabFix/jsconfig.json LabFix/.env.example \
  ec2-user@<EC2_PUBLIC_IP>:~/labfix/
```

## Step 6: Create the environment file on the server

```bash
cd ~/labfix
cp .env.example .env.local

# Generate a strong secret and put it in the file
SECRET=$(openssl rand -hex 32)
sed -i "s/^SESSION_SECRET=.*/SESSION_SECRET=$SECRET/" .env.local

chmod 600 .env.local   # only your user can read it
cat .env.local         # check: SESSION_SECRET is filled in, COOKIE_SECURE=false
```

> Keep `COOKIE_SECURE=false` while the site uses plain **HTTP**. If you set it to `true` without HTTPS, the browser will not save the login cookie and login will appear to "do nothing".

## Step 7: Build and start with PM2

```bash
cd ~/labfix
npm ci
npm run build          # takes a few minutes on t3.micro

pm2 start npm --name labfix -- start   # runs "next start" on port 3000
pm2 save
pm2 startup            # copy and run the "sudo env PATH=..." command it prints
pm2 status             # labfix should be "online"
curl -I http://127.0.0.1:3000/login    # should return HTTP/1.1 200
```

## Step 8: Configure Nginx as a reverse proxy

```bash
sudo nano /etc/nginx/conf.d/labfix.conf
```

Paste:

```nginx
server {
    listen 80;
    server_name _;

    # Allow photo uploads up to 5 MB (+ form fields). Without this, Nginx
    # rejects uploads larger than 1 MB with "413 Request Entity Too Large".
    client_max_body_size 6M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        # LabFix needs these:
        proxy_set_header Host $host;                                   # same-origin (CSRF) check
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;   # real IP for the login rate limit
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Then:

```bash
sudo nginx -t                         # "syntax is ok"
sudo systemctl enable --now nginx
sudo systemctl reload nginx
```

## Step 9: Test it

Open **`http://<EC2_PUBLIC_IP>`** on your phone or laptop.

- [ ] The login page loads (demo accounts are hidden because this is production)
- [ ] Log in as `reporter@labfix.edu` / `Reporter123!` and submit a report with a photo
- [ ] Log in as `itsupport@labfix.edu` / `Support123!`, see the report as **New**, and change its status

🎉 **Part A is done.** The interface is online. Data is still in memory and resets when you run `pm2 restart`.

---

# Part B: Photos on Amazon S3 with an IAM Role

## B1: Create a private S3 bucket
**S3 → Create bucket**
- Name: `labfix-photos-<your-name>-<random>` (must be globally unique)
- Region: the same one as EC2
- **Block all public access: ON** (keep it checked)
- Default encryption: **SSE-S3**
- Create bucket

No CORS setup is needed, because photos are uploaded through the server, not directly from the browser.

## B2: Create the IAM Role for EC2 (no access keys)
**IAM → Roles → Create role**
1. Trusted entity: **AWS service → EC2** → Next.
2. Skip the managed policies → Next → name it **`LabFixEC2Role`** → Create role.
3. Open the role → **Add permissions → Create inline policy → JSON** and paste the policy below (replace the bucket name). This gives **least privilege**: the role can only read and write photos inside `reports/`.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "LabFixPhotos",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::labfix-photos-<your-name>-<random>/reports/*"
    }
  ]
}
```

4. Name it `LabFixS3Photos` → Create policy.
5. Attach it to the instance: **EC2 → select `labfix-web` → Actions → Security → Modify IAM role → `LabFixEC2Role` → Update IAM role**.

## B3: Update the code (`lib/storage.js` only)
```bash
cd ~/labfix
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```
In `lib/storage.js`, uncomment the example code (move the `import` lines to the top of the file) and remove the placeholder `return null`. Add to `.env.local`:
```
AWS_REGION=ap-southeast-1
S3_BUCKET=labfix-photos-<your-name>-<random>
```
Do **not** add `AWS_ACCESS_KEY_ID` or `AWS_SECRET_ACCESS_KEY`. The SDK gets temporary credentials from the IAM Role automatically.

No page changes are needed. Once `getPhotoUrl()` returns a pre-signed URL, `components/PhotoPlaceholder.js` shows the real photo instead of the placeholder box. Then rebuild:
```bash
npm run build && pm2 restart labfix
```

---

# Part C: Real data on RDS MySQL

## C1: Create the database
**RDS → Create database**

| Setting | Value |
|---|---|
| Creation method | Standard create |
| Engine | **MySQL** (latest 8.x) |
| Template | **Free tier** (if shown; otherwise Dev/Test with the settings below) |
| Deployment | **Single-AZ** |
| DB instance identifier | `labfix-db` |
| Master username | `admin` → choose a strong password (save it in a password manager) |
| Instance class | **`db.t4g.micro`** (or `db.t3.micro`) |
| Storage | **gp2/gp3, 20 GB**, **disable storage autoscaling** |
| Connectivity | **Don't connect to an EC2 compute resource**, default VPC |
| **Public access** | **No** |
| VPC security group | Choose existing → **`labfix-db-sg`** (remove `default`) |
| Additional configuration → Initial database name | `labfix` |
| Backups | Retention 1 day (or disable it for the class project) |
| Encryption | Enabled (default) |

Creating the database takes about 5–10 minutes. Then copy the **Endpoint** (for example, `labfix-db.xxxx.ap-southeast-1.rds.amazonaws.com`).

## C2: Create the tables (from EC2)
```bash
sudo dnf install -y mariadb105          # MySQL-compatible command-line client
mysql -h <RDS_ENDPOINT> -u admin -p labfix
```

```sql
-- A separate app user with only the permissions the app needs
CREATE USER 'labfix_app'@'%' IDENTIFIED BY '<another-strong-password>';
GRANT SELECT, INSERT, UPDATE ON labfix.* TO 'labfix_app'@'%';

CREATE TABLE labs (
  id        VARCHAR(20)  PRIMARY KEY,           -- e.g. 'lab-1'
  name      VARCHAR(100) NOT NULL,
  building  VARCHAR(100) NOT NULL
);

CREATE TABLE users (
  id             VARCHAR(20)  PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  email          VARCHAR(254) NOT NULL UNIQUE,
  role           ENUM('reporter','it_support') NOT NULL,
  password_hash  VARCHAR(200) NOT NULL          -- "salt:hash" from lib/password.js
);

CREATE TABLE reports (
  id           INT AUTO_INCREMENT PRIMARY KEY,  -- shown as LF-0001 in the app
  lab_id       VARCHAR(20)  NOT NULL,
  pc_number    VARCHAR(10)  NOT NULL,
  issue_type   VARCHAR(50)  NOT NULL,
  description  VARCHAR(500) NOT NULL,
  photo_key    VARCHAR(255) NOT NULL,           -- S3 object key, not the photo itself
  status       ENUM('Pending','In Progress','Resolved') NOT NULL DEFAULT 'Pending',
  reporter_id  VARCHAR(20)  NOT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (lab_id) REFERENCES labs(id),
  FOREIGN KEY (reporter_id) REFERENCES users(id)
);

CREATE TABLE report_history (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  report_id   INT NOT NULL,
  status      ENUM('Pending','In Progress','Resolved') NOT NULL,
  remarks     VARCHAR(300),
  changed_by  VARCHAR(20) NOT NULL,
  changed_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES reports(id),
  FOREIGN KEY (changed_by) REFERENCES users(id)
);

INSERT INTO labs VALUES
 ('lab-1','Computer Lab 1','Main Building, 2F'),
 ('lab-2','Computer Lab 2','Main Building, 2F'),
 ('lab-3','Computer Lab 3','Engineering Building, 3F'),
 ('lab-4','Computer Lab 4','Engineering Building, 3F');
```

Add users with password hashes made by `lib/password.js`, never plain text:
```bash
node -e "import('./lib/password.js').then(m => console.log(m.hashPassword('YourNewPassword!')))"
```

## C3: Update the code (`lib/data.js` only)
```bash
npm install mysql2
```
Add to `.env.local`:
```
DB_HOST=<RDS_ENDPOINT>
DB_USER=labfix_app
DB_PASSWORD=<another-strong-password>
DB_NAME=labfix
```
In `lib/data.js`, create one connection pool and replace each function body at its `// TODO: replace with RDS MySQL query` comment. Keep the same function names and return shapes. For example:
```js
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 5,
});

export async function getLabs() {
  const [rows] = await pool.query("SELECT id, name, building FROM labs ORDER BY name");
  return rows;
}

export async function findUserByEmail(email) {
  // ALWAYS use ? placeholders. Never put user input directly into SQL.
  const [rows] = await pool.query(
    "SELECT id, name, email, role, password_hash AS passwordHash FROM users WHERE email = ?",
    [String(email).toLowerCase()]
  );
  return rows[0] || null;
}
```
Then `npm run build && pm2 restart labfix`.

---

## Step 10: Updating the app later

```bash
cd ~/labfix
git pull                  # or upload the changed files again
npm ci
npm run build
pm2 restart labfix
```

### Optional: HTTPS
HTTPS needs a domain name (for example, a free subdomain). Point it to the EC2 IP, open port **443** in `labfix-web-sg`, then:
```bash
sudo dnf install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.example
```
After HTTPS works, set `COOKIE_SECURE=true` in `.env.local` and run `pm2 restart labfix`.

### Troubleshooting

| Problem | Likely cause / fix |
|---|---|
| Browser can't open the site | Port 80 is not open in `labfix-web-sg`, or Nginx is not running (`sudo systemctl status nginx`) |
| **502 Bad Gateway** | The app is down. Check `pm2 status` and `pm2 logs labfix` |
| **413 Request Entity Too Large** on upload | `client_max_body_size 6M;` is missing from the Nginx config |
| Login "does nothing" / you are logged out right away | `COOKIE_SECURE=true` on plain HTTP. Set it to `false` |
| Error about `SESSION_SECRET` in `pm2 logs` | `.env.local` is missing or the secret is shorter than 32 characters |
| `npm run build` is killed / very slow | Not enough memory. Add the swap file (Step 4) |
| "Invalid request." (403) on login | Nginx is not passing `proxy_set_header Host $host;` |
| Can't connect to RDS | `labfix-db-sg` must allow 3306 from `labfix-web-sg`, and both must be in the same VPC |
| S3 `AccessDenied` | IAM role not attached to the instance, or the bucket name / `reports/*` path in the policy is wrong |

---

## Step 11: Cleanup after grading

To stop all charges, delete everything in this order:

1. **EC2 → Instances →** select `labfix-web` → **Terminate**.
2. **RDS → Databases →** `labfix-db` → **Delete** → uncheck "Create final snapshot", and confirm.
3. **RDS → Snapshots** → delete any left over.
4. **S3 →** your bucket → **Empty** → then **Delete**.
5. **EC2 → Elastic IPs** → release any (if you created one).
6. **EC2 → Volumes / Snapshots** → delete anything left behind.
7. Optional: delete `LabFixEC2Role`, the two security groups, and the key pair.
8. Check **Billing → Bills** a day later to confirm nothing is still running.
