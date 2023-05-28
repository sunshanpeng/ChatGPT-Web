## Docker
```shell
docker run -d -p 80:80 --name nginx -v /data/docker/nginx/conf.d:/etc/nginx/conf.d -v /data/docker/nginx/static:/etc/nginx/static -v /data/docker/nginx/nginx.conf:/etc/nginx/nginx.conf nginx
```
## Shell
```shell
mkdir /data/docker/nginx && mkdir /data/docker/nginx/conf.d && mkdir /data/docker/nginx/static/chatgpt-web && touch /data/docker/nginx/conf.d/chatgpt-web.conf && touch /data/docker/nginx/nginx.conf
```

## Nginx
### chatgpt-web.conf
```nginx
server {
    listen 80;
    server_name chatgpt.example.com;

    if ($http_user_agent ~* "360Spider|JikeSpider|Spider|spider|bot|Bot|2345Explorer|curl|wget|webZIP|qihoobot|Baiduspider|Googlebot|Googlebot-Mobile|Googlebot-Image|Mediapartners-Google|Adsbot-Google|Feedfetcher-Google|Yahoo! Slurp|Yahoo! Slurp China|YoudaoBot|Sosospider|Sogou spider|Sogou web spider|MSNBot|ia_archiver|Tomato Bot|NSPlayer|bingbot")
    {
        return 403;
    }
    location / {
        # proxy_pass http://192.168.192.118:1002;
        root /etc/nginx/static/chatgpt-web;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    location /api {
        proxy_set_header   X-Real-IP $remote_addr; #转发用户IP
        proxy_pass http://192.168.192.118:3002;
    }
}
```
### nginx.conf
```nginx
user  nginx;
worker_processes  auto;

error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;

events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile             on;
    tcp_nopush           on;
    tcp_nodelay          on;

    keepalive_timeout    65;
    types_hash_max_size  2048;

    server_names_hash_bucket_size 128;

    # Include configuration files for sites
    include /etc/nginx/conf.d/*.conf;

    gzip on;
    gzip_disable "msie6";

    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 5;
    gzip_buffers 16 8k;
    gzip_http_version 1.1;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    client_body_buffer_size 10m;
    client_header_buffer_size 1k;
    client_max_body_size 10m;
    large_client_header_buffers 2 1k;

    server_tokens off;
    
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header REMOTE-HOST $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

## build

```shell
npm run build-only
scp -r dist/* root@192.168.192.193:/data/docker/nginx/static/chatgpt-web/
```