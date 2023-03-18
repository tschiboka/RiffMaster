function getStorage() {
    const storage = localStorage.getItem("riffmaster");

    return storage ? JSON.parse(storage) : null;
}

function validateCredentials() {
    const storage = getStorage();
    if (!storage?.token) window.location.href ="/Frontend/src/pages/login.html";
}

function start() {
    validateCredentials();
}

function signout() {
    localStorage.removeItem("riffmaster");
    validateCredentials();
}