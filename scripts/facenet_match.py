import json
import face_recognition
import os
import cv2
import numpy as np
import sys

USER_IMAGE_PATH = "public/userImage/userImage.jpg"
IMAGES_FOLDER = "public/images"
MODEL_PATH = os.path.join(os.path.dirname(__file__), "ESPCN_x4.pb") 

def preprocess_image(image_path):
    """Load and enhance image quality before face recognition."""
    image = cv2.imread(image_path)
    if image is None:
        return None

    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image_rgb = image_rgb.astype(np.float32) / 255.0

    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    lab = cv2.merge((l, a, b))
    enhanced_image = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)

    return enhanced_image

def super_resolve(image):
    """Use AI Super-Resolution to upscale blurry images."""
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Super-resolution model not found at {MODEL_PATH}")

    sr = cv2.dnn_superres.DnnSuperResImpl_create()
    sr.readModel(MODEL_PATH)
    sr.setModel("espcn", 4) 

    upscaled = sr.upsample(image)
    return upscaled

def main():
    if not os.path.exists(USER_IMAGE_PATH):
        print(json.dumps({
            "success": False,
            "accuracy": None,
            "file_name": None,
            "message": f"User image '{USER_IMAGE_PATH}' not found!"
        }))
        return

    user_image_cv2 = preprocess_image(USER_IMAGE_PATH)
    if user_image_cv2 is None:
        print(json.dumps({"success": False, "message": "Failed to load user image."}))
        return

    user_image_cv2 = super_resolve(user_image_cv2)
    user_image_rgb = cv2.cvtColor(user_image_cv2, cv2.COLOR_BGR2RGB)

    user_face_encodings = face_recognition.face_encodings(user_image_rgb, model="cnn")
    if len(user_face_encodings) == 0:
        print(json.dumps({
            "success": False,
            "accuracy": None,
            "file_name": None,
            "message": "No face detected in the user image!"
        }))
        return

    user_face_encoding = user_face_encodings[0]
    best_match = None
    highest_similarity = 0

    for img_name in os.listdir(IMAGES_FOLDER):
        img_path = os.path.join(IMAGES_FOLDER, img_name)

        processed_image_cv2 = preprocess_image(img_path)
        if processed_image_cv2 is None:
            continue

        processed_image_cv2 = super_resolve(processed_image_cv2)
        processed_image_rgb = cv2.cvtColor(processed_image_cv2, cv2.COLOR_BGR2RGB)

        face_encodings = face_recognition.face_encodings(processed_image_rgb, model="cnn")
        if len(face_encodings) == 0:
            print(f"Skipping {img_name}: No faces detected.", file=sys.stderr)  # Redirect non-JSON messages
            continue

        for face_encoding in face_encodings:
            match = face_recognition.compare_faces([user_face_encoding], face_encoding, tolerance=0.45)
            face_distance = face_recognition.face_distance([user_face_encoding], face_encoding)

            similarity = 100 - (face_distance[0] * 100)
            if match[0] and similarity > highest_similarity:
                highest_similarity = similarity
                best_match = img_name

    if best_match:
        print(json.dumps({
            "success": True,
            "accuracy": f"{highest_similarity:.2f}%",
            "file_name": os.path.splitext(best_match)[0],
            "message": f"Best match found in '{best_match}' with {highest_similarity:.2f}% similarity."
        }))
    else:
        print(json.dumps({
            "success": False,
            "accuracy": None,
            "file_name": None,
            "message": "No match found in any image."
        }))

if __name__ == "__main__":
    main()
