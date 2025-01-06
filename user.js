import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js'
import { getDatabase, ref, get, set, onValue, remove} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js'
import { getStorage, ref as storageRef, getDownloadURL} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyAxwP0qErgyspFIsGTud6jdhusMxSSNRnA",
    authDomain: "incichicheyi-hall.firebaseapp.com",
    databaseURL: "https://incichicheyi-hall-default-rtdb.firebaseio.com",
    projectId: "incichicheyi-hall",
    storageBucket: "incichicheyi-hall.firebasestorage.app",
    messagingSenderId: "646420401830",
    appId: "1:646420401830:web:e96566448bd677b8a0ae67"
};

// forms 

const inputField = document.getElementById('newuser__username');
inputField.addEventListener('input', function() {
    const blockedSymbols = /[.#\$[\]]/g;
    this.value = this.value.replace(blockedSymbols, '');
});

const showLoginButton = document.getElementById('navbar__btn');
const closeLoginButton = document.getElementById('close__btn__login');
const loginForm = document.getElementById('log__in');

const showSignupButton = document.getElementById('link__signup');
const closeSignupButton = document.getElementById('close__btn__signup');
const signupForm = document.getElementById('sign__up');

const linktoLoginButton = document.getElementById('link__login');

const closeAccButton = document.getElementById('close__btn__acc');
const AccForm = document.getElementById('account');

const showTicketsButton = document.getElementById('cart__btn');
const closeTicketsButton = document.getElementById('close__btn__tform');
const TicketsForm = document.getElementById('tickets__form');



// not signed in (if not logged do this)

closeLoginButton.addEventListener('click', () => {
    loginForm.style.display = 'none';
});


showSignupButton.addEventListener('click', () => {
    signupForm.style.display = 'block';
    loginForm.style.display = 'none';
});

closeSignupButton.addEventListener('click', () => {
    signupForm.style.display = 'none';
});

linktoLoginButton.addEventListener('click', () => {
    signupForm.style.display = 'none';
    loginForm.style.display = 'block';
});


//  signed in (if logged acc click open this

closeAccButton.addEventListener('click', () => {
    AccForm.style.display = 'none';
});

// Tickets form

showTicketsButton.addEventListener('click', () => {
    TicketsForm.style.display = 'block';
});

closeTicketsButton.addEventListener('click', () => {
    TicketsForm.style.display = 'none';
});


// Database exchange

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);

//Sign up

function addNewUser(userId, password, name, children){
    const addUserRef= ref(db, 'users/' + userId)
    set(addUserRef, {
        fullname: name,
        children: children,
        password: password,
    })
}

function addAdmin(adminId, admPassword){
    const addAdminRef= ref(db, 'admins/' + adminId)
    set(addAdminRef, {
        password: admPassword,
    })
}

// Define Admins
addAdmin("RanaH", "dunya");
addAdmin("AliA", "1503");

const SignupButton = document.getElementById('signup__btn');

SignupButton.addEventListener('click', (event) => {
    event.preventDefault();
    if (signupForm.checkValidity()) {
        const newuserName = document.getElementById('newuser__username').value;
        const newfullName = document.getElementById('newuser__fullname').value;
        const newchildrenNames = document.getElementById('newuser__children__list').value;
        const newchildrenNamesArray = newchildrenNames.split(",").map(item => item.trim());
        const newpassword = document.getElementById('newuser__password').value;
        const passwordConfirmation = document.getElementById('password__confirmation').value;

        const usernameRef= ref(db, 'users')
        onValue(usernameRef, (snapshot) => {
            const usernames = snapshot.val(); 
            if (usernames && usernames[newuserName]) {
                alert("Username is already in use!");
                usernameUnique = false;
            } else if (newpassword !== passwordConfirmation) {
                alert("Passwords do not match!");
            } else {
                signupForm.style.display = 'none';
                alert("Signup successful!");
                addNewUser(newuserName, newpassword, newfullName, newchildrenNamesArray);
                signupForm.reset();
            }
        }, { onlyOnce: true });
    }
});

// Log in 

const LoginButton = document.getElementById('login__btn');
const Welctext = document.getElementById('welcoming__text');
let logedIn = false;

if (sessionStorage.getItem('logedUsername')){
    logedIn = true;
    Welctext.textContent = `Good Day, ${sessionStorage.getItem('logedFullname')}`;
}

