'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import useWebSocket from 'react-use-websocket';
import { config } from '@/lib/config';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useAtom } from 'jotai';
import { PersonAtom } from '@/app/page';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const tier = {
  S: 'red',
  A: 'orange',
  B: 'yellow',
  C: 'green',
  D: 'blue',
  E: 'purple',
  F: 'pink',
};

type Person = {
  name: string;
  avatar: string;
};

type VotedTiers = {
  S: Array<Person>;
  A: Array<Person>;
  B: Array<Person>;
  C: Array<Person>;
  D: Array<Person>;
  E: Array<Person>;
  F: Array<Person>;
};

export default function Page() {
  const [person, setPerson] = useAtom(PersonAtom);
  const { sendMessage, lastMessage, readyState } = useWebSocket(config.ws, {
    share: true,
  });

  React.useEffect(() => {
    const person = JSON.parse(localStorage.getItem('person') || '{}');
    setPerson(person);
  }, []);

  const [result, setResult] = React.useState<{
    fruit: string;
    average: string | null;
  }>({
    fruit: '',
    average: null,
  });

  const [isStarted, setIsStarted] = React.useState(false);

  const [selection, setSelection] = React.useState<string | null>(null);

  function sendSelection(selection: string) {
    setSelection(selection);
    sendMessage(
      JSON.stringify({
        type: 'vote',
        selection,
        person: { name: person.name, avatar: person.avatar },
      })
    );
  }
  const count = useMotionValue(30);
  const [item, setItem] = React.useState<string | null>(null);

  const [isRoundInProgress, setIsRoundInProgress] = React.useState(false);
  const [time, setTime] = React.useState(30);
  const [results, setResults] = React.useState<VotedTiers>({
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    E: [],
    F: [],
  });

  const [showResult, setShowResult] = React.useState(false);
  const [showFinalResultPrompt, setShowFinalResultPrompt] =
    React.useState(false);
  const [showFinalResults, setShowFinalResults] = React.useState(false);
  React.useEffect(() => {
    console.log('lastMessage', lastMessage?.data);
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage?.data);
      console.log('data', data);

      if ('start' in data) {
        setShowResult(false);
        setIsStarted(data.start);
        setIsRoundInProgress(data.start);
        setItem(data.fruit);
        setResults({
          S: [],
          A: [],
          B: [],
          C: [],
          D: [],
          E: [],
          F: [],
        });
        setResult({ average: 'S', fruit: '' });
        setSelection(null);
      }

      switch (data.type) {
        case 'state': {
          console.log('state', data.data);
          break;
        }
        case 'join': {
          console.log('join', data.data);

          const {
            selection,
            timer,
            results,
            round,
            roundInProgress,
            showResults,
            end,
          } = data.data;
          setTime(timer);
          setShowResult(showResults);
          setResults(results);
          setIsStarted(round !== 0);
          setIsRoundInProgress(roundInProgress);
          setItem(selection);
          setResult({
            fruit: selection,
            average: data.data.average ?? null,
          });
          setShowFinalResultPrompt(end);
          break;
        }
        case 'end': {
          const results = data.data.results;
          console.log('results', results);
          setShowFinalResultPrompt(true);
        }
      }

      if ('time' in data) {
        count.set(data.time);
        setTime(data.time);
      }
      if ('votes' in data) {
        setResults(data.votes);
      }
      if ('results' in data) {
        const fruit = data.results.fruit;
        const average = data.results.average;
        setShowResult(data.results.showResults);
        setResult({ fruit, average });
      }
    }
  }, [lastMessage]);

  const formattedTime = useTransform(count, Math.round);

  const disabled = formattedTime.get() === 0;

  const itemSource =
    item && itemImageMap[item] !== undefined
      ? itemImageMap[item]
      : `/fruits/${item}.webp`;

  if (showFinalResults) {
    return (
      <div className="huh flex flex-col justify-center items-center h-full p-4 gap-4">
        <h1 className="text-center font-bold text-3xl lg:text-4xl text-primary">
          Here's the final result!
        </h1>
        <div className="flex flex-col lg:w-1/2 gap-2 h-full w-full ">
          {Object.keys(results).map((result) => {
            const background =
              result === 'S'
                ? 'bg-red'
                : result === 'A'
                ? 'bg-orange'
                : result === 'B'
                ? 'bg-yellow'
                : result === 'C'
                ? 'bg-green'
                : result === 'D'
                ? 'bg-blue'
                : result === 'E'
                ? 'bg-purple'
                : result === 'F'
                ? 'bg-pink'
                : '';

            return (
              <div key={result} className="flex flex-1 ">
                <Button
                  variant="outline"
                  type="button"
                  className={`${background} w-24 h-auto flex-1 max-w-24 ${
                    !selection || selection === result
                      ? ''
                      : selection !== result && 'opacity-50'
                  }`}
                  onClick={() => {
                    setSelection(result);
                  }}
                  disabled={disabled}
                >
                  <span className="font-extrabold text-lg">{result}</span>
                </Button>
                <div
                  style={{ flex: 2 }}
                  className="mx-2 flex w-full  justify-start items-center gap-2 rounded-lg bg-[#0000000d] px-2"
                >
                  {results[result].map((fruit) => {
                    const source =
                      itemImageMap[fruit] !== undefined
                        ? itemImageMap[fruit]
                        : `/fruits/${fruit}.webp`;
                    return (
                      <div
                        className="flex flex-col justify-center items-center"
                        key={fruit}
                      >
                        <Image
                          className="aspect-square object-contain bg-[#ffffff6a] border-2 border-black rounded-full h-8 w-8  lg:h-12 lg:w-12"
                          src={source}
                          alt={fruit}
                          width={128}
                          height={128}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <>
      <Dialog open={!isRoundInProgress && !isStarted}>
        <DialogContent className="h-3/4 w-full justify-center items-center bg-gradient-to-b">
          <h1 className="text-center font-bold text-2xl">
            Get ready for the first round!
          </h1>
          <div className="flex justify-center items-center">
            <motion.div
              className="bg-indigo-600 h-[150px] w-[150px] flex justify-center items-center"
              animate={{
                scale: [1, 1.8, 1.8, 1, 1],
                rotate: [0, 0, 180, 180, 0],
                borderRadius: ['0%', '0%', '50%', '50%', '0%'],
              }}
              transition={{
                duration: 2,
                ease: 'easeInOut',
                times: [0, 0.2, 0.5, 0.8, 1],
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />
          </div>

          <Button
            className="z-10"
            onClick={() => {
              sendMessage(JSON.stringify({ type: 'start' }));
            }}
          >
            Let's go
          </Button>
        </DialogContent>
      </Dialog>
      <Drawer dismissible={false} open={showResult || showFinalResultPrompt}>
        <DrawerContent className="h-3/4">
          <div className="flex flex-col justify-center items-center h-full p-2 gap-4">
            <Image
              className="border-[#E0E0E0] border-2 rounded-lg lg:mt-4 w-auto object-contain lg:max-w-52 max-h-[200px] lg:max-h-none shadow-lg shadow-[#00000020] bg-[#ffffffc7]"
              src={itemSource}
              alt="Next.js Logo"
              width={450}
              height={450}
            />
            <h1 className="text-center font-bold text-2xl">{result.fruit}</h1>
            {results ? (
              <h1
                style={{
                  color:
                    result.average === 'S'
                      ? 'red'
                      : result.average === 'A'
                      ? 'orange'
                      : result.average === 'B'
                      ? 'yellow'
                      : result.average === 'C'
                      ? 'green'
                      : result.average === 'D'
                      ? 'blue'
                      : result.average === 'E'
                      ? 'purple'
                      : result.average === 'F'
                      ? 'pink'
                      : 'black',
                }}
                className="text-center font-extrabold"
              >
                {!result.average ? 'No votes 😢' : `${result.average} TIER!`}
              </h1>
            ) : null}
            {showFinalResultPrompt ? (
              <Button
                onClick={() => {
                  setShowFinalResults(true);
                }}
              >
                Show results
              </Button>
            ) : (
              <Button
                onClick={() => {
                  sendMessage(JSON.stringify({ type: 'next' }));
                }}
              >
                Next round
              </Button>
            )}
          </div>
        </DrawerContent>
      </Drawer>
      <div className="huh flex flex-col justify-center items-center h-full p-4 gap-4">
        <div className="flex justify-center items-center">
          <Timer key={item} time={formattedTime.get()} />
        </div>
        <Image
          className="border-[#E0E0E0] border-2 rounded-lg lg:mt-4 w-auto object-contain lg:max-w-52 max-h-[200px] lg:max-h-none shadow-lg shadow-[#00000020] bg-[#ffffffc7]"
          src={itemSource}
          alt="Next.js Logo"
          width={128}
          height={128}
        />
        <h1 className="text-center font-bold text-3xl lg:text-4xl text-primary">
          {item}
        </h1>

        <div className="flex flex-col lg:w-1/2 gap-2 h-full w-full ">
          <Option
            name="S"
            selection={selection}
            setSelection={sendSelection}
            people={results.S}
            disabled={disabled}
          />
          <Option
            name="A"
            selection={selection}
            setSelection={sendSelection}
            people={results.A}
            disabled={disabled}
          />
          <Option
            name="B"
            selection={selection}
            setSelection={sendSelection}
            people={results.B}
            disabled={disabled}
          />
          <Option
            name="C"
            selection={selection}
            setSelection={sendSelection}
            people={results.C}
            disabled={disabled}
          />
          <Option
            name="D"
            selection={selection}
            setSelection={sendSelection}
            people={results.D}
            disabled={disabled}
          />
          <Option
            name="E"
            selection={selection}
            setSelection={sendSelection}
            people={results.E}
            disabled={disabled}
          />
          <Option
            name="F"
            selection={selection}
            setSelection={sendSelection}
            people={results.F}
            disabled={disabled}
          />
        </div>
      </div>
    </>
  );
}

function Option({
  name,
  selection,
  setSelection,
  people,
  disabled,
}: {
  name: string;
  selection: string | null;
  setSelection: (selection: string) => void;
  people: { name: string; avatar: string }[];
  disabled: boolean;
}) {
  const background =
    name === 'S'
      ? 'bg-red'
      : name === 'A'
      ? 'bg-orange'
      : name === 'B'
      ? 'bg-yellow'
      : name === 'C'
      ? 'bg-green'
      : name === 'D'
      ? 'bg-blue'
      : name === 'E'
      ? 'bg-purple'
      : name === 'F'
      ? 'bg-pink'
      : '';

  return (
    <div className="flex flex-1 ">
      <Button
        variant="outline"
        type="button"
        className={`${background} w-24 h-auto flex-1 max-w-24 ${
          !selection || selection === name
            ? ''
            : selection !== name && 'opacity-50'
        }`}
        onClick={() => {
          setSelection(name);
        }}
        disabled={disabled}
      >
        <span className="font-extrabold text-lg">{name}</span>
      </Button>
      <div
        style={{ flex: 2 }}
        className="mx-2 flex w-full  justify-start items-center gap-2 rounded-lg bg-[#0000000d] px-2"
      >
        {people.map(({ name, avatar }) => (
          <div className="flex flex-col justify-center items-center" key={name}>
            <Image
              className="aspect-square border-2 border-black rounded-full h-8 w-8  lg:h-12 lg:w-12"
              src={`/avatars/${avatar}.webp`}
              alt={name}
              width={64}
              height={64}
            />
            <span className="font-extrabold text-xs lg:text-base">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Timer({ time }: { time: number }) {
  const totalDuration = 30; // total duration in seconds
  const progress = 1 - time / totalDuration; // calculate progress

  const progressLength = useMotionValue(progress);

  React.useEffect(() => {
    progressLength.set(progress);
  }, [time, progressLength]);

  return (
    <motion.svg
      className={'w-16 h-16 lg:w-24 lg:h-24'}
      viewBox="0 0 100 100"
      initial="hidden"
      animate="visible"
      strokeWidth={10}
    >
      <motion.text
        x="50"
        y="50" // Adjust y position to center the text
        textAnchor="middle"
        alignmentBaseline={'middle'}
        fontSize={40}
        fontWeight={'bold'}
        animate={{
          fill: time <= 10 ? 'var(--red)' : '#424242',
        }}
      >
        {time}
      </motion.text>
      <motion.circle
        cx="50"
        cy="50"
        r="45"
        stroke="gray"
        animate={{ pathLength: progress }}
        custom={1}
        fill={'none'}
      ></motion.circle>
    </motion.svg>
  );
}

const itemImageMap = {
  Honeycrisp: '/fruits/honeycrisp.webp',
  'Red Delicious': '/fruits/red-delicious.webp',
  'Red Grapes': '/fruits/red-grapes.jpeg',
  'Green Grapes': '/fruits/green-grapes.webp',
  'Purple Grapes': '/fruits/purple-grapes.jpeg',
  Pear: '/fruits/pear.jpeg',
  Apricot: '/fruits/apricot.jpeg',
  Blackberry: '/fruits/blackberry.jpeg',
  Cranberry: '/fruits/cranberry.jpeg',
  Lemon: '/fruits/lemon.jpeg',
  Lime: '/fruits/lime.jpeg',
  Grapefruit: '/fruits/grapefruit.jpeg',
  Papaya: '/fruits/papaya.jpeg',
  Avocado: '/fruits/avocado.jpeg',
  Fig: '/fruits/fig.jpeg',
  'Passion fruit': '/fruits/passion-fruit.jpeg',
  'Dragon fruit': '/fruits/dragon-fruit.jpeg',
  Guava: '/fruits/guava.jpeg',
  Honeydew: '/fruits/honeydew.jpg',
  Coconut: '/fruits/coconut.jpeg',
  Date: '/fruits/date.jpeg',
  Jackfruit: '/fruits/jackfruit.jpg',
  Durian: '/fruits/durian.jpeg',
  Mulberry: '/fruits/mulberry.jpg',
  Kumquat: '/fruits/kumquat.jpeg',
  Clementine: '/fruits/clementine.jpeg',
  Tangerine: '/fruits/tangerine.jpeg',
  Nectarine: '/fruits/nectarine.jpeg',
  'Blood orange': '/fruits/blood-orange.jpeg',
};
