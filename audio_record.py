import pyaudio
import wave
import keyboard

# Audio settings
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 44100
CHUNK = 1024
FILENAME = "recorded_audio.wav"

def record_audio():
    audio = pyaudio.PyAudio()

    print("Press 'r' to start recording...")
    keyboard.wait('r')
    print("Recording started. Press 's' to stop...")

    stream = audio.open(format=FORMAT, channels=CHANNELS,
                        rate=RATE, input=True,
                        frames_per_buffer=CHUNK)

    frames = []

    while not keyboard.is_pressed('s'):
        data = stream.read(CHUNK)
        frames.append(data)

    print("Recording stopped.")

    stream.stop_stream()
    stream.close()
    audio.terminate()

    # Save the recording
    wf = wave.open(FILENAME, 'wb')
    wf.setnchannels(CHANNELS)
    wf.setsampwidth(audio.get_sample_size(FORMAT))
    wf.setframerate(RATE)
    wf.writeframes(b''.join(frames))
    wf.close()

    print(f"Audio saved as {FILENAME}")

if __name__ == "__main__":
    record_audio()
