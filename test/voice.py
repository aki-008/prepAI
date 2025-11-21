import sounddevice as sd
import numpy as np
from faster_whisper import WhisperModel
import ollama
import subprocess
import time

# --- Configuration ---
# STT Model: 'tiny' or 'base' are fast; 'small' is accurate.
stt_model = WhisperModel("base.en", device="cuda", compute_type="float16") 

def record_audio(duration=5, samplerate=16000):
    """Simple recorder - in production, use VAD (Voice Activity Detection) to stop automatically."""
    print("Listening...")
    recording = sd.rec(int(duration * samplerate), samplerate=samplerate, channels=1, dtype='float32')
    sd.wait()
    return recording.flatten()

def transcribe(audio_data):
    """Convert Audio to Text"""
    segments, info = stt_model.transcribe(audio_data, beam_size=5)
    text = " ".join([segment.text for segment in segments])
    return text.strip()

def generate_response(prompt):
    """Send text to Ollama (The Brain)"""
    response = ollama.chat(model='llama3.2', messages=[
      {'role': 'user', 'content': prompt},
    ])
    return response['message']['content']

def speak(text):
    """Convert Text to Audio (The Mouth) using Piper"""
    # Assuming you have the piper binary and a voice model downloaded
    # Command line: echo "text" | piper --model en_US-lessac-medium.onnx --output_file output.wav
    
    # For this example, we'll use a generic speak command for macOS/Linux 
    # (Replace with Piper or pyttsx3 for true local/cross-platform)
    subprocess.call(["say", text]) 

# --- Main Loop ---
def main():
    print("Voice Agent Started (Ctrl+C to stop)")
    while True:
        # 1. Listen
        audio_data = record_audio(duration=4) # Fixed duration for simplicity
        
        # 2. Transcribe
        user_text = transcribe(audio_data)
        if not user_text: continue
        
        print(f"You: {user_text}")
        
        # 3. Think
        ai_response = generate_response(user_text)
        print(f"AI: {ai_response}")
        
        # 4. Speak
        speak(ai_response)

if __name__ == "__main__":
    main()