let user;
let token;
let profile;

function validateCredentials() {
    const storage = $getStorage();
    user = storage.user;
    token = storage.token;
    
    if (!storage?.token) window.location.href ="/Frontend/src/pages/login.html";
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

async function getPublicTabs() {
    try {
        const url = "http://localhost:5000/api/tabs";
        const option = {
            "method": "GET",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "headers": { "x-auth-token": token }
        }
        const result = await fetch(url, option);
        const json = await result.json();
        return json.tabs.filter(tab => tab.isPublic);
    }
    catch (err) { console.log(err); }
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