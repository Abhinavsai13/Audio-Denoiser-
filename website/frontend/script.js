// DOM Elements
const recordBtn = document.getElementById("recordBtn");
const stopBtn = document.getElementById("stopBtn");
const loader = document.getElementById("loader");
const downloadBtn = document.getElementById("downloadBtn");
const audioSection = document.getElementById("audioSection");
const tryNowBtn = document.getElementById("tryNowBtn");
const ctaRecordBtn = document.getElementById("ctaRecordBtn");
const recordingStatus = document.getElementById("recordingStatus");
const volumeMeter = document.getElementById("volumeMeter");
const processingTime = document.getElementById("processingTime");
const timeValue = document.getElementById("timeValue");
const playOriginalBtn = document.getElementById("playOriginalBtn");
const playDenoisedBtn = document.getElementById("playDenoisedBtn");
const downloadOriginalBtn = document.getElementById("downloadOriginalBtn");
const originalDuration = document.getElementById("originalDuration");
const denoisedDuration = document.getElementById("denoisedDuration");
const originalFileSize = document.getElementById("originalFileSize");
const denoisedFileSize = document.getElementById("denoisedFileSize");
const resultsStats = document.getElementById("resultsStats");

// Audio variables
let chunks = [];
let mediaRecorder;
let audioContext;
let analyser;
let microphone;
let recordingStartTime;
let processingInterval;
let originalAudioBlob;

// Initialize WaveSurfer
let waveformOriginal = WaveSurfer.create({
  container: '#waveform-original',
  waveColor: '#818cf8',
  progressColor: '#4f46e5',
  cursorColor: '#4f46e5',
  barWidth: 2,
  barRadius: 3,
  barGap: 2,
  height: 100,
  responsive: true,
  normalize: true,
  partialRender: true
});

let waveformDenoised = WaveSurfer.create({
  container: '#waveform-denoised',
  waveColor: '#a78bfa',
  progressColor: '#7c3aed',
  cursorColor: '#7c3aed',
  barWidth: 2,
  barRadius: 3,
  barGap: 2,
  height: 100,
  responsive: true,
  normalize: true,
  partialRender: true
});

// Play/pause buttons
playOriginalBtn.addEventListener('click', () => {
  waveformOriginal.playPause();
  playOriginalBtn.innerHTML = waveformOriginal.isPlaying() ? 
    '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
});

playDenoisedBtn.addEventListener('click', () => {
  waveformDenoised.playPause();
  playDenoisedBtn.innerHTML = waveformDenoised.isPlaying() ? 
    '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
});

// Update play button state when audio finishes
waveformOriginal.on('finish', () => {
  playOriginalBtn.innerHTML = '<i class="fas fa-play"></i>';
});

waveformDenoised.on('finish', () => {
  playDenoisedBtn.innerHTML = '<i class="fas fa-play"></i>';
});

// Start recording
recordBtn.onclick = async () => {
  try {
    audioSection.classList.remove("hidden");
    audioSection.scrollIntoView({ behavior: 'smooth' });
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    chunks = [];

    // Set up audio analysis for volume meter
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(analyser);
    analyser.fftSize = 32;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    function updateVolumeMeter() {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      volumeMeter.style.width = `${average}%`;
      requestAnimationFrame(updateVolumeMeter);
    }
    
    updateVolumeMeter();

    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = async () => {
      recordingStatus.classList.add("hidden");
      clearInterval(processingInterval);
      timeValue.textContent = "0";
      
      originalAudioBlob = new Blob(chunks, { type: 'audio/wav' });
      const originalURL = URL.createObjectURL(originalAudioBlob);
      waveformOriginal.load(originalURL);
      
      // Calculate and display file size
      const fileSizeMB = (originalAudioBlob.size / (1024*1024)).toFixed(2);
      originalFileSize.textContent = `${fileSizeMB} MB`;
      
      // Set up download for original
      downloadOriginalBtn.onclick = () => {
        const a = document.createElement('a');
        a.href = originalURL;
        a.download = 'original_recording.wav';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };

      // Show processing UI
      loader.classList.remove("hidden");
      downloadBtn.classList.add("hidden");
      playDenoisedBtn.disabled = true;
      processingTime.classList.remove("hidden");
      
      // Start processing timer
      let seconds = 0;
      processingInterval = setInterval(() => {
        seconds++;
        timeValue.textContent = seconds;
      }, 1000);

      // Simulate processing (replace with actual API call)
      const formData = new FormData();
      formData.append("audio", originalAudioBlob, "input.wav");

      try {
        // In a real app, you would make an actual fetch call here
        // const response = await fetch("/denoise", {
        //   method: "POST",
        //   body: formData
        // });
        // const denoisedBlob = await response.blob();
        
        // For demo purposes, we'll just use a timeout
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // In a real app, use the actual denoised blob from the response
        const denoisedBlob = originalAudioBlob; // Replace with actual denoised blob
        
        const denoisedURL = URL.createObjectURL(denoisedBlob);
        waveformDenoised.load(denoisedURL);
        downloadBtn.href = denoisedURL;
        
        // Calculate and display denoised file size
        const denoisedFileSizeMB = (denoisedBlob.size / (1024*1024)).toFixed(2);
        denoisedFileSize.textContent = `${denoisedFileSizeMB} MB`;
        
        // Update UI
        loader.classList.add("hidden");
        downloadBtn.classList.remove("hidden");
        playDenoisedBtn.disabled = false;
        resultsStats.classList.remove("hidden");
        
        // Get duration after loading
        waveformOriginal.on('ready', () => {
          const duration = waveformOriginal.getDuration();
          const minutes = Math.floor(duration / 60);
          const seconds = Math.floor(duration % 60);
          originalDuration.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          denoisedDuration.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        });
        
      } catch (error) {
        console.error("Error processing audio:", error);
        loader.innerHTML = `
          <div class="text-center text-red-400">
            <i class="fas fa-exclamation-triangle text-3xl mb-3"></i>
            <p>Error processing audio. Please try again.</p>
          </div>
        `;
      } finally {
        clearInterval(processingInterval);
      }
    };

    mediaRecorder.start();
    stopBtn.disabled = false;
    recordBtn.disabled = true;
    recordingStatus.classList.remove("hidden");
    recordingStartTime = Date.now();
    
  } catch (error) {
    console.error("Error accessing microphone:", error);
    alert("Could not access microphone. Please ensure you've granted microphone permissions.");
  }
};

// Stop recording
stopBtn.onclick = () => {
  mediaRecorder.stop();
  stopBtn.disabled = true;
  recordBtn.disabled = false;
  
  // Stop all tracks
  mediaRecorder.stream.getTracks().forEach(track => track.stop());
  
  // Disconnect audio analyser
  if (microphone && analyser) {
    microphone.disconnect(analyser);
  }
};

// Try now and CTA buttons
tryNowBtn.addEventListener('click', () => {
  audioSection.classList.remove("hidden");
  audioSection.scrollIntoView({ behavior: 'smooth' });
});

ctaRecordBtn.addEventListener('click', () => {
  audioSection.classList.remove("hidden");
  audioSection.scrollIntoView({ behavior: 'smooth' });
  recordBtn.click();
});

// Initialize audio section with demo data
waveformOriginal.on('ready', () => {
  originalDuration.textContent = "00:00";
});

waveformDenoised.on('ready', () => {
  denoisedDuration.textContent = "00:00";
});