import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Mic, MicOff, Volume2, VolumeX, Loader } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const VoiceInterface = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [voiceStatus, setVoiceStatus] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('en_US-lessac-medium');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    fetchVoiceStatus();
    fetchAvailableVoices();
  }, []);

  const fetchVoiceStatus = async () => {
    try {
      const response = await axios.get(`${API}/voice/status`);
      setVoiceStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch voice status:', error);
    }
  };

  const fetchAvailableVoices = async () => {
    try {
      const response = await axios.get(`${API}/voice/voices`);
      setAvailableVoices(response.data.voices);
    } catch (error) {
      console.error('Failed to fetch voices:', error);
    }
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsListening(true);
      toast.info('Listening... Click again to stop');
    } catch (error) {
      console.error('Failed to start listening:', error);
      toast.error('Microphone access denied');
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const processAudio = async (audioBlob) => {
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result.split(',')[1];
        
        // Send to backend for transcription
        const response = await axios.post(`${API}/voice/transcribe`, {
          audio_base64: base64Audio,
          language: 'en'
        });

        if (response.data.success) {
          setTranscription(response.data.text);
          toast.success('Voice transcribed');
        } else {
          toast.error('Transcription failed');
        }
      };
    } catch (error) {
      console.error('Failed to process audio:', error);
      toast.error('Failed to process audio');
    }
  };

  const speakText = async (text) => {
    try {
      setIsSpeaking(true);
      const response = await axios.post(`${API}/voice/synthesize`, {
        text: text || transcription,
        voice: selectedVoice
      });

      if (response.data.success) {
        toast.success('Speech synthesized (simulated)');
        // In production, play the audio file
      }
    } catch (error) {
      console.error('Failed to synthesize speech:', error);
      toast.error('Speech synthesis failed');
    } finally {
      setIsSpeaking(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="glass rounded-sm p-6" data-testid="voice-interface">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white uppercase tracking-tight">VOICE INTERFACE</h2>
        <div className="flex items-center gap-2">
          {voiceStatus && (
            <>
              <span className="status-active"></span>
              <span className="text-xs text-gray-400 code-font">STT/TTS READY</span>
            </>
          )}
        </div>
      </div>

      {/* Voice Controls */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={toggleListening}
          disabled={isSpeaking}
          className={`p-4 rounded border-2 transition-all flex items-center justify-center gap-2 ${
            isListening
              ? 'border-red-500 bg-red-500/20 text-red-400'
              : 'border-cyan-500 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20'
          } ${isSpeaking ? 'opacity-50 cursor-not-allowed' : ''}`}
          data-testid="voice-listen-button"
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5" />
              <span className="font-bold">STOP LISTENING</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              <span className="font-bold">START LISTENING</span>
            </>
          )}
        </button>

        <button
          onClick={() => speakText()}
          disabled={!transcription || isSpeaking || isListening}
          className={`p-4 rounded border-2 border-green-500 transition-all flex items-center justify-center gap-2 ${
            isSpeaking
              ? 'bg-green-500/20 text-green-400'
              : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
          } ${(!transcription || isListening) ? 'opacity-50 cursor-not-allowed' : ''}`}
          data-testid="voice-speak-button"
        >
          {isSpeaking ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span className="font-bold">SPEAKING...</span>
            </>
          ) : (
            <>
              <Volume2 className="w-5 h-5" />
              <span className="font-bold">SPEAK TEXT</span>
            </>
          )}
        </button>
      </div>

      {/* Voice Selection */}
      <div className="mb-4">
        <label className="text-xs text-gray-400 uppercase mb-2 block">Voice Selection</label>
        <select
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          className="w-full bg-black/30 border border-gray-700 rounded p-2 text-white code-font text-sm focus:border-cyan-500 focus:outline-none"
          data-testid="voice-select"
        >
          {availableVoices.map((voice) => (
            <option key={voice} value={voice}>{voice}</option>
          ))}
        </select>
      </div>

      {/* Transcription Display */}
      <div className="bg-black/30 rounded p-4 min-h-24">
        <div className="text-xs text-gray-400 uppercase mb-2">Transcription</div>
        {transcription ? (
          <div className="text-white code-font text-sm" data-testid="transcription-text">
            {transcription}
          </div>
        ) : (
          <div className="text-gray-500 text-sm italic">No transcription yet...</div>
        )}
      </div>

      {/* Status Info */}
      {voiceStatus && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-black/30 rounded p-3">
            <div className="text-xs text-gray-400 uppercase mb-1">STT Model</div>
            <div className="code-font text-sm text-cyan-400">{voiceStatus.stt.model}</div>
          </div>
          <div className="bg-black/30 rounded p-3">
            <div className="text-xs text-gray-400 uppercase mb-1">TTS Voice</div>
            <div className="code-font text-sm text-green-400">{voiceStatus.tts.default_voice}</div>
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded">
        <div className="text-xs text-amber-400">
          <strong>Note:</strong> This is a reference implementation. In production, actual Whisper STT and Piper TTS models would be used.
        </div>
      </div>
    </div>
  );
};

export default VoiceInterface;
