from flask import Flask, request, render_template
from ultralytics import YOLO
import numpy as np
from PIL import Image
import cv2
from sahi.predict import get_sliced_prediction
from sahi import AutoDetectionModel  # Import the AutoDetectionModel
import os
import zipfile
import io
import json
import os
import numpy as np
from PIL import Image
from flask import Flask, request, send_file, jsonify

app = Flask(__name__)

class Detection:
    def __init__(self):
        # Set the model path andonfidence threshold
        yolov8_model_path = "./object_detection/best.pt"  # Update to your model path

        # Initialize the AutoDetectionModel
        self.model = AutoDetectionModel.from_pretrained(
            model_type='yolov8',  # Use 'yolov8' if that’s what you intended
            model_path=yolov8_model_path,
            confidence_threshold=0.3,
            device="cpu"  # Change to 'cuda:0' if you are using a GPU
        )

        self.class_labels = {0: 'Nicks', 1: 'Dents', 2: 'Scratches', 3: 'Pittings'}
       
    def detect_from_image(self, image):

        # Perform sliced prediction with SAHI
        results = get_sliced_prediction(
            image=image,
            detection_model=self.model,  # Use the initialized AutoDetectionModel
            slice_height=256,
            slice_width=256,
            overlap_height_ratio=0.2,
            overlap_width_ratio=0.2,
            postprocess_type='NMS',
            postprocess_match_metric='IOU',
            postprocess_match_threshold=0.1,
            postprocess_class_agnostic=True
        )

        # Return results for visualization
        return results

detection = Detection()

@app.route('/')
def index():
    return render_template('index.html')





#image and annotation in zip


# @app.route('/object-detection/', methods=['POST'])
# def apply_detections():
#     try:
#         # Load the image from the request
#         file = request.files['file']
#         img = Image.open(file.stream).convert("RGB")
#         img = np.array(img)

#         # Perform detection
#         results = detection.detect_from_image(img)

#         # Define paths for the output image and annotation JSON
#         output_filename = "prediction_visual.png"
#         exported_image_path = os.path.join(detection.export_dir, output_filename)
#         annotation_filename = "annotations.json"
#         annotation_path = os.path.join(detection.export_dir, annotation_filename)

#         # Save visualized detection results to an image
#         results.export_visuals(
#             export_dir=detection.export_dir,
#             text_size=0.4,
#             rect_th=2
#         )

#         # Send the generated image back to the client
#         with open(exported_image_path, "rb") as img_file:
#             buf = io.BytesIO(img_file.read())
#             buf.seek(0)
#             send_file(buf, mimetype='image/png', as_attachment=True, download_name=output_filename)

#         # Save COCO annotations to a JSON file
#         coco_annotations = results.to_coco_annotations()
#         with open(annotation_path, "w") as f:
#             json.dump(coco_annotations, f)

#         # Create a zip file with both the image and annotations
#         zip_buffer = io.BytesIO()
#         with zipfile.ZipFile(zip_buffer, "w") as zip_file:
#             zip_file.write(exported_image_path, output_filename)
#             zip_file.write(annotation_path, annotation_filename)
#         zip_buffer.seek(0)

#         # Send the zip file to the client
#         return send_file(zip_buffer, mimetype='application/zip', as_attachment=True, download_name="detection_results.zip")

#     except Exception as e:
#         # Return a JSON response with error details if an error occurs
#         return jsonify({'error': f"Detection failed: {str(e)}"}), 500






import tempfile


@app.route('/object-detection/', methods=['POST'])
def apply_detections():
    try:
        # Load the image from the request
        file = request.files['file']
        img = Image.open(file.stream).convert("RGB")
        img = np.array(img)

        # Perform detection
        results = detection.detect_from_image(img)

        # Create a temporary directory to export the visualized image
        with tempfile.TemporaryDirectory() as temp_dir:
            # Define paths for the output image and annotation JSON
            output_filename = os.path.join(temp_dir, "prediction_visual.png")
            annotation_filename = os.path.join(temp_dir, "annotations.json")

            # Save visualized detection results to an image file
            results.export_visuals(
                export_dir=temp_dir,  # Use the temporary directory for export
                text_size=0.4,
                rect_th=2
            )

            # Load the visualized image into a BytesIO buffer
            img_buffer = io.BytesIO()
            with open(output_filename, "rb") as img_file:
                img_buffer.write(img_file.read())
            img_buffer.seek(0)

            # Save COCO annotations to a JSON file in the temporary directory
            coco_annotations = results.to_coco_annotations()
            with open(annotation_filename, "w") as f:
                json.dump(coco_annotations, f)

            # Create a BytesIO buffer for the JSON annotations
            annotation_buffer = io.BytesIO()
            with open(annotation_filename, "rb") as json_file:
                annotation_buffer.write(json_file.read())
            annotation_buffer.seek(0)

            # Create a zip file with both the image and annotations
            zip_buffer = io.BytesIO()
            with zipfile.ZipFile(zip_buffer, "w") as zip_file:
                zip_file.writestr("prediction_visual.png", img_buffer.getvalue())
                zip_file.writestr("annotations.json", annotation_buffer.getvalue())

            # Move the zip buffer cursor to the beginning so it can be sent
            zip_buffer.seek(0)

            # Send the zip file to the client
            return send_file(zip_buffer, mimetype='application/zip', as_attachment=True, download_name="detection_results.zip")

    except Exception as e:
        # Return a JSON response with error details if an error occurs
        return jsonify({'error': f"Detection failed: {str(e)}"}), 500
    


