import json
import face_recognition
import os
import cv2
import numpy as np

USER_IMAGE_PATH = "public/userImage/userImage.jpg"
IMAGES_FOLDER = "public/images"

def preprocess_image(image_path):
    """Load and preprocess an image to enhance face recognition."""
    image = cv2.imread(image_path)
    if image is None:
        return None
    
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    equalized = cv2.equalizeHist(gray)
    
    enhanced_image = cv2.cvtColor(equalized, cv2.COLOR_GRAY2BGR)
    
    kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
    sharpened = cv2.filter2D(enhanced_image, -1, kernel)
    
    return sharpened

def main():
    if not os.path.exists(USER_IMAGE_PATH):
        result = {
            "success": False,
            "accuracy": None,
            "file_name": None,
            "message": f"User image '{USER_IMAGE_PATH}' not found!"
        }
        print(json.dumps(result))
        return

    user_image_cv2 = preprocess_image(USER_IMAGE_PATH)
    if user_image_cv2 is None:
        print(json.dumps({"success": False, "message": "Failed to load user image."}))
        return
    user_image = cv2.cvtColor(user_image_cv2, cv2.COLOR_BGR2RGB)

    user_face_encodings = face_recognition.face_encodings(user_image)
    if len(user_face_encodings) == 0:
        result = {
            "success": False,
            "accuracy": None,
            "file_name": None,
            "message": "No face detected in the user image!"
        }
        print(json.dumps(result))
        return

    user_face_encoding = user_face_encodings[0]

    for img_name in os.listdir(IMAGES_FOLDER):
        img_path = os.path.join(IMAGES_FOLDER, img_name)
        
        processed_image_cv2 = preprocess_image(img_path)
        if processed_image_cv2 is None:
            continue
        processed_image = cv2.cvtColor(processed_image_cv2, cv2.COLOR_BGR2RGB)
        
        face_encodings = face_recognition.face_encodings(processed_image)
        for face_encoding in face_encodings:
            match = face_recognition.compare_faces([user_face_encoding], face_encoding, tolerance=0.4)
            face_distance = face_recognition.face_distance([user_face_encoding], face_encoding)

            if match[0]:
                similarity = 100 - (face_distance[0] * 100)
                result = {
                    "success": True,
                    "accuracy": f"{similarity:.2f}%",
                    "file_name": os.path.splitext(img_name)[0],
                    "message": f"Match found in '{img_name}' with {similarity:.2f}% similarity."
                }
                print(json.dumps(result))
                return

    result = {
        "success": False,
        "accuracy": None,
        "file_name": None,
        "message": "No match found in any image."
    }
    print(json.dumps(result))

if __name__ == "__main__":
    main()
