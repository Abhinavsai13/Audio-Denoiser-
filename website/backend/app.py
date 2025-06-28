# app.py
from flask import Flask, jsonify, send_file
from flask_cors import CORS
import os
from main import record_audio, denoise_audio

app = Flask(__name__)
CORS(app)

@app.route('/start-processing', methods=['POST'])
def start_processing():
    try:
        # 1. Record for 5 seconds and save
        record_audio("recorded_audio.wav", duration=5)

        # 2. Denoise and save output
        denoise_audio("recordings/recorded_audio.wav", "recordings/denoised_output.wav")

        return jsonify({"status": "success", "message": "Denoised audio ready", "file": "/get-audio"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route('/get-audio', methods=['GET'])
def get_audio():
    path = "denoised_output.wav"
    if os.path.exists(path):
        return send_file(path, mimetype="audio/wav")
    return jsonify({"status": "error", "message": "No audio found"}), 404

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)

