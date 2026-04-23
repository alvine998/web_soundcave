worker_processes auto;
rtmp_auto_push on;
events {}

rtmp {
    server {
        listen 1935;
        chunk_size 4000;

        application live {
            live on;
            record off;

            # 1. HLS configuration
            hls on;
            hls_path /tmp/hls;
            hls_fragment 3s;
            hls_playlist_length 60s;
            hls_cleanup on;

            # 2. Webhooks for status tracking (Professional Setup)
            # This calls your Go backend when someone starts/stops streaming
            on_publish http://154.26.137.37:6002/api/rtmp/on-publish;
            on_publish_done http://154.26.137.37:6002/api/rtmp/on-publish-done;
            
            # Allow only the local gateway or verified IPs (optional)
            allow publish all;
            allow play all;
        }
    }
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile        on;

    server {
        listen 8080;

        location /hls {
            types {
                application/vnd.apple.mpegurl m3u8;
                video/mp2t ts;
            }
            root /tmp;
            add_header Cache-Control no-cache;
            add_header Access-Control-Allow-Origin *; # Crucial for web players
        }
    }
}
