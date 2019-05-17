// event is a time series
// from latest to earliest
// uses a FIFO linked list as the main structure

const { brief } = require("./util");
const debug = require("debug");
const eventDebug = debug("events");

function now() {
  return Date.now();
}

const DEFAULT_CAPACITY = 1000000;

function init() {
  eventDebug("init events");

  return {
    head: null,
    tail: null,
    length: 0,
    capacity: DEFAULT_CAPACITY,
    subscribers: {},
  };
}

function setCapacity(capacity, events) {
  events.capacity = capacity;

  eventDebug("set capacity for events", capacity);

  return events;
}

function length(events) {
  return events.length;
}

function add(event, events) {
  const timestamp = now();

  if (events.head === null) {
    events.head = { id: 1, t: timestamp, e: event, n: null, p: null };
    events.tail = events.head;
    events.length = 1;
  } else {
    const currentHead = events.head;
    events.head = {
      id: currentHead.id + 1,
      t: timestamp,
      e: event,
      n: currentHead,
      p: null,
    };
    events.head.n.p = events.head;
    events.length = events.length + 1;
  }

  if (events.length > events.capacity) {
    const tp = events.tail.p;
    events.tail.p = null;
    tp.n = null;
    events.tail = tp;
    events.length = events.length - 1;
  }

  Object.values(events.subscribers).forEach(cb => {
    cb(events.head.e, events.head.t, events.head.id);
  });

  eventDebug("added event", brief(event));

  return events;
}

// scan events which matches given regx, less than number of limit lines, from latest to oldest
function scan(regx, limit, events) {
  let results = [];
  let current = events.head;

  while (current !== null) {
    if (regx.test(current.e)) {
      results.push({ time: current.t, event: current.e, id: current.id });
    }

    if (results.length >= limit) {
      break;
    }

    current = current.n;
  }

  return results;
}

// get a page from backwards, with given limit number of records
function backwardsPage(cursor, limit) {
  let current = cursor;
  let results = [];

  while (current) {
    results.push({ time: current.t, event: current.e, id: current.id });

    if (results.length >= limit) {
      break;
    }

    current = current.p;
  }

  return [current, results];
}

// callback will be called with each new event
function subscribe(events, subscriberId, callback) {
  events.subscribers[subscriberId] = callback;

  eventDebug("subscribed", subscriberId);

  return subscriberId;
}

function unsubscribe(events, subscriberId) {
  if (events.subscribers[subscriberId]) {
    delete events.subscribers[subscriberId];

    eventDebug("unsubscribed", subscriberId);
  }
}

function toJSON(events) {
  return scan(/.*/, events.capacity, events).reverse();
}

module.exports = {
  init,
  length,
  add,
  scan,
  backwardsPage,
  setCapacity,
  subscribe,
  unsubscribe,
  toJSON,
};
