import os
import cv2
import sys
import numpy as np
from deepface import DeepFace

# Define paths
user_image_path = "./userImage/userImage.jpg"
images_folder = "images"  # Folder containing multiple images

# Validate user image path
if not os.path.exists(user_image_path):
    print(f"Error: User image '{user_image_path}' not found.")
    sys.exit(1)

# Validate images folder
if not os.path.isdir(images_folder):
    print(f"Error: Images directory '{images_folder}' does not exist.")
    sys.exit(1)

# Function to detect faces
def detect_faces(image_path):
    try:
        img = cv2.imread(image_path)
        if img is None:
            print(f"Error: Could not read image '{image_path}'.")
            return []

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        return faces
    except Exception as e:
        print(f"Error during face detection: {e}")
        return []

# Detect faces in the user image
user_faces = detect_faces(user_image_path)
if len(user_faces) == 0:
    print("Error: No face detected in user image. Upload a valid face image.")
    sys.exit(1)
elif len(user_faces) > 1:
    print("Error: Multiple faces detected in user image. Upload a single-person image.")
    sys.exit(1)

# Compare user image with stored images
match_found = False
for filename in os.listdir(images_folder):
    image_path = os.path.join(images_folder, filename)

    # Skip non-image files
    if not filename.lower().endswith((".jpg", ".jpeg", ".png")):
        continue

    try:
        result = DeepFace.verify(img1_path=user_image_path, img2_path=image_path, model_name="Facenet")
        if result.get("verified"):
            print(f"Match found: {filename}")
            match_found = True
            break  # Stop after finding the first match
    except Exception as e:
        print(f"Warning: Error processing '{filename}': {e}")
        continue

if not match_found:
    print("No match found.")

sys.exit(0)
