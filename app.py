from flask import Flask, request, render_template, send_file, jsonify
import numpy as np
from PIL import Image
from sahi.predict import get_sliced_prediction
from sahi import AutoDetectionModel
import os
import zipfile
import io
import json


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
    app.run(debug=True)
