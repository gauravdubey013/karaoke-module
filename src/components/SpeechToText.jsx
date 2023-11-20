"use client"

import React, {useEffect, useState} from 'react';

const SpeechToText = () => {

  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [note, setNote] = useState(null);
  const [notesStore, setnotesStore] = useState([]);

  const storeNote = () => {
    setnotesStore([...notesStore, note]);
    // setNote("");
  };

const startRecordController = () => {

  const microphone = new (
    window['SpeechRecognition'] 
    || window['webkitSpeechRecognition'] 
    || window['mozSpeechRecognition'] 
    || window['msSpeechRecognition']
    )();

  microphone.continuous = true;
  microphone.interimResults = true;
  microphone.lang = "en-US";

  console.log("Recording: " + isRecording + " - " + isPlaying);

  if(isRecording && !isPlaying) {
    setIsPlaying(true);
    microphone.start();
  } else {
    console.log("Stop Bro");
    microphone.stop();
  }

  setInterval(() => {
      setIsPlaying(false);
      microphone.stop();
      console.log("setInterval: " + isRecording + " - " + isPlaying);
  }, 5000);

  microphone.onresult = (event) => {
    const recordingResult = Array.from(event.results)
      .map((result) => result[0])
      .map((result) => result.transcript)
      .join("");
    console.log(note);
    setNote(note + recordingResult);
    microphone.onerror = (event) => {
      console.log(event.error);
    };
  };
};

useEffect(() => {
  startRecordController();
}, [isRecording, isPlaying]);

  return (
    <>
      <h1>Record Voice Notes</h1>
      <div>
        <div className="noteContainer">
          <h2>Record Note Here</h2>
          {isRecording ? <span>Recording... </span> : <span>Stopped </span>}
          {/* <button className="button" onClick={storeNote} disabled={!note}>
            Save
          </button> */}
          <button onClick={() => setIsRecording((prevState) => !prevState)}>
            Start/Stop
          </button>
          <p>{note}</p>
        </div>
        <div className="noteContainer">
          {/* <h2>Notes Store</h2> */}
          {/* **{notesStore.map((note) => (
            <p key={note}>{note}</p>
          ))}** */}
        </div>
      </div>
    </>
  );
};

export default SpeechToText;