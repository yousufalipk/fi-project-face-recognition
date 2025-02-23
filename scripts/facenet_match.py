import json
import face_recognition
import os
import cv2
import numpy as np

USER_IMAGE_PATH = "public/userImage/userImage.jpg"
IMAGES_FOLDER = "public/Images"

def align_faces(image):
    """
    Aligns faces in an image based on eye positions to improve recognition accuracy.
    """
    face_landmarks_list = face_recognition.face_landmarks(image)
    if not face_landmarks_list:
        return image  # No faces detected, return original image
    
    face_landmarks = face_landmarks_list[0]  # Take first detected face
    left_eye = np.array(face_landmarks['left_eye'])
    right_eye = np.array(face_landmarks['right_eye'])

    left_eye_center = np.mean(left_eye, axis=0)
    right_eye_center = np.mean(right_eye, axis=0)

    angle = np.arctan2(right_eye_center[1] - left_eye_center[1], right_eye_center[0] - left_eye_center[0]) * 180.0 / np.pi

    (h, w) = image.shape[:2]
    center = (w // 2, h // 2)
    matrix = cv2.getRotationMatrix2D(tuple(center), angle, 1.0)
    aligned_image = cv2.warpAffine(image, matrix, (w, h), flags=cv2.INTER_CUBIC)

    return aligned_image

def process_image(image_path):
    try:
        image = face_recognition.load_image_file(image_path)
        image = align_faces(image)
        face_encodings = face_recognition.face_encodings(image)
        return face_encodings
    except Exception as e:
        print(f"Skipping corrupted image: {image_path}, Error: {str(e)}")
        return []

def main():
    if not os.path.exists(USER_IMAGE_PATH):
        print(json.dumps({"success": False, "accuracy": None, "file_name": None, "message": f"User image '{USER_IMAGE_PATH}' not found!"}))
        return

    user_face_encodings = process_image(USER_IMAGE_PATH)
    if not user_face_encodings:
        print(json.dumps({"success": False, "accuracy": None, "file_name": None, "message": "No face detected in the user image!"}))
        return

    user_face_encoding = user_face_encodings[0]
    best_match = None
    best_accuracy = 0

    for img_name in os.listdir(IMAGES_FOLDER):
        img_path = os.path.join(IMAGES_FOLDER, img_name)
        face_encodings = process_image(img_path)

        for face_encoding in face_encodings:
            match = face_recognition.compare_faces([user_face_encoding], face_encoding, tolerance=0.6)
            face_distance = face_recognition.face_distance([user_face_encoding], face_encoding)

            if match[0]:
                similarity = 100 - (face_distance[0] * 100)
                if similarity > best_accuracy:
                    best_accuracy = similarity
                    best_match = img_name

    print(json.dumps({
        "success": bool(best_match),
        "accuracy": f"{best_accuracy:.2f}%" if best_match else None,
        "file_name": os.path.splitext(best_match)[0] if best_match else None,
        "message": f"Match found in '{best_match}' with {best_accuracy:.2f}% similarity." if best_match else "No match found."
    }))

if __name__ == "__main__":
    main()
