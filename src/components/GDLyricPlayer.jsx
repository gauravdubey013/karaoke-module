"use client";
// Import necessary modules and styles
import { useEffect, useState } from "react";
import "regenerator-runtime/runtime";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

// Define the main component
const GDLyricPlayer = (props) => {
  const lyricFetc = props.lyric;
  // State variables for managing lyrics, points, speech recognition, and more
  const [lyrics, setLyrics] = useState([]);
  const [points, setPoints] = useState(0);
  const [lyricStore, setLyricStore] = useState("");
  const [lyricIndex, setLyricIndex] = useState(0);
  const [notesStore, setNotesStore] = useState("");

  // State variables for browser speech to text
  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  // const [isRecording, setisRecording] = useState(false);
  // const [note, setNote] = useState(null);

  // Function to parse time from the provided format
  const parseTime = (time) => {
    const [min, sec] = time.split(":").map((value) => parseFloat(value));
    return min * 60 + sec;
  };

  // Function to parse lyrics from the provided format
  const parseLyric = (lrc) => {
    const regex = /^\[(?<time>\d{2}:\d{2}(.\d{2})?)\](?<text>.*)/;
    const lines = lrc.split("\n");
    return lines
      .map((line) => {
        const match = line.match(regex);
        if (!match) return null;
        const { time, text } = match.groups;
        return {
          time: parseTime(time),
          text: text.trim(),
        };
      })
      .filter(Boolean);
  };

  // Function to synchronize lyrics with the current time in the audio player
  const syncLyric = (lyrics, time) => {
    const scores = lyrics
      .filter((lyric) => time - lyric.time >= 0)
      .map((lyric) => time - lyric.time);
    if (scores.length === 0) return null;
    const closest = Math.min(...scores);
    return scores.indexOf(closest);
  };

  // Fetch lyrics from a file when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(lyricFetc);
        const lrc = await res.text();
        setLyrics(parseLyric(lrc));
      } catch (error) {
        console.error("Error fetching lyric: ", error);
      }
    };
    fetchData();
  }, []);

  // Update lyricStore whenever lyrics change
  useEffect(() => {
    setLyricStore(lyrics.map((lyric) => lyric.text).join(" "));
  }, [lyrics]);

  // Function to handle time updates in the audio player
  const handleTimeUpdate = (e) => {
    const time = e.target.currentTime;
    const index = syncLyric(lyrics, time);

    if (index == null) return;

    // Update the displayed lyric
    const lyricElement = document.querySelector(".lyric");
    lyricElement.innerHTML = lyrics[index].text;

    // If the current lyric index has changed, update state variables
    if (lyricIndex !== index) {
      if (index % 5 === 0) {
        // Store text for scoring
        setNotesStore(notesStore + transcript);
        handleReset();
        handleListing();
      }
      setLyricStore(lyricStore + lyrics[index].text);
      setLyricIndex(index);
      console.log("Lyric:" + lyrics[index].text);
      console.log("Speech:" + transcript);
      console.log("index:" + index);
      countScore();
    }
    lyricElement.classList.add("active");

    // Remove the "active" class after 500 milliseconds
    setTimeout(() => {
      lyricElement.classList.remove("active");
    }, 500);
  };

  // Function to handle the start of audio playback
  const handleOnPlay = () => {
    handleListing();
  };

  // Function to start listening to the microphone
  const handleListing = () => {
    console.log("Mic Start");
    SpeechRecognition.startListening();
  };

  // Function to stop listening to the microphone
  const stopHandle = () => {
    console.log("Mic Stop");
    SpeechRecognition.stopListening();
  };

  // Function to reset the transcript
  const handleReset = () => {
    stopHandle();
    resetTranscript();
  };

  // Function to handle the pause of audio playback
  const handleOnPause = () => {
    stopHandle();
  };

  // Function to calculate and update the score based on text similarity
  const countScore = () => {
    setPoints(Math.round(similarity(lyricStore, notesStore) * 100 * 100) / 100);
  };

  // Function to calculate text similarity using edit distance
  function similarity(s1, s2) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
      return 1.0;
    }
    return (
      (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength)
    );
  }

  // Function to calculate edit distance between two strings
  function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
      var lastValue = i;
      for (var j = 0; j <= s2.length; j++) {
        if (i == 0) costs[j] = j;
        else {
          if (j > 0) {
            var newValue = costs[j - 1];
            if (s1.charAt(i - 1) != s2.charAt(j - 1))
              newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  // Render the main component
  return (
    <div className="text-xl flex flex-col gap-4 items-center justify-center">
      <h1 className="text-3xl text-[#33dbbf]">Play music to read lyrics...</h1>
      <audio
        onPlay={handleOnPlay}
        onPause={handleOnPause}
        className="player"
        controls
        onTimeUpdate={handleTimeUpdate}
      >
        <source src={props.audio} type="audio/mpeg" />
      </audio>
      <div className="lyric"></div>
      <p className="text-[#33dbbf]">Points : {points}%</p>
      <div className="panel bg-gray-200 w-full h-[50vh] rounded-lg p-4 mt-4">
        <p>Converted Text:</p>
        <div className="noteContainer">
          <h2></h2>
          {transcript}
        </div>
      </div>
    </div>
  );
};

// Export the component as the default export
export default GDLyricPlayer;
