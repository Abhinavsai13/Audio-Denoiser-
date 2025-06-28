import numpy as np
import librosa
import soundfile as sf
import tensorflow as tf
# from google.colab import files
# Modify file names if needed
model_path = 'my_model.keras'  # or 'my_model.h5'
audio_path = 'recorded_audio.wav'

# Load model
print("📦 Loading model...")
model = tf.keras.models.load_model(model_path)

# Load and preprocess audio
print("🔊 Loading audio...")
audio, sr = librosa.load(audio_path, sr=16000)

# Compute STFT
print("🔬 Computing STFT...")
stft = librosa.stft(audio, n_fft=512, hop_length=128)
mag, phase = np.abs(stft), np.angle(stft)

print("ℹ Magnitude shape:", mag.shape)
original_time_frames = mag.shape[1]

# Normalize
mag_norm = mag / np.max(mag)

# ⚙ Pad time dimension to be multiple of 32
target_frames = int(np.ceil(mag_norm.shape[1] / 32) * 32)
pad_amount = target_frames - mag_norm.shape[1]
print(f"📏 Padding from {mag_norm.shape[1]} to {target_frames} (by {pad_amount})")

mag_norm_padded = np.pad(mag_norm, ((0, 0), (0, pad_amount)), mode='constant')
phase_padded = np.pad(phase, ((0, 0), (0, pad_amount)), mode='constant')

# Reshape for model
input_data = np.expand_dims(mag_norm_padded, axis=0)     # (1, 257, time)
input_data = np.expand_dims(input_data, axis=-1)          # (1, 257, time, 1)

# Denoise
print("🤖 Predicting...")
denoised_mag = model.predict(input_data)
denoised_mag = np.squeeze(denoised_mag)  # shape: (257, time)

# 🧹 Remove padding
if denoised_mag.shape[1] > original_time_frames:
    print("✂ Cropping back to original length...")
    denoised_mag = denoised_mag[:, :original_time_frames]
    phase = phase[:, :original_time_frames]

# Restore magnitude scale
denoised_mag = denoised_mag * np.max(mag)

# Reconstruct waveform
denoised_stft = denoised_mag * np.exp(1j * phase)
denoised_audio = librosa.istft(denoised_stft, hop_length=128)

# Save result
output_path = 'denoised_output.wav'
sf.write(output_path, denoised_audio, sr)
print(f"✅ Denoised audio saved as '{output_path}'")

# Optional: Download the result
# files.download(output_path)