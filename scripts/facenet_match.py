import json
import face_recognition
import os
import cv2
import numpy as np

USER_IMAGE_PATH = "public/userImage/userImage.jpg"
IMAGES_FOLDER = "public/images"

def align_faces(image):
    """
    Aligns faces in an image based on eye landmarks to improve recognition accuracy.
    """
    face_landmarks_list = face_recognition.face_landmarks(image)
    
    if not face_landmarks_list:
        return image  

    face_landmarks = face_landmarks_list[0]
    if 'left_eye' in face_landmarks and 'right_eye' in face_landmarks:
        left_eye_center = np.mean(face_landmarks['left_eye'], axis=0)
        right_eye_center = np.mean(face_landmarks['right_eye'], axis=0)

        angle = np.arctan2(right_eye_center[1] - left_eye_center[1], 
                           right_eye_center[0] - left_eye_center[0]) * 180.0 / np.pi

        image = np.array(image)
        (h, w) = image.shape[:2]
        center = (w // 2, h // 2)
        matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated_image = cv2.warpAffine(image, matrix, (w, h), flags=cv2.INTER_CUBIC)
        return rotated_image

    return image

def main():
    try:
        if not os.path.exists(USER_IMAGE_PATH):
            print(json.dumps({
                "success": False,
                "accuracy": None,
                "file_name": None,
                "message": f"User image '{USER_IMAGE_PATH}' not found!"
            }))
            return

        user_image = face_recognition.load_image_file(USER_IMAGE_PATH)
        user_image = align_faces(user_image)
        user_face_encodings = face_recognition.face_encodings(user_image)

        if not user_face_encodings:
            print(json.dumps({
                "success": False,
                "accuracy": None,
                "file_name": None,
                "message": "No face detected in the user image!"
            }))
            return

        user_face_encoding = user_face_encodings[0]

        if not os.path.exists(IMAGES_FOLDER):
            print(json.dumps({
                "success": False,
                "accuracy": None,
                "file_name": None,
                "message": f"Image folder '{IMAGES_FOLDER}' not found!"
            }))
            return

        for img_name in os.listdir(IMAGES_FOLDER):
            img_path = os.path.join(IMAGES_FOLDER, img_name)

            try:
                image = face_recognition.load_image_file(img_path)
                image = align_faces(image)
                face_encodings = face_recognition.face_encodings(image)

                for face_encoding in face_encodings:
                    match = face_recognition.compare_faces([user_face_encoding], face_encoding, tolerance=0.6)
                    face_distance = face_recognition.face_distance([user_face_encoding], face_encoding)

                    if match[0]:
                        similarity = 100 - (face_distance[0] * 100)
                        print(json.dumps({
                            "success": True,
                            "accuracy": f"{similarity:.2f}%",
                            "file_name": os.path.splitext(img_name)[0],
                            "message": f"Match found in '{img_name}' with {similarity:.2f}% similarity."
                        }))
                        return  

            except Exception as e:
                print(json.dumps({
                    "success": False,
                    "accuracy": None,
                    "file_name": img_name,
                    "message": f"Error processing image '{img_name}': {str(e)}"
                }))
                return 

        print(json.dumps({
            "success": False,
            "accuracy": None,
            "file_name": None,
            "message": "No match found in any image."
        }))

    except Exception as e:
        print(json.dumps({
            "success": False,
            "accuracy": None,
            "file_name": None,
            "message": f"Unexpected error: {str(e)}"
        }))

if __name__ == "__main__":
    main()
