import json
import face_recognition
import os
import cv2
import numpy as np

USER_IMAGE_PATH = "public/userImage/userImage.jpg"
IMAGES_FOLDER = "public/images"

def align_faces(image):
    """
    Aligns faces in an image based on landmarks.
    This can improve accuracy for faces with different poses.
    """
    face_landmarks_list = face_recognition.face_landmarks(image)
    if len(face_landmarks_list) > 0:
        face_landmarks = face_landmarks_list[0]
        
        left_eye = face_landmarks['left_eye']
        right_eye = face_landmarks['right_eye']

        left_eye_center = np.mean(left_eye, axis=0)
        right_eye_center = np.mean(right_eye, axis=0)

        angle = np.arctan2(right_eye_center[1] - left_eye_center[1], right_eye_center[0] - left_eye_center[0]) * 180.0 / np.pi

        image = np.array(image)
        (h, w) = image.shape[:2]
        center = (w // 2, h // 2)
        matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated_image = cv2.warpAffine(image, matrix, (w, h), flags=cv2.INTER_CUBIC)

        return rotated_image
    else:
        return image

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

    user_image = face_recognition.load_image_file(USER_IMAGE_PATH)
    user_image = align_faces(user_image) 
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
        image = face_recognition.load_image_file(img_path)
        image = align_faces(image) 
        face_encodings = face_recognition.face_encodings(image)
        
        for face_encoding in face_encodings:
            match = face_recognition.compare_faces([user_face_encoding], face_encoding, tolerance=0.6) 
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
