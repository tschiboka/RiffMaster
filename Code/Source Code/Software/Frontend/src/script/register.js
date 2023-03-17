let revealPassword = false;
let revealConfirm = false;
let emailInput;
let firstNameInput;
let lastNameInput;
let userNameInput;
let passwordInput;
let confirmInput;
let emailField;
let firstNameField;
let lastNameField;
let userNameField;
let passwordField;
let confirmField;
let revealPasswordBtn;
let revealConfirmBtn;
let messageSpan;



function start() {
    emailInput = $("#email");                                      // Initialise DOM Elements
    firstNameInput = $("#fname");
    lastNameInput = $("#lname");
    userNameInput = $("#uname");
    passwordInput = $("#password");
    confirmInput = $("#confirm");
    emailField = $("#email-field");
    firstNameField = $("#fname-field");
    lastNameField = $("#lname-field");
    userNameField = $("#uname-field");
    passwordField = $("#password-field");
    confirmField = $("#confirm-field");
    registerButton = $("#register");
    revealPasswordBtn = $("#reveal-password");
    revealConfirmBtn = $("#reveal-confirm");
    messageSpan = $("#message");
    
    revealPasswordBtn.addEventListener("click", revealPasswordHandler);
    revealConfirmBtn.addEventListener("click", revealConfirmHandler);
    registerButton.addEventListener("click", register);
}



function revealPasswordHandler() {
    revealPassword = !revealPassword;
    
    if (revealPassword) {
        revealPasswordBtn.innerHTML = `<i id="eye-icon" class="fa-regular fa-eye-slash"></i>`;
        passwordInput.type = "text";
    }
    else {
        revealPasswordBtn.innerHTML = `<i id="eye-icon" class="fa-regular fa-eye"></i>`;
        passwordInput.type = "password";
    }
}



function revealConfirmHandler() {
    revealConfirm = !revealConfirm;
    
    if (revealConfirm) {
        revealConfirmBtn.innerHTML = `<i id="eye-icon" class="fa-regular fa-eye-slash"></i>`;
        confirmInput.type = "text";
    }
    else {
        revealConfirmBtn.innerHTML = `<i id="eye-icon" class="fa-regular fa-eye"></i>`;
        confirmInput.type = "password";
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



function validateEmail() {
    const email = emailInput.value.trim();
    if (!email) { generateFormMessage("Email Input Cannot be Left Empty!"); return false; }
    
    const mailRegex = new RegExp(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/, "i");
    if (!mailRegex.test(email)) { generateFormMessage("Email Input is NOT a Valid Email Format!"); return false; }
    
    return true;
}


function validateFirstName() {
    const firstName = firstNameInput.value.trim();
    
    if (!firstName) { generateFormMessage("First Name Input Cannot be Left Empty!"); return false; }
    if (firstName.length <= 1) { generateFormMessage("First Name Must Be at Least 8 Characters Long!"); return false; }
    if (firstName.length > 50) { generateFormMessage("First Name Must Be Maximum 50 Characters Long!"); return false; }
    if (!/^[a-z \-']+$/i.test(firstName)) { generateFormMessage("First Name Must Not Contain Numeric or Special Characters!"); return false; }
    return true;
}



function validateLastName() {
    const lastName = lastNameInput.value.trim();
    
    if (!lastName) { generateFormMessage("Last Name Input Cannot be Left Empty!"); return false; }
    if (lastName.length <= 1) { generateFormMessage("Last Name Must Be at Least 8 Characters Long!"); return false; }
    if (lastName.length > 50) { generateFormMessage("Last Name Must Be Maximum 50 Characters Long!"); return false; }
    if (!/^[a-z \-']+$/i.test(lastName)) { generateFormMessage("Last Name Must Not Contain Numeric or Special Characters!"); return false; }
    return true;
}



function validateUserName() {
    const userName = userNameInput.value.trim();
    
    if (!userName) { generateFormMessage("User Name Input Cannot be Left Empty!"); return false; }
    if (userName.length < 5) { generateFormMessage("User Name Must Be at Least 8 Characters Long!"); return false; }
    if (userName.length > 20) { generateFormMessage("User Name Must Be Maximum 50 Characters Long!"); return false; }
    if (!/^[a-z0-9\-_']+$/i.test(userName)) { generateFormMessage("User Name Must Not Contain Special Characters or Space!"); return false; }
    return true;
}



function validatePassword() {
    const password = passwordInput.value.trim();
    
    if (!password) { generateFormMessage("Password Input Cannot be Left Empty!"); return false; }
    if (password.length < 8) { generateFormMessage("Password Must Be at Least 8 Characters Long!"); return false; }
    if (password.length > 50) { generateFormMessage("Password Must Be Maximum 50 Characters Long!"); return false; }
    if (!/\d/.test(password)) { generateFormMessage("Password Must Contain at Least One Number!"); return false; }
    if (!/[a-z]/i.test(password)) { generateFormMessage("Password Must Contain at Least One Letter!"); return false; }
    
    return true;
}



function validateConfirm() {
    const confirm = confirmInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!confirm) { generateFormMessage("Confirm Input Cannot be Left Empty!"); return false; }
    if (confirm !== password) { generateFormMessage("Confirm Input Must Match Password!"); return false; }
    return true;
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
    const formFieldsDOM = [ emailField, firstNameField, lastNameField, userNameField, passwordField, confirmField ];
    formFieldsDOM.forEach(el => {
        el.classList.remove("highlight");
    });
}



function validateInputs() {
    // Call Validations in Reverse Order to Prevent the Error Message to be Overridden
    const validConfirm = validateConfirm();
    if (!validConfirm) { removeHighlight(); confirmField.classList.add("highlight"); }
    
    const validPassword = validatePassword();
    if (!validPassword) { removeHighlight(); passwordField.classList.add("highlight"); }
    
    const validUserName = validateUserName();
    if (!validUserName) { removeHighlight(); userNameField.classList.add("highlight"); }
    
    const validLastName = validateLastName();
    if (!validLastName) { removeHighlight(); lastNameField.classList.add("highlight"); }
    
    const validFirstName = validateFirstName();
    if (!validFirstName) { removeHighlight(); firstNameField.classList.add("highlight"); }
    
    const validEmail = validateEmail();
    if (!validEmail) { removeHighlight(); emailField.classList.add("highlight"); console.log("Email"); }
    
    return validEmail && validFirstName && validLastName && validUserName && validPassword && validConfirm;
}



async function register() {
    console.log("REGISTER");
    clearMessage();
    
    const email = emailInput.value.trim();
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const userName = userNameInput.value.trim();
    const password = passwordInput.value.trim();
    const confirm = confirmInput.value.trim();
    const valid = validateInputs();
    
    
    if (valid) {
        // Store values in Local Storage riffmaster Property
        const user = { 
            email,
            userName,
            password,
            profile: {
                firstName,
                lastName,
            }
        }
        localStorage.setItem("riffmaster", JSON.stringify(user));
        window.location.href = "http://127.0.0.1:5501/Frontend/src/pages/profile.html";
    }
}