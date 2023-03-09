// Utility Funtions

// DOM Selection
const $ = selector => document.querySelector(selector);                            // Select a Single DOM Element
const $all = selector => document.querySelectorAll(selector);                      // Select ALL DOM Elements

// Append a Child Element
// Expect an Object as Parameter { tag: STR, className: STR, id: STR, parent: DOM, NS: bool }
const $append = (props) => {
    const { tag, className, id, parent, ns } = { ...props };                       // Deconstruct Parameters
    const isDomElement = (e) => e instanceof Element || e instanceof HTMLDocument;
    
    if (!tag) throw Error("No TAG argument was given to create function.");        // Missing Tag
    if (!parent) throw Error("No PARENT argument was given to create function.");  // Missing Parent
    if (!isDomElement(parent)) throw Error("Parent is not a DOM Element.");        // Parent is NOT a DOM Element

    const elem = ns                                                                // Has Different Name Space                                                          
        ? document.createElementNS(`http://www.w3.org/2000/svg`, tag)              // Create SVG Elements (svg, circle, line...)
        : document.createElement(tag);                                             // Create Standard HTML DOM Element

    if (id) elem.id = id;                                                          // Add Id
    if (className) elem.classList.add(className);                                  // Add Class
    parent.appendChild(elem);                                                      // Append the Parent Element

    return elem;                                                                   // Return with the Created DOM Element
}



const $attr = (elem, props) => {
    const keys = Object.keys(props);
    keys.forEach(k => elem.setAttribute(k, props[k]));
}



// Audio Functions
function getAudio() {
    if (!app.musicAgreement) return new Error("User Did Not Argeed to Audio. Set app.musicAgreement to True");
    
    const audio = {};
    const guitarNotes = ["E2", "F2", "Fs2", "G2", "Gs2", "A2", "As2", "B2", "C3", "Cs3", "D3", "Ds3", "E3", "F3", "Fs3", "G3", "Gs3", "A3", "As3", "B3", "C4", "Cs4", "D4", "Ds4", "E4", "F4", "Fs4", "G4", "Gs4", "A4", "As4", "B4", "C5", "Cs5", "D5", "Ds5", "E5", "F5", "Fs5", "G5", "Gs5", "A5", "As5", "B5", "C6"];
    guitarNotes.forEach(note => {
        audio[note] = new Howl({ 
            src: ["../../sounds/"+  note + ".mp3"], 
            html5: true,
            buffer: true
        });
    });
    return audio;
}