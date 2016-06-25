echo 160 > /sys/class/gpio/export
echo in > /sys/class/gpio/gpio160/direction
touch /sys/class/gpio/gpio160/value
cat /sys/kernel/debug/gpio
