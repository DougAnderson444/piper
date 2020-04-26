import { writable, derived, readable } from "svelte/store";

export const profile = writable(0);
export const portfolio = writable(0);
export const ipfsNode = writable(0);
export const nodeId = writable(0);
export const nodeAgentVersion = writable(0);
export const nodeProtocolVersion = writable(0);
export const myProfile = writable(0); // public and private key object
export const testProfiles = writable([]); // public and private key object
export const testRoots = writable([]); // public and private key object

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

let defObj = {
  Me: {
    "Cat 1": {
      cat1name: "Fluffy",
      "Fluff faves": {
        name: "Toy 1"
      }
    },
    "Cat 2": { "cat too name": "Maru Two" }
  },
  Contacts: {}
};
export const defaultObj = writable(defObj); //createRoot();
export const root = writable(0); //createRoot();

//Derives a store from one or more other stores. Whenever those dependencies change, the callback runs.
export const rootHash = derived([root, ipfsNode], ([$root, $ipfsNode], set) => {
  if ($ipfsNode != 0 && $root != 0) {
    try {
      $ipfsNode.dag
        .put(JSON.parse(JSON.stringify($root)), { pin: true })
        .then(h => {
          set(h.toString());
          console.log(`> stores updated ipfsNode with \n${JSON.stringify(
            $root,
            null,
            2
          )}\n>> set $rootHash to \n
            ${JSON.stringify(h.toString(), null, 2)}
          `);
          typeof window !== "undefined" && h.toString() != 0
            ? localStorage.setItem("rootHash", h.toString())
            : false;
          // save the rootHash to localstorage every time it changes (using $: in svelte)
        });
    } catch (err) {
      console.log(err);
    }
  }
});

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
