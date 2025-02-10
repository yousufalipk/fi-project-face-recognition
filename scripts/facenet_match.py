import os
import cv2
import sys
import numpy as np
from deepface import DeepFace

user_image_path = "./public/userImage/userImage.jpg"
images_folder = "./public/images"

# Validate user image
if not os.path.exists(user_image_path):
    print("Error: User image not found.")
    sys.exit(1)

if not os.path.isdir(images_folder):
    print("Error: Images directory does not exist.")
    sys.exit(1)

def detect_faces(image_path):
    """Detects faces in the given image using OpenCV."""
    try:
        img = cv2.imread(image_path)
        if img is None:
            return "Error: Could not read user image."

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

        if len(faces) == 0:
            return "Error: No face detected in user image. Upload a valid face image."
        elif len(faces) > 1:
            return "Error: Multiple faces detected in user image. Upload a single-person image."

        return None  

    except Exception as e:
        return f"Error during face detection: {str(e)}"

# Check user image validity
error_message = detect_faces(user_image_path)
if error_message:
    print(error_message)
    sys.exit(1)

# Match user image with stored images
match_found = False
matched_filename = None

for filename in sorted(os.listdir(images_folder)):
    image_path = os.path.join(images_folder, filename)

    if not filename.lower().endswith((".jpg", ".jpeg", ".png")):
        continue

    try:
        result = DeepFace.verify(img1_path=user_image_path, img2_path=image_path, model_name="Facenet")
        if result.get("verified"):
            print(f"Success: Match found successfully! Filename: {filename}")
            match_found = True
            matched_filename = filename
            break
    except Exception as e:
        print(f"Warning: Error processing '{filename}': {e}")
        continue

if not match_found:
    print("Error: No match found.")

sys.exit(0)
