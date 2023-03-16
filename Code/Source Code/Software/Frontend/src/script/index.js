function getStorage() {
    const storage = localStorage.getItem("riffmaster") || {};
    if (!storage.token) storage.token = ""                      // Set Token Empty

    return storage;
}

function start() {
    const storage = getStorage();
    if (!storage.token) redirectToLogin();
}

function redirectToLogin() {
    window.location.href ="/Frontend/src/pages/login.html";
    console.log("Redirect")
}