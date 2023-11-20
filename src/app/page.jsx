// import Dictaphone from "@/components/Dictaphone";
import NdLyricPlayer from "@/components/NdLyricPlayer";
import SpeechToText from "@/components/SpeechToText";
import Link from "next/link";
// import Image from "next/image";

export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center justify-between py-0">
      {/* <NdLyricPlayer /> */}
      {/* <SpeechToText /> */}
      <NdLyricPlayer />
      {/* <Link href={"/karaoke"} >Karaoke</Link> */}
    </main>
  );
}
