"use client";
import { useEffect, useState } from "react";

const LyricPlayer = () => {
  const [lyrics, setLyrics] = useState([]);
  const [points, setPoints] = useState(0);
  const [convertedText, setConvertedText] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/lyric.lrc");
        const lrc = await res.text();
        setLyrics(parseLyric(lrc));
      } catch (error) {
        console.error("Error fetching lyric: ", error);
      }
    };
    fetchData();
  }, []);

  const handleTimeUpdate = (e) => {
    const time = e.target.currentTime;
    const index = syncLyric(lyrics, time);

    if (index == null) return;

    const lyricElement = document.querySelector(".lyric");
    lyricElement.innerHTML = lyrics[index].text;

    lyricElement.classList.add("active");

    setTimeout(() => {
      lyricElement.classList.remove("active");
      console.log("handleTimeUpdate : SetTimeOut");
    }, 500);

    console.log("handleTimeUpdate");

    // Check speech recognition
    speechToText(lyrics[index].text.toLowerCase());
  };

  const speechToText = (expectedText) => {
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.interimResults = true;
    recognition.continuous = true; // Enable continuous recognition
    recognition.onresult = (event) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          interimTranscript += event.results[i][0].transcript.toLowerCase();
        }
      }
      if (interimTranscript.includes(expectedText)) {
        setPoints((prevPoints) => prevPoints + 1);
      }
      setConvertedText(interimTranscript);
    };
    recognition.start();
  };

  return (
    <div className="text-xl flex flex-col gap-4 items-center justify-center">
      <h1 className="text-3xl text-[#33dbbf]">Play music to read lyrics...</h1>
      <audio className="player" controls onTimeUpdate={handleTimeUpdate}>
        <source src="/audio.mp3" type="audio/mpeg" />
      </audio>
      <div className="lyric"></div>
      <p className="text-[#33dbbf]">Points : {points}</p>
      <div className="panel bg-gray-200 rounded-lg p-4 mt-4">
        <p>Converted Text:</p>
        <p>{convertedText}</p>
      </div>
    </div>
  );
};

export default LyricPlayer;

const parseTime = (time) => {
  const [min, sec] = time.split(":").map((value) => parseFloat(value));
  return min * 60 + sec;
};

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

const syncLyric = (lyrics, time) => {
  const scores = lyrics
    .filter((lyric) => time - lyric.time >= 0)
    .map((lyric) => time - lyric.time);
  if (scores.length === 0) return null;
  const closest = Math.min(...scores);
  return scores.indexOf(closest);
};
