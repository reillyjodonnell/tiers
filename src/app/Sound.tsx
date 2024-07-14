'use client';
import useSound from 'use-sound';
import { useEffect } from 'react';
import { atom, useAtom, useAtomValue } from 'jotai';
import { Button } from '@/components/ui/button';

export const MuteAtom = atom(true);
export const SoundAtom = atom<0 | 1 | 2>(2);

export function Sound() {
  const [sound, setSound] = useAtom(SoundAtom);
  const [mute, setMute] = useAtom(MuteAtom);
  const [play, { pause, sound: useSoundSound }] = useSound('/oh-yeah.mp3', {
    loop: true,
  });

  function togglePlay() {
    if (mute) {
      setMute(false);
      play();
    } else {
      pause();
      setMute(true);
    }
  }

  function changeSound() {
    switch (sound) {
      case 0:
        setSound(1);
        useSoundSound.volume(0.5);
        break;
      case 1:
        setSound(2);
        useSoundSound.volume(1);
        break;
      case 2:
        setSound(0);
        useSoundSound.volume(0);
        break;
    }
  }

  return (
    <div className="absolute bottom-4 right-4 flex justify-center items-center">
      <Button variant={'outline'} onClick={togglePlay} className="mx-2">
        {mute ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-play"
          >
            <polygon points="6 3 20 12 6 21 6 3" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-pause"
          >
            <rect x="14" y="4" width="4" height="16" rx="1" />
            <rect x="6" y="4" width="4" height="16" rx="1" />
          </svg>
        )}
      </Button>
      <Button variant={'outline'} onClick={changeSound} className="">
        {sound === 0 ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="22" x2="16" y1="9" y2="15" />
            <line x1="16" x2="22" y1="9" y2="15" />
          </svg>
        ) : sound === 1 ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        )}
      </Button>
    </div>
  );
}