# if __name__ == '__main__':
#     app.run(host="0.0.0.0", port=8000)



if __name__ == '__main__':
    app.run(debug=False,host="0.0.0.0")
































#------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------




#------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

#image only

# from flask import Flask, request, jsonify, send_file
# from PIL import Image
# import numpy as np
# import io
# import os

# @app.route('/object-detection/', methods=['POST'])
# def apply_detections():
#     try:
#         # Load the image from the request
#         file = request.files['file']
#         img = Image.open(file.stream).convert("RGB")
#         img = np.array(img)

#         # Perform detection
#         results = detection.detect_from_image(img)

#         # Define and create the output path for the image
#         output_filename = "prediction_visual.png"
#         exported_image_path = os.path.join(detection.export_dir, output_filename)
#         results.export_visuals(
#             export_dir=detection.export_dir,
#             text_size=0.4,
#             rect_th=2
#         )

#         # Assuming `results` is your object with the method `to_coco_annotations`
#         coco_annotations = results.to_coco_annotations()

#         # Define the output path
#         output_path = r"C:\Internship Project YoloV11 Web\results\annotations.json"

#         # Save the COCO annotations to the specified directory
#         with open(output_path, "w") as f:
#             import json
#             json.dump(coco_annotations, f)


#         # Send the generated image back to the client
#         with open(exported_image_path, "rb") as img_file:
#             buf = io.BytesIO(img_file.read())
#             buf.seek(0)
#             return send_file(buf, mimetype='image/png')

#     except Exception as e:
#         # If an error occurs, return a JSON response with error details
#         error_message = f"Detection failed: {str(e)}"
#         return jsonify({'error': error_message}), 500


#------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


#Standard Inference

# from flask import Flask, request, render_template, send_file, Response
# from ultralytics import YOLO
# import numpy as np
# from PIL import Image
# import io
# import cv2

# app = Flask(__name__)

# class Detection:
#     def __init__(self):
#         self.model = YOLO(r"C:\Object-Detection-Yolo-Flask\object_detection\best.pt")

#         self.class_color_thickness = {
#             'Nicks': {'color': (255, 60, 60), 'thickness': 2},      
#             'Dents': {'color': (255, 156, 148), 'thickness': 2},    
#             'Scratches': {'color': (255, 116, 28), 'thickness': 2},
#             'Pittings': {'color': (255, 180, 28), 'thickness': 2} 
#         }

#         self.class_labels = {0: 'Nicks', 1: 'Dents', 2: 'Scratches', 3: 'Pittings'}

#     def predict(self, img, classes=[], conf=0.5):
#         if classes:
#             results = self.model.predict(img, classes=classes, conf=conf)
#         else:
#             results = self.model.predict(img, conf=conf)
#         return results

#     def predict_and_detect(self, img, classes=[], conf=0.5):
#         results = self.predict(img, classes, conf=conf)
#         for result in results:
#             for box in result.boxes:
#                 class_id = int(box.cls[0])
#                 class_name = self.class_labels.get(class_id, "Unknown")

#                 print(f"Detected class: {class_name} with color {self.class_color_thickness.get(class_name)['color']}")

#                 style = self.class_color_thickness.get(class_name, {'color': (255, 255, 255), 'thickness': 2})

#                 cv2.rectangle(img, (int(box.xyxy[0][0]), int(box.xyxy[0][1])),
#                               (int(box.xyxy[0][2]), int(box.xyxy[0][3])),
#                               style['color'], style['thickness'])

#                 cv2.putText(img, class_name,
#                             (int(box.xyxy[0][0]), int(box.xyxy[0][1]) - 10),
#                             cv2.FONT_HERSHEY_PLAIN, 1, style['color'], 2)

#         return img, results

#     def detect_from_image(self, image):
#         result_img, _ = self.predict_and_detect(image, classes=[], conf=0.5)
#         return result_img

# detection = Detection()

# @app.route('/')
# def index():
#     return render_template('index.html')

# @app.route('/object-detection/', methods=['POST'])
# def apply_detection():
#     if 'image' not in request.files:
#         return 'No file part'

#     file = request.files['image']
#     if file.filename == '':
#         return 'No selected file'

#     if file:

#         img = Image.open(file.stream).convert("RGB")  
#         img = np.array(img)

#         img = detection.detect_from_image(img)

#         output = Image.fromarray(img)

#         buf = io.BytesIO()
#         output.save(buf, format="PNG")
#         buf.seek(0)

#         return send_file(buf, mimetype='image/png')

# @app.route('/video')
# def index_video():
#     return render_template('video.html')

# def gen_frames():
#     cap = cv2.VideoCapture(0)
#     while cap.isOpened():
#         ret, frame = cap.read()
#         frame = cv2.resize(frame, (512, 512))
#         if frame is None:
#             break
#         frame = detection.detect_from_image(frame)

#         ret, buffer = cv2.imencode('.jpg', frame)
#         frame = buffer.tobytes()

#         yield (b'--frame\r\n'
#                b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

# @app.route('/video_feed')
# def video_feed():
#     return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

# if __name__ == '__main__':
#     app.run(host="0.0.0.0", port=8000)
#     # http://localhost:8000/video for video source
#      # http://localhost:8000 for image source