LoginButton.addEventListener('click', (event) => {
    event.preventDefault();
    if (loginForm.checkValidity()) {
        const enteredUsername = document.getElementById('user__name').value;
        const enteredPassword = document.getElementById('user__password').value;

        const usernameRef = ref(db, 'users');
        const adminRef = ref(db, 'admins');

        onValue(adminRef, (snapshot) => {
            const admins = snapshot.val() || {};
            if(admins){
                for (let adminId in admins) {
                    const admin = admins[adminId];
                    if (
                        adminId == enteredUsername &&  
                        admin.password == enteredPassword 
                    ) {
                        logedIn = true;
                        window.location.assign('index_admin.html');
                        break;
                    }
                }
            }
        }, { onlyOnce: true });

        if (!logedIn){
            onValue(usernameRef, (snapshot) => {
                const users = snapshot.val();  

                for (let userId in users) {
                    const user = users[userId];
                    if (
                        userId == enteredUsername &&  
                        user.password == enteredPassword 
                    ) {
                        logedIn = true;
                        sessionStorage.setItem('logedUsername', enteredUsername);
                        sessionStorage.setItem('logedFullname', user.fullname);
                        alert(`Welcome, ${user.fullname}!`);
                        loginForm.style.display = 'none';
                        Welctext.textContent = `Good Day, ${sessionStorage.getItem('logedFullname')}`;
                        break;
                    }
                }
                if (!logedIn) {
                    alert('Invalid username or password. Please try again.');
                }
            }, { onlyOnce: true });
        }
        loginForm.reset();
    }
});

const SignoutButton = document.getElementById('signout__btn');

showLoginButton.addEventListener('click', () => {
    if (logedIn){
        AccForm.style.display = ('block');
        loginForm.style.display = ('none');
    }else{
        loginForm.style.display = ('block');
    }
});

SignoutButton.addEventListener('click', () => {
    logedIn = false;
    sessionStorage.setItem('logedUsername', "");
    AccForm.style.display = ('none');
});
  

// Appending Events

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
            window.location.assign('booking_page.html');
        };

        // Add static HTML structure
        eventItem.innerHTML = `
            <img id="e__img${eventId}" src="${imageUrl}" alt="${event.name}">
            <div id="e__name${eventId}" class="e__name">${event.name}</div>
            <p id="e__des${eventId}">${event.describtion}</p>
            <h6 id="e__venue${eventId}" class="e__venue">Venue: ${event.venue}</h6>
            <h6 id="e__date${eventId}" class="e__date">Date: ${event.date}</h6>
            <h6 id="e__time${eventId}">Time: ${event.time}</h6>
        `;

        // Append the item to the list
        eventsList.appendChild(eventItem);
    }
});

// Search List 

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
        const filteronlyrel = document.getElementById('related__events__checkbox');
        const isFilChecked = filteronlyrel.checked;

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
        if (isFilChecked == true){
            if (logedIn){
                const logedUsername = sessionStorage.getItem('logedUsername');
                const loggeduserRef = ref(db, 'users/' + logedUsername)

                onValue(loggeduserRef, (snapshot) => {
                    const loggedUser = snapshot.val(); 
                    const loggedUserChildren = loggedUser?.children || {};
                    onValue(EventRef, (snapshot) => {
                        const events = snapshot.val();
                        for (let eventId in events) {
                            const event = events[eventId];
                            const eventCast = event.cast || {};
                            let childParticipates = false;
                            for (let children of Object.values(loggedUserChildren)) {
                                if (Object.values(eventCast).includes(children)) {
                                    childParticipates = true;
                                    break;
                                }
                            }
                            const unrelEvent = document.getElementById(eventId); 
                            if (!childParticipates){
                                unrelEvent.style.display = 'none'
                            }   
                        }
                    }, { onlyOnce: true });
                }, { onlyOnce: true });
            }else{
                alert('You have to log in to use "My children" function')
            }
        }
    }
});

// Tickets form


