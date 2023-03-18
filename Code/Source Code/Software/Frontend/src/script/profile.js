let dayInput;
let monthInput;
let yearInput;
let maleInput;
let femaleInput;
let genderXInput;
let countryInput;
let cityInput;
let postCodeInput;
let addressLine1Input;
let addressLine2Input;
let phoneInput;
let avatarSelected;

let dobField;
let genderField;
let countryField;
let cityField;
let postCodeField;
let addressLine1Field;
let addressLine2Field;
let phoneField;
let avatarField;
let messageSpan;

let email;
let firstName;
let lastName;
let userName;
let password



function start() {
    generateAvatar();
    dayInput = $("#day");                                      // Initialise DOM Elements
    monthInput = $("#month");
    yearInput = $("#year");
    maleInput = $("#male");
    femaleInput = $("#female");
    genderXInput = $("#gender-x");
    countryInput = $("#country");
    cityInput = $("#city");
    postCodeInput = $("#postcode");
    addressLine1Input = $("#address1");
    addressLine2Input = $("#address2");
    phoneInput = $("#phone");

    dobField = $("#dob-field");
    genderField = $("#gender-field");
    countryField = $("#country-field");
    cityField = $("#city-field");
    postCodeField = $("#postcode-field");
    addressLine1Field = $("#address1-field");
    addressLine2Field = $("#address2-field");
    phoneField = $("#phone-field");
    avatarField = $(".avatar-box");
    messageSpan = $("#message");
    confirmButton = $("#register");
    
    const tempStorage = JSON.parse(localStorage.getItem("riffmaster"));
    email = tempStorage.user.email;
    firstName = tempStorage.user.profile.firstName;
    lastName = tempStorage.user.profile.lastName;
    userName = tempStorage.user.userName;
    password = tempStorage.user.password
    const validTemp =  !!(email && firstName && lastName && userName && password); 
    
    if (validTemp) {
        confirmButton.addEventListener("click", register);
        avatarField.addEventListener("click", handleAvatarClick);
        autocomplete(countryInput, countryList);
    }
    else {
        generateFormMessage("Could Not Fetch Data From Register Page!");
    }
}



async function probeConnection() {
    const options = {
        method: 'GET',
        //mode: 'no-cors',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        //body: JSON.stringify({ email, password })
    };

    try {
        const response = await fetch("http://localhost:5000/", options);
        const responseJSON = await response.json();
        if (responseJSON.success) {
            generateFormMessage("GET:riffmaster/ - Connection Successful", "info");
            return true;
        }
        else {
            generateFormMessage("GET:riffmaster/ - Connection Failed");
            return false;
        }
    } catch (ex) {
        generateFormMessage("GET:riffmaster/ - Connection Failed");
        console.log(ex);
        return false;
    }
}



function validateDay() {
    const day = dayInput.value.trim();

    if (!day) { generateFormMessage("Day Input Cannot be Left Empty!"); return false; }
    if (isNaN(day)) { generateFormMessage("Day Must be a Number!"); return false; }
    if (day < 1 || day > 31) { generateFormMessage("Day Must be Between 1 and 31!"); return false; }    
    return true;
}



function validateMonth() {
    const month = monthInput.value.trim();
    
    if (!month) { generateFormMessage("Month Input Cannot be Left Empty!"); return false; }
    if (isNaN(month)) { generateFormMessage("Month Must be a Number!"); return false; }
    if (month < 1 || month > 12) { generateFormMessage("Month Must be Between 1 and 12!"); return false; }    
    return true;
}



function validateYear() {
    const year = yearInput.value.trim();
    
    if (!year) { generateFormMessage("Year Input Cannot be Left Empty!"); return false; }
    if (isNaN(year)) { generateFormMessage("Year Must be a Number!"); return false; }
    
    // Underage < 14 (Not Accurate, Just the Years)
    const yearNow = Number(new Date().getFullYear());
    const age = yearNow - Number(year);
    if (year > yearNow) { generateFormMessage("Congratulation! You Were Born in the Future!"); return false; }
    if (age < 14) { generateFormMessage("Under Age (Min 14)! Ask Your Parent to Create an Account!"); return false; }
    if (year < 1900) { generateFormMessage("Year Must be More than 1900!"); return false; }
    return true;
}



