# 🗺️ DevMap — Know Your Stack

DevMap is a developer career tool that analyzes your GitHub profile against a job description, shows your skill gap, and surfaces real job and internship listings matched to your current skill set.

**Live URL:** https://devmap.alvinn.tech
**Live Demo:**https://youtu.be/rxIx0FFGLyI

---

## What It Does

- Fetches your public GitHub repositories and detects the programming languages you use
- Analyzes a pasted job description OR a manually selected skill set to extract required skills
- Shows a match score and highlights skills you have vs skills you are missing
- Provides learning resource links for every missing skill
- Fetches real remote job and internship listings from the Remotive API matched to your skills
- Supports dark and light mode with a toggle in the navbar
- Fully responsive with a hamburger dropdown menu on mobile

---

## APIs Used

| API | Purpose | Docs |
|---|---|---|
| GitHub REST API | Fetch public repos and detect languages | https://docs.github.com/en/rest |
| Remotive API | Fetch remote job and internship listings | https://remotive.com/api/remote-jobs |

Both APIs are free and require no API key.

---

## Project Structure
```
devmap/
├── index.html      — App structure and navbar tabs
├── style.css       — All styling including dark/light mode and mobile responsive
├── app.js          — All logic: GitHub API, skill extraction, job fetching, display
└── .gitignore      — Excludes OS and editor files
```

---

## Deployment

The app is deployed across a three-server infrastructure:
```
User → devmap.alvinn.tech
           ↓
         lb-01 (HAProxy Load Balancer)
         IP: 3.93.213.69
        ↙           ↘
   web-01           web-02
3.84.32.112     35.173.233.231
```

### web-01 and web-02 Setup

Both servers run Nginx and serve the app from `/var/www/devmap`.

**1. Install dependencies:**
```bash
sudo apt-get install git -y
sudo apt-get install nginx -y
```

**2. Clone the repo:**
```bash
sudo mkdir -p /var/www/devmap
sudo chown -R ubuntu:ubuntu /var/www/devmap
cd /var/www/devmap
git clone https://github.com/Officialvinn/devmap.git .
```

**3. Configure Nginx:**
```bash
cat << 'EOF' | sudo tee /etc/nginx/sites-available/devmap
server {
    listen 80;
    server_name devmap.alvinn.tech;

    root /var/www/devmap;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    add_header X-Served-By $hostname;
}
EOF

sudo ln -s /etc/nginx/sites-available/devmap /etc/nginx/sites-enabled/devmap
sudo nginx -t
sudo systemctl reload nginx
```

### lb-01 Setup (HAProxy)

HAProxy routes traffic between web-01 and web-02 using round-robin load balancing. It also handles SSL termination.

**HAProxy config at `/etc/haproxy/haproxy.cfg`:**
```
frontend http_front
    bind *:80
    http-request redirect scheme https code 301

frontend www-https
    bind *:443 ssl crt /etc/ssl/alvinn.tech/www.alvinn.tech.pem
    acl is_devmap hdr(host) -i devmap.alvinn.tech
    use_backend devmap_back if is_devmap
    default_backend http_back

backend http_back
    balance roundrobin
    server 7042-web-01 3.84.32.112:80 check
    server 7042-web-02 35.173.233.231:80 check

backend devmap_back
    balance roundrobin
    server 7042-web-01 3.84.32.112:80 check
    server 7042-web-02 35.173.233.231:80 check
```

**Reload HAProxy after changes:**
```bash
sudo haproxy -c -f /etc/haproxy/haproxy.cfg
sudo systemctl reload haproxy
```

### SSL Certificate

The SSL certificate was issued using Certbot and covers both `www.alvinn.tech` and `devmap.alvinn.tech`:
```bash
sudo systemctl stop haproxy
sudo certbot certonly --standalone -d www.alvinn.tech -d devmap.alvinn.tech --expand
sudo systemctl start haproxy
sudo cat /etc/letsencrypt/live/www.alvinn.tech/fullchain.pem \
         /etc/letsencrypt/live/www.alvinn.tech/privkey.pem | \
         sudo tee /etc/ssl/alvinn.tech/www.alvinn.tech.pem
sudo systemctl reload haproxy
```

### DNS Configuration

An A record was added for `devmap.alvinn.tech` pointing to lb-01:

| Type | Name | Value |
|---|---|---|
| A | devmap | 3.93.213.69 |

---

## Updating the App

To push new changes to the servers after a code update:

**Local machine:**
```bash
git add .
git commit -m "your message"
git push origin main
```

**On web-01 and web-02:**
```bash
cd /var/www/devmap && git pull origin main
```

---

## Challenges Faced

**DNS Configuration** — Initially the apex domain A record was missing which caused the checker to fail. Adding the correct A record for `devmap` pointing to lb-01 resolved this.

**SSL Certificate Setup** — The existing certificate only covered `www.alvinn.tech`. Since HAProxy handles SSL termination, Certbot needed HAProxy to be stopped temporarily on port 80 before the certificate could be expanded to include `devmap.alvinn.tech`.

**Mobile Responsiveness** — The navbar required a hamburger dropdown menu on smaller screens. The dropdown needed `position: absolute` so it floats over the page content rather than pushing it down.

---

## Author

Alvin Njenga Njoroge
GitHub: [@Officialvinn](https://github.com/Officialvinn)
Domain: [alvinn.tech](https://alvinn.tech)