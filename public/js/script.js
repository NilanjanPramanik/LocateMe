// const socket = io();

// //join the room
// socket.emit("join-room", roomId);

// //Handle if the browser support geo-location
// if(!navigator.geolocation) {
//   throw new Error("Your device dont have geo-location")
// }

// navigator.geolocation.watchPosition((position) => {
//   const {latitude, longitude} = position.coords;
//   socket.emit("send-location", {
//     roomId,
//     latitude,
//     longitude
//   });
// }, (error) => {
//   throw new Error(error);
// }, {
//   enableHighAccuracy: true,
//   maximumAge: 0,
//   timeout: 5000,
// });

// const map = L.map("map").setView([0,0], 14);
// L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//   attribution: "Locate Me"
// }).addTo(map);

// const markers = {};

// //custom marker for own
// const myIcon = L.icon({
//   iconUrl: "/images/location.png",
//   iconSize: [32, 32],
//   iconAnchor: [16, 32],
//   popupAnchor: [0, -32]
// });

// let myId = null;

// socket.on("connect", () => {
//   myId = socket.id;
// })

// socket.on("recieve-location", (data) => {
//   const {id, latitude, longitude} = data;

//   map.setView([latitude, longitude]);

//   if(markers[id]){
//     markers[id].setLatLng([latitude, longitude]);
//   } else {
//     if(id === myId) {
//        markers[id] = L.marker([latitude, longitude], { icon: myIcon })
//         .addTo(map)
//         .bindTooltip("You", {
//           permanent: true,
//           direction: "top",
//           offset: [0, -32] })
//         .openTooltip();
//     } else {

//       markers[id] = L.marker([latitude, longitude]).addTo(map).bindTooltip(id, {
//         parmanent: true,
//         direction: "top"
//       }).openTooltip();
//     }
//   }
// });

// socket.on("user-disconnected", (id) => {
//   if(markers[id]) {
//     map.removeLayer(markers[id]);
//     delete markers[id];
//   }
// });

const socket = io();

let myId = null;
let myName = null;

document.getElementById("joinBtn").addEventListener("click", () => {
  const nameInput = document.getElementById("nameInput").value.trim();
  if (!nameInput) {
    alert("Please enter your name!");
    return;
  }

  myName = nameInput;

  // join the room with name
  socket.emit("join-room", { roomId, name: myName });

  // hide join box, show map
  document.getElementById("joinBox").style.display = "none";
  document.getElementById("map").style.display = "block";

  // start location tracking
  if (!navigator.geolocation) {
    alert("Your device doesn't support geolocation");
    return;
  }

  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      socket.emit("send-location", {
        roomId,
        latitude,
        longitude,
        name: myName,
      });
    },
    (error) => {
      console.error(error);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000,
    }
  );
});

const map = L.map("map").setView([0, 0], 10);

navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords;
    map.setView([latitude, longitude]); // move map to user location
  },
  (error) => {
    console.error("Geolocation error:", error);
  }
);

L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "Locate Me",
}).addTo(map);

const markers = {};

// custom marker for self
const myIcon = L.icon({
  iconUrl: "/images/location.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

socket.on("connect", () => {
  myId = socket.id;
});

socket.on("recieve-location", (data) => {
  const { id, latitude, longitude, name } = data;

  map.setView([latitude, longitude], 14);

  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    if (id === myId) {
      markers[id] = L.marker([latitude, longitude], { icon: myIcon })
        .addTo(map)
        .bindTooltip(name || "You", {
          permanent: true,
          direction: "top",
          offset: [0, -32],
        })
        .openTooltip();
    } else {
      markers[id] = L.marker([latitude, longitude])
        .addTo(map)
        .bindTooltip(name || id, {
          permanent: true,
          direction: "top",
        })
        .openTooltip();
    }
  }
});

socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }

  console.log("User disconnected: ", id);
});
