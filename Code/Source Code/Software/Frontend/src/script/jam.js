const app = {
    musicAgreement: false,                             // User Agreed of Audio Playing
    controllerState: initialiseAppControllerState(),   // Set Inital State and Variables
    DOM: {},                                           // Store Board and Equaliser Elements for Time Performance
    equalizer: [],                                     // Equalizer State Arr[45] of INT range 0 - 32
    equalizerTimers: [] 
}

const guitarNotes = ["E2", "F2", "Fs2", "G2", "Gs2", "A2", "As2", "B2", "C3", "Cs3", "D3", "Ds3", "E3", "F3", "Fs3", "G3", "Gs3", "A3", "As3", "B3", "C4", "Cs4", "D4", "Ds4", "E4", "F4", "Fs4", "G4", "Gs4", "A4", "As4", "B4", "C5", "Cs5", "D5", "Ds5", "E5", "F5", "Fs5", "G5", "Gs5", "A5", "As5", "B5", "C6"];
const strumOffsets = [0, 5, 10, 15, 19, 24];

// Find DOM Elements
function start() {
    app.notes = getAudio();                            // Load Audio Files
    createEqualizer();                                 // Create Equalizer Component
    app.equalizer = new Array(guitarNotes.length).fill(0);
    app.equalizerTimers = new Array(guitarNotes.length).fill(null);

    createGuitar();                                     // Create Guitar Simulator Board
    getDOMElements();                                   // Load DOM Elements
}



$("#allow-music-btn").addEventListener("click", () => {
    handleMusicAgreementClick();
});



function getDOMElements() {
    app.DOM.board_LI = [...$all("#guitar li.fret-note")];                   // List Element (Note)
    app.DOM.board_SPAN = [...$all("#guitar span.fret-note")];               // Span Element (Note's Text)
    app.DOM.board_BTN = [...$all("#guitar button")];                        // String Buttons
    app.DOM.boardStrings = [...$all(".guitar__string")];                    // Strings
    app.DOM.equalizerBeats_DIV = [...$all(".equalizer__beat")];             // Small Square on the Equaliser
}


 
function handleStrumActivated(event, strum) {
    const positions = app.controllerState.highestFretPositions[strum - 1];  // Finger Positions on a String Row
    const upperMost =  positions[positions.length - 1];                     // Topmost Pressed Position
    
    const note = guitarNotes[strumOffsets[strum - 1] + upperMost];          // Note Name that Plays
    
    if (event !== 0) {                                                      // Strum Pressed  
        const notesOnString = positions                                     // Find Strings Currently Playing
            .map(position => guitarNotes[strumOffsets[strum - 1] + position]);   
        const notesPlaying = notesOnString                                  // Find Notes Currently Playing
            .filter(note => app.audio[note].playing());
        notesPlaying.forEach(note => stopNote(note));
        
        displayActionOnBoard(upperMost, strum, strum, !event);              // Highlight Played Note and String
    }
    else {                                                                  // Strum Released
        if (upperMost === undefined) return;
        playNote(note, strum);
        if (upperMost !== 0) {                                              // If Finger Position is Not 0
            displayActionOnBoard(upperMost, strum, -1, false);              // Put Back Semi Highlight
        }
        else {
            displayActionOnBoard(upperMost, strum, strum, !event);          // Clear Highlight
        }
    }
}



function handleFretActivated(event, fret, string) {
    if (!fret) return;
    displayActionOnBoard(fret, string, -1, !event);
    
    if (event === 0) {                                                      // If Finger is Off Position 
        const note = guitarNotes[strumOffsets[string - 1] + fret];          // Find Note
        stopNote(note);                                                     // Stop the Note Playing
    }
    else {                                                                  // If Finger Presses Position
        const positions = app.controllerState.highestFretPositions[string - 1];      // Find Positions Pressed on the String
        const notes = positions.map(p => guitarNotes[strumOffsets[string - 1] + p]); // Corresponding Notes for Finger Positions
        const playing = notes.filter(note => app.audio[note].playing());    // Find Playing Note
        playing.forEach(pl => stopNote(pl));                                // Stop Note                
    }
}



function playNote(note, string) { app.audio[note].play(); displayActionOnEqualizer(note, true, string); }
function stopNote(note) { app.audio[note].stop(); displayActionOnEqualizer(note, false); }



