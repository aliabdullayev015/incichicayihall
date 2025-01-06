import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js'
import { getDatabase, ref, set, remove, onValue, get} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js'
import { getStorage, ref as storageRef, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyAxwP0qErgyspFIsGTud6jdhusMxSSNRnA",
    authDomain: "incichicheyi-hall.firebaseapp.com",
    databaseURL: "https://incichicheyi-hall-default-rtdb.firebaseio.com",
    projectId: "incichicheyi-hall",
    storageBucket: "incichicheyi-hall.firebasestorage.app",
    messagingSenderId: "646420401830",
    appId: "1:646420401830:web:e96566448bd677b8a0ae67"
};

// Admin form

const showStatsButton = document.getElementById('stats__btn');
const closeStatsButton = document.getElementById('close__btn__stats');
const StatsForm = document.getElementById('stats__form');


const showDbButton = document.getElementById('db__btn');
const closeDbButton = document.getElementById('close__btn__db');
const DbForm = document.getElementById('db__form');


// Stats form 

showStatsButton.addEventListener('click', () => {
    StatsForm.style.display = 'block';
});

closeStatsButton.addEventListener('click', () => {
    StatsForm.style.display = 'none';
});

// db form 

showDbButton.addEventListener('click', () => {
    DbForm.style.display = 'block';
});

closeDbButton.addEventListener('click', () => {
    DbForm.style.display = 'none';
});

// Database exchange

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);

//appending events

const EventRef= ref(db, 'event/');
const eventsList = document.getElementById("events__list");


onValue(EventRef, async (snapshot) => {
    const events = snapshot.val();  

    // Clear existing event list items 
    eventsList.querySelectorAll('li').forEach((li) => li.remove());

    for (let eventId in events) {
        const event = events[eventId];
        const imageRef = await storageRef(storage, 'images/' + eventId);
        const imageUrl = await getDownloadURL(imageRef);
        // Create a new list item
        const eventItem = document.createElement("li");
        eventItem.id = eventId;
        eventItem.className = "event"; 
        eventItem.onclick = () => {
            sessionStorage.setItem('clickedEvent', eventId);
            window.location.assign('show_event_admin.html');
        };

        // Add static HTML structure
        eventItem.innerHTML = `
            <img id="e__img${eventId}" src="${imageUrl}" alt="${event.name}">
            <div id="e__name${eventId}" class="e__name">${event.name}</div>
            <p id="e__des${eventId}">${event.describtion}</p>
            <button id="del__btn${eventId}" class="del__btn"></button>
            <h6 id="e__venue${eventId}" class="e__venue">Venue: ${event.venue}</h6>
            <h6 id="e__date${eventId}" class="e__date">Date: ${event.date}</h6>
            <h6 id="e__time${eventId}">Time: ${event.time}</h6>
        `;

        eventsList.appendChild(eventItem);

        const deleteButton = document.getElementById(`del__btn${eventId}`);
        deleteButton.onclick = function(event) {
            event.stopPropagation();  
            deleteEvent(eventId);
        };      
    }
});

// search bar 

const searchInput = document.getElementById('search__evnt__name');
const eventsNamesList = document.getElementById('name__of__events');

// Populate the list dynamically from snapshot
onValue(EventRef, (snapshot) => {
    const events = snapshot.val();
    for (let eventId in events) {
        const eventName = events[eventId].name;
        const eventNameItem = document.createElement("li");
        eventNameItem.innerHTML = `
            <span>${eventName}</span> 
        `;
        eventsNamesList.appendChild(eventNameItem);
    }
});

// Show the list when the input is focused
searchInput.addEventListener('focus', () => {
    eventsNamesList.style.display = 'block';
});

// Hide the list when clicking outside
document.addEventListener('click', (event) => {
    if (!searchInput.contains(event.target) && !eventsNamesList.contains(event.target)) {
        eventsNamesList.style.display = 'none';
    }
});

// Make the entire <li> clickable
eventsNamesList.addEventListener('click', (event) => {
    event.preventDefault();
    const listItem = event.target.closest('li'); // Find the closest <li> (ensures clicks anywhere within <li>)
    if (listItem) {
        searchInput.value = listItem.textContent.trim(); // Set input value
        searchInput.focus();
        eventsNamesList.style.display = 'none'; // Hide suggestions
    }
});


// Filter suggestions dynamically based on input
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim(); // Get the query
    const nameListItems = eventsNamesList.querySelectorAll('li'); // Dynamically fetch all <li>

    let hasMatches = false;

    // Loop through each list item
    nameListItems.forEach((item) => {
        const text = item.textContent.toLowerCase().trim();
        if (text.startsWith(query)) { // Match query with item text
            item.style.display = 'block'; // Show matching items
            hasMatches = true;
        } else {
            item.style.display = 'none'; // Hide non-matching items
        }
    });

    // Show or hide the entire list based on matches
    eventsNamesList.style.display = hasMatches ? 'block' : 'none';

    // Highlight the first visible item
    let firstVisible = false;
    nameListItems.forEach((item) => {
        if (item.style.display !== 'none' && !firstVisible) {
            item.classList.add('first-visible');
            firstVisible = true;
        } else {
            item.classList.remove('first-visible');
        }
    });
});

searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const query = searchInput.value.toLowerCase().trim();
        const events = eventsList.querySelectorAll('li');
        if(query){
            events.forEach((item) => {
                const eventNameElement = item.querySelector('.e__name');
                const eventName = eventNameElement.textContent.toLowerCase().trim();
                if (eventName !== query) {
                    item.style.display = 'none'; // Hide non-matching items
                } 
                else {
                    item.style.display = 'flex'; // Show the matching item
                }
            });
        }else{
            events.forEach((item) => {item.style.display = 'flex';})
        }
    }
});


// filter 

const filterButton = document.getElementById('button__filter');
const filterForm = document.getElementById('filter__menu');


filterButton.addEventListener('click', (event) => {
    event.preventDefault();
    if (filterForm.checkValidity()) {
        const events = eventsList.querySelectorAll('li');
        const filterDate = `Date: ${document.getElementById('event__date').value}`;
        const filterCateg = document.getElementById('event__category__dropdown').value;
        const filterVenue =`Venue: ${document.getElementById('event__venue__dropdown').value}`;

        events.forEach((item) => {item.style.display = 'flex';})
        if (filterDate !== "Date: "){
            events.forEach((item) => {
                const eventDateElement = item.querySelector('.e__date').textContent;
                if (eventDateElement !== filterDate) {
                    item.style.display = 'none'; 
                }
            });
        }
        if (filterCateg !== "All"){
            onValue(EventRef, (snapshot) => {
                const events = snapshot.val();  
                for (let eventId in events) {
                    const event = events[eventId];
                    if (event.category !== filterCateg) {
                        const unrelEvent = document.getElementById(eventId);
                        unrelEvent.style.display = 'none';  
                    } 
                    console.log();
                }
            });
        }
        if (filterVenue !== "Venue: All"){
            events.forEach((item) => {
                const eventVenueElement = item.querySelector('.e__venue').textContent;
                if (eventVenueElement !== filterVenue) {
                    item.style.display = 'none';
                } 
            });
        }
    }
});

// delete event

async function deleteEvent(eventId){
    const deleteEventId = eventId
    
    const deleteEventRef = ref(db, 'event/' + deleteEventId);
    const usersRef = ref(db, 'users/');

    onValue(usersRef, (snapshot) => {
        const users = snapshot.val();  
        for (let userId in users) {
            const deleteEventUserRef = ref(db, 'users/' + userId + '/bookings/' + deleteEventId);
            remove(deleteEventUserRef)
        }
    });

    await remove(deleteEventRef);

    const imageRef = await storageRef(storage, 'images/' + eventId);
    await deleteObject(imageRef)
}

// database 

const usersRef = ref(db, 'users/');
const tableBody = document.querySelector("#db__table tbody");

onValue(usersRef, async(snapshot) => {
    const users = snapshot.val(); 
    tableBody.innerHTML = "";

    if (users) {
        let rowNumber = 1;
        for (let userId in users){
            const user = users[userId]
            const userFullname = user.fullname
            for(let eventId in user.bookings){
                const seats = user.bookings[eventId]

                const eventRef = ref(db, 'event/' + eventId);
                const snapshot = await get(eventRef);
                const eventData = snapshot.val();
                const eventName = eventData.sname;

                const row = document.createElement("tr");
            
                const numberCell = document.createElement("td");
                numberCell.textContent = rowNumber++; 
    
                const userFullnameCell = document.createElement("td");
                userFullnameCell.textContent = userFullname || "";
                
                const eventNameCell = document.createElement("td");
                eventNameCell.textContent = eventName || "";
                
                const seatsCell = document.createElement("td");
                seatsCell.textContent = seats.join(', ') || "";
                

                row.appendChild(numberCell);
                row.appendChild(userFullnameCell);
                row.appendChild(eventNameCell);
                row.appendChild(seatsCell);
                

                tableBody.appendChild(row);      
            }         
        }   
    }      
});


// statistics
const numActvUsers = document.getElementById("actv__users");
const avrgAttendance = document.getElementById("avrg__attend");
const totNumEvents = document.getElementById("tot__numevnt");

const totNumEventsRef = ref(db, 'stats/numEvents');

onValue(totNumEventsRef, (snapshot) => {
    const dbTotNumEvents = snapshot.val();  
    totNumEvents.textContent = dbTotNumEvents
});

let numUsers = 0

onValue(usersRef, (snapshot) => {
    const users = snapshot.val();  
    for (let userId in users) {
        numUsers ++
    }
    numActvUsers.textContent = numUsers
});

const bookedSeatsNumbersRef= ref(db, 'stats/numAttendance/');

onValue(bookedSeatsNumbersRef, (snapshot) => {
    const eventStats = snapshot.val();  

    onValue(totNumEventsRef, (snapshot) => {

        const totNumbEvents = snapshot.val();  
        let totNumAttencances = 0;

        for (let eventStatKey in eventStats) {
            const eventStatValue = eventStats[eventStatKey]; 
            totNumAttencances += eventStatValue; 
        }
        avrgAttendance.textContent = Math.round(totNumAttencances / totNumbEvents);
    });
});