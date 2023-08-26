let user;
let token;
let profile;

function validateCredentials() {
    console.log("HERE");
    const storage = $getStorage();
    const live = true;
    if (live) if (!storage?.token) window.location.href = "https://tschiboka.co.uk/projects/riffmaster/src/pages/login.html";
    else if (!storage?.token) window.location.href = "/src/pages/login.html";
    user = storage.user;
    token = storage.token;
}

async function start() {
    validateCredentials();

    // Set Profile
    profile = await getProfile();
    
    // Get Publicly Available Tabs
    const tabs = await getPublicTabs();
    console.log(tabs);
    setProfileInfo();
}

async function getProfile() {
    try {
        const url = "http://localhost:5000/api/profiles/" + user.profile;
        const option = {
            "method": "GET",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "headers": { "x-auth-token": token }
        }
        const result = await fetch(url, option);
        const json = await result.json();
        return json.profile;
    }
    catch (err) { console.log(err); }
}

async function getPublicTabs() {                                   // Get Tabs with isPublic True from DB
    try {                                                          
        const url = "http://localhost:5000/api/tabs";              // API Endpoint
        const option = {
            "method": "GET",                                       // Get Tabs
            "Content-Type": "application/json",                   
            "Accept": "application/json",
            "headers": { "x-auth-token": token }                   // Send JSON Signature Token
        }
        const result = await fetch(url, option);                   // Consume Request
        const json = await result.json();                          // Transform to JSON 
        return json.tabs.filter(tab => tab.isPublic);              // Get Public Tabs
    }
    catch (err) { console.log(err); }                              // Temp: Just Console (There Will be a Message Box)
}

function setProfileInfo() {
    const img = $("#profile-img");
    img.src = "./images/avatars/" + profile.avatar + ".png";

    const userName = $("#username");
    userName.innerHTML = user.userName
}

function signout() {
    localStorage.removeItem("riffmaster");
    validateCredentials();
}