// Display Action on Board: Function Highlights Active Controller Inputs on the Guitar Board
//     Fret:            Finger Position on the Fretboard (1 - 20)
//     String:          String on Fret Board (0 - 5)
//     Strum:           Which Strum is Activated (-1: No Strum Action, 0 - 5: Strummed String)
//     RemoveHighLight: Resets DOM to Inactive Status
function displayActionOnBoard(fret, string, strum, removeHighlight = false) {
    const COLS = 21;                                                // 20 Frets in a Row Plus Fret 0
    const TOT_STRINGS = 6;                                          // Total Number of Highlightable Rows 
    const index = (TOT_STRINGS - string) * COLS + fret;             // Index in the List of DOM Elements
    const fret_LI = app.DOM.board_LI[index];                        // Get Elements
    const fret_SPAN = app.DOM.board_SPAN[index];
    const fret_BTN = app.DOM.board_BTN[TOT_STRINGS - string];
    const strings = app.DOM.boardStrings[TOT_STRINGS - string];
    
    fret_LI.classList.remove(...fret_LI.classList);                 // Remove ALL Classes as There are Multiple States (None, Semi-Highlight, Highlight)
    fret_SPAN.classList.remove(...fret_SPAN.classList);
    fret_BTN.classList.remove(...fret_BTN.classList);               
    strings.classList.remove(...strings.classList);
    strings.classList.add("guitar__string");               

    if (!removeHighlight) {
        if (strum == -1) {                                          // If Fret Board Action
            fret_LI.classList.add("fret-note", "semi-highlight");   // Soft Highlight
            fret_SPAN.classList.add("fret-note", "semi-highlight");
        }
        else {
            fret_LI.classList.add("fret-note", "highlight");        // Bright Highlight
            fret_SPAN.classList.add("fret-note", "highlight");

            fret_BTN.classList.add("highlight");                    // Highlight Strum Button
            strings.classList.add("highlight");                     // Highlight String
        }
    }

    if (fret > 0) {                                                 // Remove Highlight from String 0 Fret
        const baseStringIndex = (TOT_STRINGS - string) * COLS;      // Index in the List of DOM Elements
        const baseString_LI = app.DOM.board_LI[baseStringIndex];    // Get Base DOM Element
        //const baseString_SPAN = 
        baseString_LI.classList.remove(...baseString_LI.classList); // Remove Highlight
        baseString_LI.classList.add("fret-note");                   // Place Back Original Class
    }
}



function calculateFretDistances(totalDistance) {
    let distance = totalDistance;                                   // Initial Distance is the Total Distance
    const RATIO = 17.817;                                           // Golden Ratio Used in Electric and Acounstic Guitars
    const frets = 20;                                               // Total of 20 Frets
    const fretDistances = [];                                       // Initial Result Array

    for (let fret = 0; fret < frets; fret++) {                      // Iterate Frets
        const prevDistance = distance;                              // Store Previous Distance
        distance -= distance / RATIO;                               // Update Distance by Taking Off Golden Ratio
        fretDistances.push(parseInt(prevDistance - distance));      // Append the Result Array
    }
    
    fretDistances.push(parseInt(distance));                         // Last Item is the Leftover
    return fretDistances;
}



function handleMusicAgreementClick() {
    $(".agree-music").style.display = "none";
    app.musicAgreement = true;
    app.audio = getAudio();
}



// Create the Guitar Body that Interacts with the User
function createGuitar() {
    const guitarDOM = $("#guitar");                                 // Get Guitar Element
    const fretWidth = guitarDOM.offsetWidth - 400                   // Display Frets and Strings (40 is for the String Name)
    const fretDistances = calculateFretDistances(fretWidth);        // Get an Int[20] of Fret Widths
    const stringNames = ["e", "B", "G", "D", "A", "E", ""];         // From Highest to Lowest
    const stringStarts = [24, 19, 15, 10, 5, 0];                    // Adjust Strings Starting Note to Notes
    const ROWS = 7;                                                 // 7  Rows: 6 Strings and a Fret Numbering Element
    const COLS = 22;                                                // 21 Columns: 20 Frets and Strings
    const MARG = 40;

    for (let row = 0; row < ROWS; row++) {                          // Iterate Rows
        const rowDOM = $append({ tag: "ul", parent: guitarDOM });   // Create Row Element
        
        for (let col = 0; col < COLS; col++) {                      // Iterate Columns of a Row
            const colDOM = $append({ tag: "li", parent: rowDOM });  // Create Row Element
            colDOM.style.width = fretDistances[col - 1] + "px";
 
            if (row === 6) colDOM.innerHTML = col === 21 ? "Strings": col; // Add Bottom Text
            else {                                                  // If Not Last Row
                if (col == 21) {                                    // Last Column
                    const stringBtn = $append({ tag: "button", parent: colDOM }); // Create String Button
                    stringBtn.innerHTML = stringNames[row] + " String"; // Add String Name as the First Column
                }
                else {                                              // If Fret Note
                    const noteSpan = $append({ tag: "span", className: "fret-note", parent: colDOM });
                    const note = guitarNotes[stringStarts[row] + col]; // Get the Note Name
                    noteSpan.innerHTML = note.replace(/s/g, "#");   // Append Note Text
                    colDOM.classList.add("fret-note");
                }
            }
        }
        if (row < 6) {                                               // Apart from Last Row
            $append({ tag: "div", className: "guitar__string", parent: rowDOM }); // Create String Element
        }
    }
}



