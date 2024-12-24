import cv2
import subprocess
import numpy as np
import tkinter as tk
from tkinter import ttk
from threading import Thread
from PIL import Image, ImageTk
import RPi.GPIO as GPIO
import time
import requests
import json
import datetime
import os
from azure.storage.blob import BlobServiceClient

# Configuracion GPIO
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
BUZZER_PIN = 18  # GPIO para el buzzer
PROXIMITY_SENSOR_PIN = 23  # GPIO para el sensor de proximidad
GPIO.setup(BUZZER_PIN, GPIO.OUT)
GPIO.setup(PROXIMITY_SENSOR_PIN, GPIO.IN)

# Intervalo minimo entre detecciones (en segundos)
DETECTION_INTERVAL = 5

# URL de la API GraphQL
API_URL = "http://192.168.0.22:3000/api/graphql"

# Carpeta para guardar fotos
PHOTO_DIRECTORY = "photos"

# Crear carpeta si no existe
if not os.path.exists(PHOTO_DIRECTORY):
    os.makedirs(PHOTO_DIRECTORY)

# Credenciales para Azure Blob Storage
AZURE_CONNECTION_STRING = "DefaultEndpointsProtocol=https;AccountName=photosstoragemotionguard;AccountKey=smUpYTlbkqj9PC5tNU1erNA2+IF9ClfTEIS9V4ZMaBeA873GlE/c24Iak01jR5cbpZ1sL9DvwslY+AStOaemaA==;EndpointSuffix=core.windows.net"
AZURE_CONTAINER_NAME = "photos"

# Funcion para subir archivos a Azure Blob Storage
def subir_a_azure(local_file_path, blob_name):
    try:
        blob_service_client = BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING)
        container_client = blob_service_client.get_container_client(AZURE_CONTAINER_NAME)

        if not container_client.exists():
            print(f"El contenedor '{AZURE_CONTAINER_NAME}' no existe.")
            return

        with open(local_file_path, "rb") as data:
            container_client.upload_blob(name=blob_name, data=data, overwrite=True)

        print(f"Archivo subido exitosamente a Azure Blob Storage: {blob_name}")
    except Exception as e:
        print(f"Error subiendo archivo a Azure: {e}")

# Funcion para enviar la mutacion GraphQL
def crear_evento(camera_id, description, event_type):
    query = """
    mutation CreateEventLog($data: EventLogCreateInput!) {
      createEventLog(data: $data) {
        description
        eventType
        timestamp
        camera {
          cameraId
        }
      }
    }
    """
    variables = {
        "data": {
            "description": description,
            "eventType": event_type,
            "timestamp": datetime.datetime.now().isoformat() + "Z",  # ISO 8601 con zona horaria UTC
        }
    }

    if camera_id:
        variables["data"]["camera"] = {
            "connect": {
                "cameraId": camera_id
            }
        }

    try:
        response = requests.post(
            API_URL,
            headers={"Content-Type": "application/json"},
            data=json.dumps({"query": query, "variables": variables}),
        )
        response_data = response.json()
        if "errors" in response_data:
            print("Error en la mutacion:", response_data["errors"])
        else:
            print("Evento creado exitosamente:", response_data["data"])
    except requests.exceptions.RequestException as e:
        print("Error de conexion:", e)

