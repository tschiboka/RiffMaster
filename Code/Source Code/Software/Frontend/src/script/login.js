let revealPassword = false;
let passwordInput;
let emailInput;
let submitButton;
let revealButton;
let messageSpan;



function start() {
    passwordInput = $("#password");
    emailInput = $("#email");
    submitButton = $("#submit");
    revealButton = $("#reveal-password");
    messageSpan = $("#message");
    
    revealButton.addEventListener("click", reveal);
    submitButton.addEventListener("click", login);
}



function reveal() {
    revealPassword = !revealPassword;
    
    console.log(revealPassword)
    if (revealPassword) {
        revealButton.innerHTML = `<i id="eye-icon" class="fa-regular fa-eye-slash"></i>`;
        passwordInput.type = "text";
    }
    else {
        revealButton.innerHTML = `<i id="eye-icon" class="fa-regular fa-eye"></i>`;
        passwordInput.type = "password";
    }
}



function login() {
    const isValid = validateForm();
    console.log(isValid);
}



function validateForm() {
    messageSpan.innerHTML = "";
    const [ email, password ] = [ emailInput.value.trim(), passwordInput.value.trim() ];

    let message;
    // Validate Email
    if (!email) { generateFormMessage("Email Input Cannot be Left Empty!"); return false; }
    const mailRegex = new RegExp('^[a-z0-9]+@[a-z]+\.[a-z]{2,3}$', "i");
    if (!mailRegex.test(email)) { generateFormMessage("Email Input is NOT a Valid Email Format!"); return false; }

    // Validate Password
    if (!password) { generateFormMessage("Password Input Cannot be Left Empty!"); return false; }
    if (password.length < 8) { generateFormMessage("Password Must Be at Least 8 Characters Long!"); return false; }
    if (password.length > 50) { generateFormMessage("Password Must Be Maximum 50 Characters Long!"); return false; }
    if (!/\d/.test(password)) { generateFormMessage("Password Must Contain at Least One Number!"); return false; }
    if (!/[a-z]/i.test(password)) { generateFormMessage("Password Must Contain at Least One Letter!"); return false; }

    generateFormMessage("Form Validation Passed...", "info");
    return true;
}



function generateFormMessage(message, messageType = "error") {
    messageSpan.classList.remove();
    if (messageType === "error") messageSpan.classList.add("error");
    else if (messageType === "info") messageSpan.classList.add("info");
    else throw Error(`Message Type ${ messageType } is Not Supported!`);
    
    messageSpan. innerHTML = message;
}