function validateDate() {
    const dateStr = `${ yearInput.value.trim() }-${ monthInput.value.trim() }-${ dayInput.value.trim() }`;
    const date = Date.parse(dateStr);
    if (!date) { generateFormMessage("Invalid Date: " + dateStr + "!"); return false; }  
    return true;
}


const countryList = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua & Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia & Herzegovina","Botswana","Brazil","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Central Arfrican Republic","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica","Cote D Ivoire","Croatia","Cuba","Curacao","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Myanmar","Namibia","Nauro","Nepal","Netherlands","Netherlands Antilles","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","North Korea","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre & Miquelon","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","St Kitts & Nevis","St Lucia","St Vincent","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad & Tobago","Tunisia","Turkey","Turkmenistan","Turks & Caicos","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States of America","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"];
function validateCountry() {
    const country = countryInput.value.trim().toLowerCase();
    const validCountry = countryList.find(c => c.toLowerCase() === country);
    if (!validCountry) { generateFormMessage("Invalid Country!"); return false; }
    return true;
}



function validateCity() {
    const city = cityInput.value.trim();
    if (!city) { generateFormMessage("City Input Cannot be Left Empty!"); return false; }
    if (city.length <= 2) { generateFormMessage("City Must Be at Least 2 Characters Long!"); return false; }
    if (city.length > 50) { generateFormMessage("City Must Be Maximum 50 Characters Long!"); return false; }
    if (!/^[a-z \-']+$/i.test(city)) { generateFormMessage("City Must Not Contain Numeric or Special Characters!"); return false; }
    return true;
}



function validatePostCode() {
    const postCode = postCodeInput.value.trim();
    if (!postCode) { generateFormMessage("Post Code Input Cannot be Left Empty!"); return false; }
    if (postCode.length <= 2) { generateFormMessage("Post Code Must Be at Least 2 Characters Long!"); return false; }
    if (postCode.length > 10) { generateFormMessage("Post Code Must Be Maximum 10 Characters Long!"); return false; }
    if (!/^[a-z0-9 \-]+$/i.test(postCode)) { generateFormMessage("Post Code Must Not Contain Special Characters!"); return false; }
    return true;
}



function validateAddressLine1() {
    const addressLine1 = addressLine1Input.value.trim();
    if (!addressLine1) { generateFormMessage("Address Line 1 Input Cannot be Left Empty!"); return false; }
    if (addressLine1.length <= 5) { generateFormMessage("Address Line 1 Must Be at Least 5 Characters Long!"); return false; }
    if (addressLine1.length > 100) { generateFormMessage("Address Line 1 Must Be Maximum 100 Characters Long!"); return false; }
    if (!/^[a-z0-9 \-.,/']+$/i.test(addressLine1)) { generateFormMessage("Address Line 1 Must Not Contain Special Characters!"); return false; }
    return true;
}



function validateAddressLine2() {
    const addressLine2 = addressLine2Input.value.trim();
    if (!addressLine2) return true;
    if (addressLine2.length > 100) { generateFormMessage("Address Line 2 Must Be Maximum 100 Characters Long!"); return false; }
    if (!/^[a-z0-9 \-.,/']+$/i.test(addressLine2)) { generateFormMessage("Address Line 2 Must Not Contain Special Characters!"); return false; }
    return true;
}



function validatePhone() {
    const phone = phoneInput.value.trim();
    if (!phone) { generateFormMessage("Phone Input Cannot be Left Empty!"); return false; }
    if (phone.length <= 8) { generateFormMessage("Phone Must Be at Least 8 Digits Long!"); return false; }
    if (phone.length > 20) { generateFormMessage("Phone Must Be Maximum 20 Digits Long!"); return false; }
    if (!/[0-9]+$/i.test(phone)) { generateFormMessage("Phone Number Must Contain Only Digits!"); return false; }
    return true;
}



function validateAvatar() {
    const avatar = avatarSelected;
    if (!avatar) { generateFormMessage("Choose Your Avatar!"); return false; }
    return true;
}




function validateInputs() {
    // Call Validations in Reverse Order to Prevent the Error Message to be Overridden
    const avatarValid = validateAvatar();
    if (!avatarValid) { removeHighlight(); avatarField.classList.add("highlight"); }
    
    const phoneValid = validatePhone();
    if (!phoneValid) { removeHighlight(); phoneField.classList.add("highlight"); }
    
    const addressLine2Valid = validateAddressLine2();
    if (!addressLine2Valid) { removeHighlight(); addressLine2Field.classList.add("highlight"); }
    
    const addressLine1Valid = validateAddressLine1();
    if (!addressLine1Valid) { removeHighlight(); addressLine1Field.classList.add("highlight"); }
    
    const postCodeValid = validatePostCode();
    if (!postCodeValid) { removeHighlight(); postCodeField.classList.add("highlight"); }
    
    const cityValid = validateCity();
    if (!cityValid) { removeHighlight(); cityField.classList.add("highlight"); }
    
    const countryValid = validateCountry();
    if (!countryValid) { removeHighlight(); countryField.classList.add("highlight"); }
    
    const dateValid = validateDate();
    if (!dateValid) { removeHighlight(); dobField.classList.add("highlight"); }
    
    const yearValid = validateYear();
    if (!yearValid) { removeHighlight(); dobField.classList.add("highlight"); }
    
    const monthValid = validateMonth();
    if (!monthValid) { removeHighlight(); dobField.classList.add("highlight"); }
    
    const dayValid = validateDay();
    if (!dayValid) { removeHighlight(); dobField.classList.add("highlight"); }
    
    return dayValid && monthValid && yearValid && dateValid && countryValid && cityValid && postCodeValid && addressLine1Valid && addressLine2Valid && phoneValid && avatarValid;
}



function generateFormMessage(message, messageType = "error") {
    if (messageType === "error") messageSpan.classList.add("error");
    else if (messageType === "info") messageSpan.classList.add("info");
    else throw Error(`Message Type ${ messageType } is Not Supported!`);
    
    messageSpan. innerHTML = message;
}



function clearMessage() {
    messageSpan.innerHTML = "";
    messageSpan.classList.remove(...messageSpan.classList);
    removeHighlight();
}



function removeHighlight() {
    const formFieldsDOM = [ dobField, genderField, countryField, cityField, postCodeField, addressLine1Field, addressLine2Field, phoneField, avatarField ];
    formFieldsDOM.forEach(el => {
        el.classList.remove("highlight");
    });
}



function generateAvatar() {
    const avatarDIV = $(".avatar-box");
    
    for (let i = 1; i <= 15; i++) {
        const avatar = $append({
            tag: "img",
            className: "avatar",
            id: "avatar" + i,
            parent: avatarDIV
        });
        avatar.src = `../../images/avatars/avatar${ i }.png`;
        avatar.alt = `avatar ${ i }`;
    }
}



function handleAvatarClick(event) {
    const id = event.target.id;
    avatarSelected = id;
    
    // Clear Previously Selected Avatar
    const avatarsDOM = [ ...$all(".avatar") ];
    avatarsDOM.forEach(el => el.classList.remove("selected"));
    event.target.classList.add("selected");
}



async function register() {
    clearMessage();
    
    if (validateInputs()) {
        const day = dayInput.value.trim();
        const month = monthInput.value.trim();
        const year = yearInput.value.trim();
        const dateOfBirth = `${ month }-${ day }-${ year }`; // US Format for DB Cause it Winges and Cries
        const country = countryInput.value.trim();
        const city = cityInput.value.trim();
        const postCode = postCodeInput.value.trim();
        const addressLine1 = addressLine1Input.value.trim();
        const addressLine2 = addressLine2Input.value.trim();
        const phone = phoneInput.value.trim();
        const avatar = avatarSelected;
        const gender = $("#male").checked ? "male" 
                                          : $("#female").checked ? "female"
                                          : "x"; 
        const user = {
            email,
            userName,
            password,
            profile: {
                firstName,
                lastName,
                dateOfBirth,
                gender,
                country,
                city,
                postCode,
                addressLine1,
                addressLine2,
                phone,
                avatar
            }
        }

        generateFormMessage("Sending Confirmation Email...", "info");
        //Send Subscription Confirmation Email
        const options = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user })
        };
    
        try {
            const response = await fetch("http://localhost:5000/api/subscribe/", options);
            const responseJSON = await response.json();
            if (responseJSON.success) { 
                generateFormMessage(responseJSON.message); 
                localStorage.deleteItem("riffmaster");
                return true; 
            }
            else { console.log("HERE"); generateFormMessage(responseJSON.message); return false; }
        } catch (ex) {
            generateFormMessage(ex.message);
            return false;
        }
    }
}



function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;

    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });

    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          e.preventDefault();
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
          }
        }
    });

    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }

    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }

    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }

  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });

  } 