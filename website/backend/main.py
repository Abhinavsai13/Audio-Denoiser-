# main.py
import pyaudio
import wave
import numpy as np
import librosa
import soundfile as sf
import tensorflow as tf
import os

FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000  # Match with librosa
CHUNK = 1024
MODEL_PATH = "my_model.keras"

model = tf.keras.models.load_model(MODEL_PATH)



def denoise_audio(input_file="recorded_audio.wav", output_file="denoised_output.wav"):
    try:
        print(f"🔍 Checking input file: {input_file}")
        if not os.path.exists(input_file):
            print("❌ Input audio file not found.")
            return

        print("🔊 Loading audio with librosa...")
        audio, sr = librosa.load(input_file, sr=RATE)
        print(f"📏 Loaded audio length: {len(audio)}, Sample rate: {sr}")

        if len(audio) == 0:
            print("❌ Loaded audio is empty!")
            return

        stft = librosa.stft(audio, n_fft=512, hop_length=128)
        mag, phase = np.abs(stft), np.angle(stft)
        original_time_frames = mag.shape[1]

        if np.max(mag) == 0:
            print("❌ Silence or zeroed input — skipping denoising.")
            return

        mag_norm = mag / np.max(mag)

        target_frames = int(np.ceil(mag_norm.shape[1] / 32) * 32)
        pad_amount = target_frames - mag_norm.shape[1]
        mag_norm_padded = np.pad(mag_norm, ((0, 0), (0, pad_amount)), mode='constant')
        phase = np.pad(phase, ((0, 0), (0, pad_amount)), mode='constant')

        input_data = np.expand_dims(mag_norm_padded, axis=(0, -1))

        print(f"🤖 Model input shape: {input_data.shape}")
        denoised_mag = model.predict(input_data)
        print(f"✅ Model output shape: {denoised_mag.shape}")
        denoised_mag = np.squeeze(denoised_mag)

        denoised_mag = denoised_mag[:, :original_time_frames]
        phase = phase[:, :original_time_frames]
        denoised_mag = denoised_mag * np.max(mag)

        denoised_stft = denoised_mag * np.exp(1j * phase)
        denoised_audio = librosa.istft(denoised_stft, hop_length=128)

        sf.write(output_file, denoised_audio, sr)
        print(f"✅ Denoised audio saved to {output_file}")

    except Exception as e:
        print(f"❌ Error during denoising: {e}")


def record_audio(output_file="recorded_audio.wav", duration=5):
    save_dir = r"C:\Users\abhin\Desktop\prj\website\backend\recordings"
    os.makedirs(save_dir, exist_ok=True)
    full_path = os.path.join(save_dir, output_file)

    audio = pyaudio.PyAudio()
    stream = audio.open(format=FORMAT, channels=CHANNELS,
                        rate=RATE, input=True, frames_per_buffer=CHUNK)

    print("⏺ Recording...")
    frames = []
    for _ in range(0, int(RATE / CHUNK * duration)):
        data = stream.read(CHUNK)
        frames.append(data)
    print("⏹ Done recording.")

    stream.stop_stream()
    stream.close()
    audio.terminate()

    with wave.open(full_path, 'wb') as wf:
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(audio.get_sample_size(FORMAT))
        wf.setframerate(RATE)
        wf.writeframes(b''.join(frames))

    print(f"📁 Audio saved to: {full_path}")

    return full_path  # so we can use it in denoise_audio

# Usage
recorded_path = record_audio()
denoise_audio(input_file=recorded_path)
