let revealPassword = false;
let passwordInput;
let emailInput;
let emailField;
let passwordField;
let loginButton;
let revealButton;
let messageSpan;



function start() {
    passwordInput = $("#password");
    emailInput = $("#email");
    loginButton = $("#login");
    registerButton = $("#register");
    revealButton = $("#reveal-password");
    messageSpan = $("#message");
    emailField = $("#email-field");
    passwordField = $("#password-field");
    
    revealButton.addEventListener("click", reveal);
    loginButton.addEventListener("click", login);
    registerButton.addEventListener("click", register);
}



function reveal() {
    revealPassword = !revealPassword;
    
    if (revealPassword) {
        revealButton.innerHTML = `<i id="eye-icon" class="fa-regular fa-eye-slash"></i>`;
        passwordInput.type = "text";
    }
    else {
        revealButton.innerHTML = `<i id="eye-icon" class="fa-regular fa-eye"></i>`;
        passwordInput.type = "password";
    }
}



async function login() {
    clearMessage();
    const valid = validateInputs();
    
    if (valid) {
        generateFormMessage("Connecting to RiffMaster Server...", "info");
        const serverConnection = await probeConnection();
        console.log(serverConnection);
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



function validatePassword() {
    const password = passwordInput.value.trim();

    if (!password) { generateFormMessage("Password Input Cannot be Left Empty!"); return false; }
    if (password.length < 8) { generateFormMessage("Password Must Be at Least 8 Characters Long!"); return false; }
    if (password.length > 50) { generateFormMessage("Password Must Be Maximum 50 Characters Long!"); return false; }
    if (!/\d/.test(password)) { generateFormMessage("Password Must Contain at Least One Number!"); return false; }
    if (!/[a-z]/i.test(password)) { generateFormMessage("Password Must Contain at Least One Letter!"); return false; }

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
}



function validateInputs() {
    // Call Validations in Reverse Order to Prevent the Error Message to be Overridden
    const validPassword = validatePassword();
    if (!validPassword) { removeHighlight(); passwordField.classList.add("highlight"); }

    const validEmail = validateEmail();
    if (!validEmail) { removeHighlight(); emailField.classList.add("highlight"); console.log("Email"); }

    return validEmail && validPassword;
}




function removeHighlight() {
    const formFieldsDOM = [ emailField, passwordField ];
    formFieldsDOM.forEach(el => {
        el.classList.remove("highlight");
    });
}



async function register() {
    window.location.href = "http://127.0.0.1:5501/Frontend/src/pages/register.html";
}