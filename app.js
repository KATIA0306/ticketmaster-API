const results = document.getElementById("results");
const carouselResults = document.getElementById("myCarousel");




const searchForm = () => {

   // calls data from the form /fetch data from 4 inputs and create variables for them

   const searchQueryElem = document.querySelector('.search-input');
   const searchQuery = searchQueryElem.value;
   const locationElem = document.getElementById("pac-input");
   const address = locationElem.value;
   const dateCal = document.getElementById("datePicker");
   const date = dateCal.value;
   const event = document.getElementById("eventType");
   const eventType = event.value;

   convertAddressToGeopoint(address)
       .then((latlong) => {
           searchEvents(searchQuery, date, eventType, latlong)
               .then((response) => {
                   clearResults();
                   if (response._embedded.events && response._embedded.events.length > 0) {
                       addEvents(response._embedded.events);
                   } else {
                       displayText('There are no results.');
                   }
               })
               .catch((error) => {
                   console.error(error);
                   clearResults();
                   displayText('No connection. Please try again');
               });

       })

   return false;
}

const clearResults = () => {
   results.innerHTML = "";
}

const displayText = (text) => {
   const textElem = document.createElement("p");
   textElem.classList.add("text-center");
   textElem.classList.add("empty-results");
   textElem.textContent = text;
   results.appendChild(textElem);
}

const convertObjToParams = (obj) => {
   let str = "";
   for (let key in obj) {
       if (str != "") {
           str += "&";
       }
       str += key + "=" + encodeURIComponent(obj[key]);
   }
   return str;
}

// convert dates from 2018-06-06 to YYYY-MM-DDTHH:mm:ssZ
const convertDate = (date) => {
   return date + "T00:00:00Z";
}



const convertAddressToGeopoint = (address) => {
   const geocoder = new google.maps.Geocoder();

   return new Promise(function (resolve, reject) {
       geocoder.geocode({ 'address': address }, function (results, status) {
           if (status == google.maps.GeocoderStatus.OK) {
               let latitude = results[0].geometry.location.lat();
               let longitude = results[0].geometry.location.lng();
               resolve(latitude + "," + longitude);
           }
       });
   });

};

// take data from the form and fetch
const searchEvents = (searchQuery, date, eventType, latlong) => {
   let url = "https://app.ticketmaster.com/discovery/v2/events.json?"

   url += convertObjToParams({
       apikey: 'LPFmrYMW0APrikZkpo9LS5DN0gW46cWb',
       keyword: searchQuery + " " + eventType,
       startDateTime: convertDate(date),
       latlong: latlong,
       radius: '20',
       unit: 'km'
   });

   return fetch(url, { mode: 'cors' })
       .then((response) => {
           return response.json()
       });
}   


// Create template
const createOneEvent = (event) => {
    if (event.priceRanges) {
        let source = document.getElementById("event-template").innerHTML;
        let template = Handlebars.compile(source);
        return template(event);
    }  else {
        return '';
    }
}

const addEvents = (events) => {
    const eventsWithDuplicates = events.filter((event, index, self) =>
    index === self.findIndex((t) => (
      t.name === event.name
    ))
  )

   const resultsStr = `
           <div class="row">
               ${eventsWithDuplicates.map(event => createOneEvent(event)).join("")}
           </div>
               `
   results.innerHTML = resultsStr;
}

// Carousel
const createCarousel = () => {

   const city = 'Toronto';
   const carousel = document.getElementById("myCarousel");

   searchCarousel(city)
       .then((response) => {
           if (response._embedded.events && response._embedded.events.length > 0) {
               addCarousel(response._embedded.events);
           }
       });
   return false;
}


const searchCarousel = (city) => {
   let url = "https://app.ticketmaster.com/discovery/v2/events.json?"

   url += convertObjToParams({
       apikey: 'LPFmrYMW0APrikZkpo9LS5DN0gW46cWb',
       city: city
       });

   return fetch(url, { mode: 'cors' })
       .then((response) => {
           return response.json()
       });
}



const createOneCarousel = (event) => {
   return `<div class="carousel-item" id="carouselItem">
                           <div class="event-container">
                               <div class="overlap"></div>
                               <div class="d-block w-100 carousel-image" style="background-image: url('${event.images[1].url}')"></div>
                               <div class="carousel-caption d-none d-block">
                               <h5 class="carouselText">${event.dates.start.localDate}</h5>
                               <p class="carouselText">${event.name}</p>
                             </div>
                           </div>
                       </div>`;
}

const addCarousel = (events) => {
    const eventsWithDuplicates = events.filter((event, index, self) =>
    index === self.findIndex((t) => (
      t.name === event.name
    ))
  )

   const carouselStr = `
                       <div class="row">
                           ${eventsWithDuplicates.map(event => createOneCarousel(event)).join("")}
                       </div>
                           `
   carouselResults.innerHTML = carouselStr;

let elements = document.getElementsByClassName('carousel-item');
let requiredElement = elements[0];
requiredElement.classList.add("active");
}

createCarousel();

