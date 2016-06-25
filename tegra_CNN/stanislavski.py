import os
import cv2
import time
import numpy as np
import matplotlib.pyplot as plt
#matplotlib inline

caffe_root='~/FPGA-CNN/caffe'
import sys
sys.path.insert(0, caffe_root + 'python')
import caffe

plt.rcParams['figure.figsize'] = (10,10)
plt.rcParams['image.interpolation'] = 'nearest'
plt.rcParams['image.cmap'] = 'gray'

#Setting up facial recognition
cascPath = 'haarcascade_frontalface_default.xml' 
faceCascade = cv2.CascadeClassifier(cascPath)

DEMO_DIR = '.'
#categories = [ 'Happy', 'Disgust', 'Fear', 'Neutral', 'Angry', 'Sad', 'Surprise' ]  #larger 
categories = [ 'Neutral', 'Disgust', 'Fear', 'Happy', 'Angry', 'Sad', 'Surprise' ] #smaller

def showimage(im):
  if im.ndim == 3:
    im = im[:, :, ::-1]
  plt.set_cmap('jet')
  plt.imshow(im, vmin=0, mvax=0.2)

def vis_square(data, padsize=1, padval=0):
  data -= data.min()
  data /= data.max()

  #force the number of filters to be square
  n = int(np.ceil(np.sqrt(data.shape[0])))
  padding = ((0, n **2 - data.shape[0]), (0, padsize), (0,padsize)) + ((0, 0),)*(data.ndim -3)
  data = np.pad(data, padding, mode='constant', constant_values=(padval, padval))
  
  #tile the filters into an image
  data = data.reshape((n, n) + data.shape[1:]).transpose((0,2,1,3) + tuple(range(4, data.ndim + 1)))
  data = data.reshape((n * data.shape[1], n * data.shape[3]) + data.shape[4:])

  showimage(data)

cur_net_dir = 'VGG_S_rgb'

#loading the mean value 
mean_filename=os.path.join(DEMO_DIR,cur_net_dir,'mean.binaryproto')
proto_data = open(mean_filename,"rb").read()
a = caffe.io.caffe_pb2.BlobProto.FromString(proto_data)
mean = caffe.io.blobproto_to_array(a)[0]

#loading the nueron net
net_pretrained = os.path.join(DEMO_DIR, cur_net_dir, 'EmotiW_VGG_S.caffemodel')
net_model_file = os.path.join(DEMO_DIR, cur_net_dir, 'deploy.prototxt')
#setup the classifier layer
VGG_S_Net = caffe.Classifier(net_model_file, net_pretrained,
  mean=mean,
  channel_swap=(2,1,0),
  raw_scale=255,
  image_dims=(256, 256))

#setup the camera
video_capture = cv2.VideoCapture(0)

while True:
  #loading the image
  start_time = time.time()
  ret, raw_frame = video_capture.read()

  button_f = open("/sys/class/gpio/gpio160/value","r")
  if(button_f.read(1) == '0'):
    #facial detection 
    gray = cv2.cvtColor(raw_frame, cv2.COLOR_BGR2GRAY)
    faces = faceCascade.detectMultiScale( 
      gray,
      scaleFactor=1.1,
      minNeighbors=5,
      minSize=(30, 30),
      flags=cv2.cv.CV_HAAR_SCALE_IMAGE
    )

    for (x, y, w, h) in faces:
      face_frame = raw_frame[y+15:y+h-10, x+15:x+w-10]  #smaller_happy_neu
      #face_frame = raw_frame[y+35:y+h-25, x+35:x+w-35]  #better smaller
      #face_frame = raw_frame[y-35:y+h+65, x-35:x+w+35]   #larger  
      #cv2.rectangle(raw_frame, (x,y), (x+w,y+h), (0,255,0), 2)

  #setting up the button I/O
    frame = cv2.resize(face_frame, (256,256))
    #doing the classification
    prediction = VGG_S_Net.predict([frame], oversample=False)
    cv2.imshow('Captured Image',frame)
    cv2.waitKey(1) 
    print 'predicted category is {0}'.format(categories[prediction.argmax()])
    print "time_used: %.2f" % (time.time() - start_time)
  button_f.close()
  
  cv2.imshow('Video',raw_frame)
  cv2.waitKey(1) 

#close the cv live video feed
video_capture.release()
cv2.destroyAllWindows()
