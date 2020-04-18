import { writable, derived, readable } from "svelte/store";

export const profile = writable(0);
export const portfolio = writable(0);
export const ipfsNode = writable(0);
export const nodeId = writable(0);
export const nodeAgentVersion = writable(0);
export const nodeProtocolVersion = writable(0);
export const myProfile = writable(0); // public and private key object
export const rootHash = writable(0); // public and private key object
export const testProfiles = writable([]); // public and private key object

// start function is called when the store gets its first subscriber;
export const time = readable(new Date(), function start(set) {
  const interval = setInterval(() => {
    set(new Date());
  }, 1000);

  //stop is called when the last subscriber unsubscribes
  return function stop() {
    clearInterval(interval);
  };
});

// ### elaspe timer
// this can be reset with: $start = new Date();
export const start = writable(new Date());

//Derives a store from one or more other stores. Whenever those dependencies change, the callback runs.
export const elapsed = derived([time, start], ([$time, $start]) =>
  Math.max(Math.round(($time - $start) / 1000), 0)
);

let defaultObj = {
  Cats: {
    "Cat 1": {
      "name": "Fluffy"
    },
    "Cat 2": { "cat too": "Maru Two" }
  },
  Dogs: {}
};

//export const root = writable(defaultObj); // init root object (the portfolio)

function createRoot() {
	const { subscribe, set, update } = writable(defaultObj);

	return {
		subscribe,
		make: (x) => {set(x)},
		set: (x) => {set(x)},
		reset: () => {set(defaultObj)}
	};
}

export const root = createRoot();

// save for later maybe

let profileExample = [
  { "Favorite Color(s)": ["Blue"], tags: ["car", "dress shirt"] },
  {
    Links: [{ Brave: "https://brave.com/dou750" }, "Communications"],
    tags: ["resume", "skills"]
  },
  {
    Skills: [{ skill: "Presentation" }, { skill: "Communications" }],
    tags: ["resume", "skills"]
  },
  {
    Experiences: [
      {
        "Naval Officer": [
          { Start: "1997", Finish: "2017", Employer: "Royal Canadian Navy" }
        ]
      },
      { "Public Service": ["2017-2019", "Dept National Defence"] }
    ],
    tags: ["resume", "experience"]
  },
  {
    "Contact Details": [
      { Phone: ["Mobile", "613-555-1234"], tags: ["preferred"] },
      { Phone: ["Office", "819-555-1234"], tags: ["voicemail"] },
      { email: "doug@peerpiper.io" }
    ],
    tags: ["resume", "experience"]
  }
];