// EQUALIZER

// Create Basic Structure of the Equalizer Component
function createEqualizer() {
    const equalizer_DIV = $("#equalizer");

    guitarNotes.forEach(note => {                                    // Iterate Guitar Notes
        const COL_DIV = $append({                                    // Create Column
            tag: "div",
            className: "equalizer__col",
            id: "equalizer__col-" + note,
            parent: equalizer_DIV
        });

        const text = $append({                                       // Add Text Node
            tag: "div",
            className: "equalizer__txt",
            id: "equalizer__txt-" + note,
            parent: COL_DIV
        });
        text.innerHTML = note.replace(/s/g, "#");                    // Add Text and Replace "s" for Sharp to Hashtag

        const BEATS = 32;
        for (let i = 0; i < BEATS; i++) {                            // Create Beat Nodes
            $append({                                                // Add Beat Node
                tag: "div",
                className: "equalizer__beat",
                id: "equalizer__beat-" + note,
                parent: COL_DIV
            }); 
        }
    });
}




function displayActionOnEqualizer(note, start, string) {
    const BEATS = 32;                                     // 32 Beats in a Column
    const highlights = ["green", "blue", "purple", "pink", "orange", "yellow"]
    const noteIndex = guitarNotes.indexOf(note);          // Get Index of the Guitar Note
    const index = noteIndex * BEATS;                      // Find First Beat Element Index
    const runningTimer = app.equalizerTimers[noteIndex];
    if (runningTimer) clearInterval(runningTimer);

    function drawColumn(start, current) {
        for (let i = 0; i < BEATS; i++) {
            const beat_DIV = app.DOM.equalizerBeats_DIV[start + i];

            if (start + i === current) {                          // Current Beat
                beat_DIV.className = "equalizer__beat highlight " + highlights[string - 1];
            }
            else if (start + i < current) {
                beat_DIV.className = "equalizer__beat semi-highlight " + highlights[string - 1];
            }
            else {
                beat_DIV.className = "equalizer__beat";
            }
        }

    }

    if (start) {                                                   // Strum Actions Triggers Beat Animation        
        let counter = 0;                                           // Reset Counter
        app.equalizerTimers[noteIndex] = setInterval(function() {  // Start Interval
            app.equalizer[noteIndex] = index + counter;            // Store the Equaliser on App State
            drawColumn(index, index + counter, string);            // Draw Elements

            if (counter >= 32) {                                   // If Counter Over Flows
                clearInterval(app.equalizerTimers[noteIndex]);     // Delete Interval
                app.equalizerTimers[noteIndex] = null;             // Clear Storage As Well
                return displayActionOnEqualizer(note, false, string);  // Recurse to Down Cycle
            }
            counter++;                                             // Increment Counter
        }, 2000 / BEATS);                                          // 32 Beats in 2 Second
    }
    else {                                                         // If Reverse
        let counter = app.equalizer[noteIndex];                    // Get NoteIndex
        app.equalizerTimers[noteIndex] = setInterval(function() {  // Create Timer
            app.equalizer[noteIndex] = index + counter;            // Reset Equaliser Counter
            drawColumn(index, counter, string);                    // Draw Element

            if (counter < 0) {                                     // If Reached 0
                clearInterval(app.equalizerTimers[noteIndex]);     // Clear Timer
                app.equalizerTimers[noteIndex] = null;             // Reset App State
                return;
            }
            counter--;                                             // Decrement Here
        }, 1);                                                     // 32 Beats Each 1ms
    }
}


