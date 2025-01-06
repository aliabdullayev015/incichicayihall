import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js'
import { getDatabase, ref, set, push, onValue, get} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js'

const firebaseConfig = {
    apiKey: "AIzaSyAxwP0qErgyspFIsGTud6jdhusMxSSNRnA",
    authDomain: "incichicheyi-hall.firebaseapp.com",
    databaseURL: "https://incichicheyi-hall-default-rtdb.firebaseio.com",
    projectId: "incichicheyi-hall",
    storageBucket: "incichicheyi-hall.firebasestorage.app",
    messagingSenderId: "646420401830",
    appId: "1:646420401830:web:e96566448bd677b8a0ae67"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const clickedEvent =  sessionStorage.getItem('clickedEvent');

const EventRef= ref(db, 'event/' + clickedEvent);

const totalSeats = 170;
const seatingMap = document.getElementsByClassName("seating-map")[0];
  
const numbering = [17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
const rows = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

let bookedSeats = [];
let seatCounter = 0;
  
for (let rowIndex = 0; rowIndex < rows.length && seatCounter < totalSeats; rowIndex++) {
  for (let columnNumber of numbering) {
    if (seatCounter >= totalSeats) break;

    const seat = document.createElement("div");
    const seatName = `${columnNumber}${rows[rowIndex]}`;

    seat.id = seatName;
    seat.classList.add("seat");
    seat.textContent = seatName; 

    seatingMap.appendChild(seat);
    
    seatCounter++;
  }
  onValue(EventRef, async(snapshot) => {
    const event = snapshot.val();  
    bookedSeats = event?.bookedseats || {};
    
    bookedSeats.forEach(async (item) => {
      document.getElementById(item).classList.add("booked")
    });
  }, { onlyOnce: true });
}
