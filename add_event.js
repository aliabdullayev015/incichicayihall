import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js'
import { getDatabase, ref, set, push, onValue, get} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js'
import { getStorage, ref as storageRef, uploadBytes} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";


const firebaseConfig = {
    apiKey: "AIzaSyAxwP0qErgyspFIsGTud6jdhusMxSSNRnA",
    authDomain: "incichicheyi-hall.firebaseapp.com",
    databaseURL: "https://incichicheyi-hall-default-rtdb.firebaseio.com",
    projectId: "incichicheyi-hall",
    storageBucket: "incichicheyi-hall.firebasestorage.app",
    messagingSenderId: "646420401830",
    appId: "1:646420401830:web:e96566448bd677b8a0ae67"
};

/* Seats */
const totalSeats = 170;
const seatingMap = document.getElementsByClassName("seating-map")[0];

const numbering = [17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
const rows = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

let seatCounter = 0;
let selectedSeats = []; 

for (let rowIndex = 0; rowIndex < rows.length && seatCounter < totalSeats; rowIndex++) {
  for (let columnNumber of numbering) {
    if (seatCounter >= totalSeats) break;

    const seat = document.createElement("div");
    seat.classList.add("seat");
    seat.textContent = `${columnNumber}${rows[rowIndex]}`; 

    seat.addEventListener("click", () => {
      const seatName = `${columnNumber}${rows[rowIndex]}`;
      seat.classList.toggle("selected");

      if (seat.classList.contains("selected")) {
        selectedSeats.push(seatName); 
      } else {
        selectedSeats = selectedSeats.filter(seat => seat !== seatName); 
      }
    });

    seatingMap.appendChild(seat);
    seatCounter++;
  }
}

/* image upload */

const fileInput = document.getElementById("new__evnt__img");
const label = document.getElementById("img__input__label");

fileInput.addEventListener("change", function () {
    if (fileInput.files && fileInput.files[0]) {
        label.textContent = fileInput.files[0].name;
    } else {
        label.textContent = "Choose File (ratio 3:4)";
    }
});


/* Admin forms */

const showStatsButton = document.getElementById('stats__btn');
const closeStatsButton = document.getElementById('close__btn__stats');
const StatsForm = document.getElementById('stats__form');


const showDbButton = document.getElementById('db__btn');
const closeDbButton = document.getElementById('close__btn__db');
const DbForm = document.getElementById('db__form');


/* Stats form */

showStatsButton.addEventListener('click', () => {
    StatsForm.style.display = 'block';
});

closeStatsButton.addEventListener('click', () => {
    StatsForm.style.display = 'none';
});

/* db form */

showDbButton.addEventListener('click', () => {
    DbForm.style.display = 'block';
});

closeDbButton.addEventListener('click', () => {
    DbForm.style.display = 'none';
});

/*Database exchange*/
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app, "gs://incichicheyi-hall.firebasestorage.app")


async function addNewEvent(eventId, name, sname, describtion, image, category, venue, date, time, cast, maxbook, onlyguardians, bookedseats){
  const addEventRef= ref(db, 'event/' + eventId);
  const imageRef = storageRef(storage, 'images/' + eventId);
  const metadata = {
    contentType: 'image/jpeg',
  };
  set(addEventRef, {
      name: name,
      sname: sname,
      describtion: describtion,
      category: category,
      venue: venue,
      date: date,
      time: time,
      cast: cast,
      maxbook: maxbook,
      onlyguardians: onlyguardians,
      bookedseats: bookedseats,
  })
  await uploadBytes(imageRef, image, metadata);
  alert('New event created successfully!'); 
  window.location.assign('index_admin.html');
};

const addNewEvntButton = document.getElementById('new__evnt__submit');
const addNewEvntForm = document.getElementById('inputs__container');
const numEventRef= ref(db, 'stats/numEvents');


addNewEvntButton.addEventListener('click', (event) => {
    event.preventDefault();
    if (addNewEvntForm.checkValidity()) {
      onValue(numEventRef, (snapshot) => {
        const numEvents = snapshot.val() || 0;
        const newNumEvents = numEvents + 1;
        set(numEventRef, newNumEvents)
        const newEvntName = document.getElementById('new__evnt__name').value;
        const newEvntShName = document.getElementById('new__evnt__shname').value;
        const newEvntDescrb = document.getElementById('new__evnt__description').value;
        const newEvntImgInput = document.getElementById('new__evnt__img');
        const newEvntImgFile = newEvntImgInput.files[0]
        const newEvntCateg = document.getElementById('new__evnt__categ').value;
        const newEvntVenue = document.getElementById('new__evnt__venue').value;
        const newEvntDate = document.getElementById('new__evnt__date').value;
        const newEvntTime = document.getElementById('new__evnt__time').value;
        const newEvntCast = document.getElementById('new__evnt__cast').value;
        const newEvntCastArray = newEvntCast.split(",").map(item => item.trim());
        const newEvntMaxBook = Number(document.getElementById('new__evnt__max__book').value);
        const newEvntCheckBx = document.getElementById('new__evnt__checkbox');
        const isChecked = newEvntCheckBx.checked;
        addNewEvent(`event${newNumEvents}`, newEvntName, newEvntShName, newEvntDescrb, newEvntImgFile, newEvntCateg, newEvntVenue, newEvntDate, newEvntTime, newEvntCastArray, newEvntMaxBook, isChecked, selectedSeats)
      }, { onlyOnce: true });
  }else{
    alert("Fill out all the inputs!")
  }
});








