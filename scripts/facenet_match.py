import os  
import sys   
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"  
import cv2  
import numpy as np  
from deepface import DeepFace  

if len(sys.argv) < 2:
    print("Error: No image provided. Usage: python script.py <image_path>")
    sys.exit(1)

uploaded_img_path = sys.argv[1]
database_path = "public/images"

if not os.path.exists(uploaded_img_path):
    print("Error: Uploaded image not found.")
    sys.exit(1)

def detect_faces(image_path):
    try:
        img = cv2.imread(image_path)
        if img is None:
            return []

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        return faces
    except Exception as e:
        return []

faces_detected = detect_faces(uploaded_img_path)
if len(faces_detected) == 0:
    print("Error: No face detected. Upload a valid face image.")
    sys.exit(1)
elif len(faces_detected) > 1:
    print("Error: Multiple faces detected. Upload a single-person image.")
    sys.exit(1)

if not os.path.isdir(database_path):
    print("Error: Database directory does not exist.")
    sys.exit(1)

found_match = False
matched_username = ""

for filename in os.listdir(database_path):
    db_image_path = os.path.join(database_path, filename)

    if not filename.lower().endswith((".jpg", ".jpeg", ".png")):
        continue

    try:
        result = DeepFace.verify(img1_path=uploaded_img_path, img2_path=db_image_path, model_name="Facenet")
        if result.get("verified"):
            matched_username = os.path.splitext(filename)[0]  
            found_match = True
            break 
    except Exception as e:
        continue

if found_match:
    print(matched_username)
else:
    print("No match found")

sys.exit(0)