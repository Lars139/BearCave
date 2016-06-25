dd if=/dev/zero of=/swapfile bs=1024 count=2097152
chown root:root /swapfile
chmod 0600 /swapfile
mkswap /swapfile
swapon /swapfile
