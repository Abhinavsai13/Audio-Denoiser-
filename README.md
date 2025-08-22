# Audio-Denoiser-
<img width="972" height="805" alt="image" src="https://github.com/user-attachments/assets/0bfeee73-0db1-4dee-a43f-6a8d495ab3aa" />
🎵 Audio Denoiser (Deep Learning with U-Net)

This project is a speech enhancement system that removes noise from audio using a U-Net based deep learning model.
It works by converting audio to spectrograms, filtering noise through the trained model, and reconstructing clean speech.


📂 Repository Structure
Audio-Denoiser-/
│── audio_denoising.ipynb   # End-to-end Jupyter notebook (training + testing)
│── denoising.ipynb         # Model training and evaluation notebook
│── denoising.py            # Core denoising model implementation
│── audio_record.py         # Script to record audio input from microphone
│── audio_test.py           # Script to test model on noisy audio
│── denoising_model.h5      # Pre-trained model (HDF5 format)
│── my_model.keras          # Pre-trained model (Keras format)
│── README.md               # Documentation

🚀 Features

Record your own audio (audio_record.py)

Denoise noisy audio using pre-trained U-Net model

Works with .wav files (must be named recorded_audio.wav for testing)

Save clean audio output automatically

Provided both .h5 and .keras models for flexible usage

Easy to extend for custom training using provided notebooks

⚙️ Installation

Clone this repository:

git clone https://github.com/Abhinavsai13/Audio-Denoiser-.git
cd Audio-Denoiser-


Install dependencies:

pip install -r requirements.txt


(If requirements.txt is not included, manually install: tensorflow, keras, librosa, numpy, matplotlib, soundfile)

▶️ Usage
1️⃣ Record an Audio Sample

Run the script to record audio (saved as recorded_audio.wav):

python audio_record.py

2️⃣ Test / Denoise Audio

Rename any noisy .wav file as recorded_audio.wav and run:

python audio_test.py


👉 The script will:

Load recorded_audio.wav

Apply the trained U-Net model (denoising_model.h5 or my_model.keras)

Save and play the denoised output

🏗️ Model Details

Architecture: U-Net Convolutional Autoencoder

Input: Noisy spectrogram (via STFT)

Output: Cleaned spectrogram (converted back to audio via iSTFT)

Loss: Mean Squared Error (MSE)

Optimizer: Adam

Dataset: VoiceBank-DEMAND

📊 Results

MSE: 0.000 – 0.006

STOI (speech intelligibility): up to 0.9 in favorable noise conditions

Effective in reducing stationary noise (e.g., fan hum, ambient noise)

Slightly weaker in dynamic noise (e.g., overlapping speech)

🔮 Future Scope

Real-time denoising using lightweight models

Add GUI for easy usage

Improve handling of non-stationary noise

Integrate evaluation metrics (PESQ, SDR, STOI)
