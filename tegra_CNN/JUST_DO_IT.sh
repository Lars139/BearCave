#!/bin/bash

if [ -z $PYTHONPATH ]; then
  export PYTHONPATH=$PYTHONPATH:/home/ubuntu/FPGA-CNN/caffe/python
fi

#if [ ! -s /swapfile ]; then
  sudo ./Setup_swapfile.sh
#fi

if [ ! -s /sys/class/gpio/gpio160/value ]; then
  sudo ./gpio.sh
fi

count=0
while [ ! $count -eq 1 ] 
do 
  sleep 2
  count=$(dmesg | tail -9 | grep -i found | grep -ic cam )
  #count=$(dmesg | tail -9 | grep -i found | grep -ic video)
  echo "Waiting for a WebCam..." 
done
  
echo "Instantiating the module..." 
python stanislavski.py