function displayTickets(){
    const loggedinUsername = sessionStorage.getItem('logedUsername')
    if (loggedinUsername){
        const ticketsList = document.getElementById("ticket__list");
        const bookingsRef = ref(db, 'users/' + loggedinUsername + '/bookings');
        
        onValue(bookingsRef, async (snapshot) => {
            const bookings = snapshot.val() || {};
        
            // Clear existing event list items 
            ticketsList.querySelectorAll('li').forEach((li) => li.remove());
        
            for (let bookingId in bookings) {
                const booking = bookings[bookingId];
                const bookedSeats = Object.values(booking);
                const bookedSeatsFormated = bookedSeats.join(', ');
        
                const bookedEvntRef = ref(db, 'event/' + bookingId);
        
                const bookedEvntSnapshot = await get(bookedEvntRef);
        
                const bookedEvnt = bookedEvntSnapshot.val();
        
                const bookedEvntName = bookedEvnt?.sname || {};
                const bookedEvntVenue = bookedEvnt?.venue || {};
                const bookedEvntDate = bookedEvnt?.date || {};
                const bookedEvntTime = bookedEvnt?.time || {};
        
                // Create a new list item
                const ticket = document.createElement("li");
                ticket.id = bookingId;
                
                // Add static HTML structure
                ticket.innerHTML = `
                    <ol class="ticket__details">
                        <li>Event: ${bookedEvntName}</li>
                        <li>Seats: ${bookedSeatsFormated}</li>
                        <li>Venue: ${bookedEvntVenue}</li>
                        <li>Date & Time: ${bookedEvntDate}, ${bookedEvntTime}</li>
                        <li class="ticket__operation"><a class="cancel__ticket"><u>Cancel booking</u></a></li>
                        <li class="ticket__operation"><a class="dwnl__ticket"><u>Download event</u></a></li>
                    </ol>   
                `;

                ticket.querySelector('.cancel__ticket').addEventListener('click', (event) => {
                    event.preventDefault();
                    cancelTicket(bookingId);
                });

                ticket.querySelector('.dwnl__ticket').addEventListener('click', (event) => {
                    event.preventDefault();
                    downloadTicket(bookingId);
                });
        
                // Append the item to the list
                ticketsList.appendChild(ticket);
            }
        });  
    }
}


showTicketsButton.addEventListener('click', () => {
    displayTickets()
});


async function cancelTicket(bookingId){
    const cancelEventId = bookingId
    const loggedinUsername = sessionStorage.getItem('logedUsername') || {};

    const userCanceleventRef = ref(db, 'users/' + loggedinUsername + '/bookings/' + cancelEventId);

    const canceledBookingSnapshot = await get(userCanceleventRef);
    const canceledSeats = canceledBookingSnapshot.val();

    const bookingsEventRef = ref(db, 'event/' + cancelEventId + '/bookedseats');


    const evntSnapshot = await get(bookingsEventRef);
    const evntSeats = evntSnapshot.val() || {};

    const filteredSeats = evntSeats.filter(item => !canceledSeats.includes(item));

    console.log(filteredSeats)

    await set(bookingsEventRef, filteredSeats);
    await remove(userCanceleventRef);

    displayTickets();
};

async function downloadTicket(bookingId){
    const { jsPDF } = window.jspdf;
    const logedUsername = sessionStorage.getItem('logedUsername');
    const logedFullname = sessionStorage.getItem('logedFullname');

    const bookingsEventRef = ref(db, 'event/' + bookingId);
    const evntSnapshot = await get(bookingsEventRef);
    const evntDetails = evntSnapshot.val() || {};

    const bookedSeatsRef = ref(db, 'users/' + logedUsername + '/bookings/' + bookingId);

    const bookedSeatsSnapshot = await get(bookedSeatsRef);
    const bookedSeats = bookedSeatsSnapshot.val();
    const bookedSeatsFormated = bookedSeats.join(', ');
    

    const pdf = new jsPDF();

    pdf.setFont("noto", "bold");
    pdf.setFontSize(20);
    pdf.text("Event Ticket", 105, 25, { align: "center" });

    pdf.setFont(" ", "normal");
    pdf.setFontSize(12);
    pdf.text(`Event name: ${evntDetails.name}`, 20, 40);
    pdf.text(`Date: ${evntDetails.date}`, 20, 50);
    pdf.text(`Time: ${evntDetails.time}`, 20, 60);
    pdf.text(`Venue: ${evntDetails.venue.replace(/ə/g, "e")}`, 20, 70);
    pdf.text(`Seats: ${bookedSeatsFormated}`, 20, 80);
    pdf.text(`Seats reserved by: ${logedFullname}`, 20, 90);

    pdf.setFontSize(10);
    pdf.text("Please present this ticket at the venue!", 20, 110);

    pdf.save("Event_Ticket.pdf");
};

