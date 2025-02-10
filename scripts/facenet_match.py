import json
import face_recognition
import os

USER_IMAGE_PATH = "public/userImage/userImage.jpg"
IMAGES_FOLDER = "public/images"

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
        face_encodings = face_recognition.face_encodings(image)

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