# Clase para la interfaz grafica y deteccion de eventos
class App:
    def __init__(self, root, video_source=0):
        self.root = root
        self.root.title("Sistema de Seguridad")
        self.video_source = video_source

        self.sensor_proximidad_activado = tk.BooleanVar(value=True)
        self.sensor_buzzer_activado = tk.BooleanVar(value=True)

        self.last_detection_time = time.time()
        self.previous_proximity_state = GPIO.input(PROXIMITY_SENSOR_PIN)

        self.net = cv2.dnn.readNet("yolov4-tiny.weights", "yolov4-tiny.cfg")
        self.net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
        self.net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)

        with open("coco.names", "r") as f:
            self.classes = [line.strip() for line in f.readlines()]

        self.video_frame = tk.Label(root)
        self.video_frame.grid(row=0, column=0, columnspan=2)

        ttk.Label(root, text="Activar Sensor de Proximidad:").grid(row=1, column=0, sticky="w")
        self.proximidad_switch = ttk.Checkbutton(root, variable=self.sensor_proximidad_activado)
        self.proximidad_switch.grid(row=1, column=1, sticky="w")
        
        ttk.Label(root, text="Activar Buzzer:").grid(row=2, column=0, sticky="w")
        self.buzzer_switch = ttk.Checkbutton(root, variable=self.sensor_buzzer_activado)
        self.buzzer_switch.grid(row=2, column=1, sticky="w")

        self.exit_button = ttk.Button(root, text="Salir", command=self.on_closing)
        self.exit_button.grid(row=3, column=0, columnspan=2)

        self.pipeline = (
            "libcamera-vid --inline --nopreview --codec mjpeg -o - --width 320 --height 240 --framerate 30 --timeout 0"
        )
        self.process = subprocess.Popen(
            self.pipeline.split(), stdout=subprocess.PIPE, bufsize=10**8
        )

        self.running = True
        self.buffer = b""

        self.update_video()

        self.sensor_thread = Thread(target=self.monitor_sensors, daemon=True)
        self.sensor_thread.start()

    def update_video(self):
        if self.running:
            self.buffer += self.process.stdout.read(4096)

            if len(self.buffer) > 100000:
                self.buffer = self.buffer[-50000:]

            start = self.buffer.find(b'\xff\xd8')
            end = self.buffer.find(b'\xff\xd9')

            if start != -1 and end != -1:
                jpg = self.buffer[start:end+2]
                self.buffer = self.buffer[end+2:]
                frame = cv2.imdecode(np.frombuffer(jpg, dtype=np.uint8), cv2.IMREAD_COLOR)

                height, width, _ = frame.shape
                blob = cv2.dnn.blobFromImage(frame, 1/255.0, (320, 320), (0, 0, 0), swapRB=True, crop=False)
                self.net.setInput(blob)
                output_layers = self.net.getUnconnectedOutLayersNames()
                layer_outputs = self.net.forward(output_layers)

                boxes, confidences, class_ids = [], [], []

                for output in layer_outputs:
                    for detection in output:
                        scores = detection[5:]
                        class_id = np.argmax(scores)
                        confidence = scores[class_id]

                        if confidence > 0.5 and self.classes[class_id] == "person":
                            center_x, center_y, w, h = (detection[0:4] * np.array([width, height, width, height])).astype("int")
                            x = int(center_x - w / 2)
                            y = int(center_y - h / 2)

                            boxes.append([x, y, int(w), int(h)])
                            confidences.append(float(confidence))
                            class_ids.append(class_id)

                indexes = cv2.dnn.NMSBoxes(boxes, confidences, 0.5, 0.4)

                if len(indexes) > 0 and (time.time() - self.last_detection_time > DETECTION_INTERVAL):
                    for i in indexes.flatten():
                        x, y, w, h = boxes[i]
                        label = f"{self.classes[class_ids[i]]}: {confidences[i]:.2f}"
                        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
                        cv2.putText(frame, label, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
                        print("Persona detectada.")

                        self.last_detection_time = time.time()
                        timestamp = time.strftime("%Y%m%d-%H%M%S")
                        photo_path = os.path.join(PHOTO_DIRECTORY, f"persona_{timestamp}.jpg")
                        cv2.imwrite(photo_path, frame)
                        print(f"Foto guardada en: {photo_path}")

                        blob_name = os.path.basename(photo_path)
                        subir_a_azure(photo_path, blob_name)

                        self.activar_buzzer()
                        crear_evento("1", "Deteccion de movimiento", "Persona detectada")

                frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                frame = Image.fromarray(frame)
                frame = ImageTk.PhotoImage(frame)

                self.video_frame.config(image=frame)
                self.video_frame.image = frame

            self.root.after(10, self.update_video)

    def monitor_sensors(self):
        time.sleep(1)

        while self.running:
            current_proximity_state = GPIO.input(PROXIMITY_SENSOR_PIN)
            if (
                self.sensor_proximidad_activado.get()
                and current_proximity_state == GPIO.HIGH
                and self.previous_proximity_state == GPIO.LOW
                and (time.time() - self.last_detection_time > DETECTION_INTERVAL)
            ):
                print("Objeto detectado por el sensor de proximidad.")
                self.last_detection_time = time.time()
                self.activar_buzzer()
                crear_evento("1", "Deteccion de proximidad", "Objeto detectado")
            self.previous_proximity_state = current_proximity_state
            time.sleep(0.1)

    def activar_buzzer(self):
        if self.sensor_buzzer_activado.get():
            GPIO.output(BUZZER_PIN, GPIO.HIGH)
            time.sleep(0.5)
            GPIO.output(BUZZER_PIN, GPIO.LOW)

    def on_closing(self):
        self.running = False
        self.process.terminate()
        GPIO.cleanup()
        self.root.destroy()


if __name__ == "__main__":
    print("Iniciando MotionGuard...")
    root = tk.Tk()
    app = App(root)
    root.mainloop()
