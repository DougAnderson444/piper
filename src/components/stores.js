import { writable, derived, readable } from 'svelte/store';

export const profile = writable(0);
export const portfolio = writable(0);
export const ipfsNode= writable(0);
export const nodeId= writable(0);
export const nodeAgentVersion= writable(0);
export const nodeProtocolVersion = writable(0);
export const keys = writable(0);  // public and private key object
export const rootHash = writable(0);  // public and private key object

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

export const elapsed = derived(
	[time, start],
	([$time, $start]) => Math.max(Math.round(($time - $start) / 1000),0)
);

let def = {
	Cats: {
	  "Cat 1": {
		description: {
		  NewCat: "joe",
		  MoreCat: { FatCat: "Maru" }
		},
		"cat 1A": "Keyboard"
	  },
	  "Cat 2": { "cat 2": "MaruTwo" },
	  "Cat 3": { "cat 3": "Henri The Existential Cat" }
	},
	Dogs: {}
  };
  
  export const root = writable(def);