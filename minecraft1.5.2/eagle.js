const relayId = Math.floor(Math.random() * 3);

const eaglercraftOpts = {
  container: "game_frame",
  assetsURI: "assets.epk",
  serverWorkerURI: "worker_bootstrap.js",
  worldsFolder: "TEST",
  relays: [
    {
      addr: "wss://relay.deev.is/",
      name: "lax1dude relay #1",
      primary: relayId == 0,
    },
    {
      addr: "wss://relay.lax1dude.net/",
      name: "lax1dude relay #2",
      primary: relayId == 1,
    },
  ],
  mainMenu: {
    splashes: [
      "Darviglet!",
      "eaglerenophile!",
      "You Eagler!",
      "Yeeeeeee!",
      "yeee",
      "EEEEEEEEE!",
      "You Darvig!",
      "You Vigg!",
      ":>",
      "|>",
      "You Yumpster!",
    ],
    eaglerLogo: false,
  },
};

const params = new URLSearchParams(location.search);
const server = params.get("server");

if (server) eaglercraftOpts.joinServer = server;

// not needed in typical prod env
// will cause memory leak
// ?suppresserrors
if (
  !["127.0.0.1", "localhost"].includes(location.hostname) ||
  params.has("suppresserrors")
)
  console.error = () => {};

window.eaglercraftOpts = eaglercraftOpts;
main();
