'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { avatarOptions, config } from '@/lib/config';
import { useAtom } from 'jotai';
import { atom } from 'jotai';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect } from 'react';
import useWebSocket from 'react-use-websocket';

export const PersonAtom = atom({ name: '', avatar: '' });

export default function Home() {
  const [person, setPerson] = useAtom(PersonAtom);

  // sync to local storage
  useEffect(() => {
    if (!person.name || !person.avatar) return;
    localStorage.setItem('person', JSON.stringify(person));
  }, [person]);

  useEffect(() => {
    const person = JSON.parse(localStorage.getItem('person') || '{}');
    setPerson(person);
  }, []);

  const { sendMessage, lastMessage, readyState } = useWebSocket(config.ws, {
    share: true,
  });
  function joinRoom() {
    sendMessage(
      JSON.stringify({
        type: 'join',
        roomCode: 'abc',
        name: person.name,
        avatar: person.avatar,
      })
    );
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-12 lg:p-24">
      <div className="w-full justify-center flex flex-col items-center">
        <h1 className="text-4xl font-bold">Tiers</h1>
        <div className="space-y-2 my-2 w-full lg:w-1/2">
          <Label htmlFor="room-code">Room Code</Label>
          <Input id="room-code" placeholder="Enter 4 letter room code" />
        </div>
        <div className="space-y-2 my-2 w-full lg:w-1/2">
          <Label htmlFor="name">Name</Label>
          <Input
            value={person.name}
            onChange={(e) => setPerson({ ...person, name: e.target.value })}
            id="name"
            placeholder="Enter name"
            maxLength={12}
          />
        </div>
        <div className="flex flex-wrap gap-2 my-2 w-full lg:w-1/2">
          {avatarOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => setPerson({ ...person, avatar: option.id })}
              className={`cursor-pointer relative flex flex-wrap items-center border-4 border-black rounded-lg
                ${
                  !person.avatar
                    ? ''
                    : person.avatar && person.avatar === option.id
                    ? ''
                    : 'opacity-50'
                }
                `}
            >
              {person.avatar === option.id && (
                <div className="absolute top-0 right-0  ">
                  <span className="text-2xl">✅</span>
                </div>
              )}
              <Image
                src={option.src}
                alt={option.name}
                width={64}
                height={64}
              />
            </div>
          ))}
        </div>
        <div className="space-y-2 my-2 w-full lg:w-1/2">
          <Link href={'/room/abc'} onClick={joinRoom}>
            <Button
              disabled={!person.name || !person.avatar}
              className="w-full"
            >
              Join
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
