#!/usr/bin/python3

import picamera

with picamera.PiCamera() as camera:
  camera.resolution = (3280, 2464)
  camera.capture('./photos/photo.jpg')