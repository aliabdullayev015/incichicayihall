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

const logedUsername = sessionStorage.getItem('logedUsername');
const clickedEvent =  sessionStorage.getItem('clickedEvent');

const EventRef= ref(db, 'event/' + clickedEvent);
const userRef = ref(db, 'users/' + logedUsername);
const userBookingRef = ref(db, 'users/' + logedUsername + '/bookings/' + clickedEvent);
const eventBookingRef= ref(db, 'event/' + clickedEvent + '/bookedseats');


const totalSeats = 170;
const seatingMap = document.getElementsByClassName("seating-map")[0];
  
const numbering = [17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
const rows = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

let selectedSeats = [];
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

    seat.addEventListener("click", SeatClicked);
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

// validation rules 

const eventSnapshot = await get(EventRef);
const event = eventSnapshot.val();  
const onlyguardians = event.onlyguardians; 
const eventCast = event?.cast || {};
const limit = event.maxbook || totalSeats; 
let eligibleBooker = false;

const userSnapshot = await get(userRef);
const loggedUser = userSnapshot.val();
const loggedUserChildren = loggedUser?.children || {};

if (onlyguardians){
  if(logedUsername){
    for (const child of Object.values(loggedUserChildren)) {
      if (Object.values(eventCast).includes(child)) {
        eligibleBooker = true
      }
    }
  }
} else {
  eligibleBooker = true
}



// clicking seats (validation rules) function 

function SeatClicked(event) {
  const seat = event.target;
  const seatName = seat.id;

  if (!logedUsername) {
    alert('Please first log in to your account.');
    return;
  }
  if (!eligibleBooker) {
    alert('You are not elligible to book seats for this event.')
    return;
  }
  if (selectedSeats.length >= limit && !seat.classList.contains("selected")) {
    alert(`You can't book more than ${limit} seats for this event.`);
    return;
  }

  seat.classList.toggle("selected");
  if (seat.classList.contains("selected")) {
    selectedSeats.push(seatName);
  } else {
    selectedSeats = selectedSeats.filter(s => s !== seatName);
  }
}



// clicking the Add Booking button

async function addUserBooking(seats) {
  try {
    await set(userBookingRef, seats);
  } catch (error) {
    console.error("Error adding user booking:", error);
    alert("Failed to add booking. Please try again.");
  }
}

async function updateBookedSeatsNumbers(eventId, updatedArray) {
  const bookedSeatsNumbersRef= ref(db, 'stats/numAttendance/' + eventId);
  set(bookedSeatsNumbersRef, updatedArray.length)
}


async function updateBookedSeats(updatedArray) {
  await set(eventBookingRef, updatedArray);
  alert("Booking added to cart.");
  window.location.assign('index.html');
}

const bookButton = document.getElementById('book__btn')

bookButton.addEventListener('click', async(event) => {
  event.preventDefault();

  const userSnapshot = await get(userRef);
  const loggedUser = userSnapshot.val();
  const loggedUserBooks = loggedUser?.bookings || {};

  let alreadyBooked = false

  if(Object.keys(loggedUserBooks).includes(clickedEvent)){
    alreadyBooked = true
  }
  
  if(selectedSeats.length != 0 && !alreadyBooked){
    const updatedArray = [...selectedSeats, ...bookedSeats];
    addUserBooking(selectedSeats)
    updateBookedSeatsNumbers(clickedEvent, updatedArray)
    updateBookedSeats(updatedArray)
  }else if(alreadyBooked){
    alert('You have already booked some places in this event.')
  }else{
    alert('No seats were selected.')
  }
  
});