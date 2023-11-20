import GDLyricPlayer from "@/components/GDLyricPlayer";
import React from "react";
import { musicNlyrics } from "./data";

const getData = (mus) => {
  const musData = musicNlyrics[mus];
  if (musData) {
    return musData;
  }
  return notFound();
};

const MusicPlayer = ({ params }) => {
  const musData = getData(params.music);
  return (
    <>
      <div className="">
        <h1 className="catoTitle text-[25px] text-[#53c28b] uppercase font-bold">
          {/* {params.music} */}
        </h1>
      </div>
      <div className="">
        {musData.map((musNlrc) => (
            <div className="">
            <h1 className="catoTitle text-[25px] text-[#53c28b] uppercase font-bold">
              {musNlrc.title}
            </h1>
            <div className="">
            <GDLyricPlayer audio={musNlrc.audio} lyric={musNlrc.lyric} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default MusicPlayer;
