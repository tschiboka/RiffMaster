const app = {
    controllerState: initialiseAppControllerState(),               // Set Inital State and Variables
    DOM: {},                                                       // Store Board and Equaliser Elements for Time Performance
    barIndex: 0,                                                   // Start From Bar 0
    noteIndex: 0,                                                  // Start From Beat 0
    staffNum: 1,                                                   // Number of 6 of Lines (Strings) Displayed Horizontally
    noteTrack: {                                                   // Note Track Information
        dimensions: {                                              // The Number of Rows and Columns of Note Track
            strings: 6,                                            // Tab Always Have 6 Strings
            playedNotes: 50,                                       // Show the Last 50 Notes (Beats) that Played Recently
            upcomingNotes: 50                                      // Show the Next 50 Beats (Current is Excluded)
        }
    }
}

const guitarNotes = ["E2", "F2", "Fs2", "G2", "Gs2", "A2", "As2", "B2", "C3", "Cs3", "D3", "Ds3", "E3", "F3", "Fs3", "G3", "Gs3", "A3", "As3", "B3", "C4", "Cs4", "D4", "Ds4", "E4", "F4", "Fs4", "G4", "Gs4", "A4", "As4", "B4", "C5", "Cs5", "D5", "Ds5", "E5", "F5", "Fs5", "G5", "Gs5", "A5", "As5", "B5", "C6"];
const strumOffsets = [0, 5, 10, 15, 19, 24];

// Find DOM Elements
async function start() {  
    // Get User from Storage
    const storage = $getStorage();
    if (!storage?.user) $redirect("http://127.0.0.1:5501/Frontend/index.html");  

    // Get Tab
    const tabResponse = await getTab();
    app.tab = tabResponse.tab;
    app.tab.bars = JSON.parse(app.tab.content);
    
    // Display Tab
    displayTabSheet(app.tab.bars);
    displayNotesOnTab(app.tab.bars);
    createNoteTrack(app.noteTrack);
    createGuitar();                                                // Create Guitar Simulator Board
    getDOMElements();                                              // Load DOM Elements
    placeNotesOnTrack(app.tab.bars, app.noteTrack);

    // Reset Game Loop Timer
    if (app.gameLoopTimer) clearInterval(app.gameLoopTimer);
    const gameLoopTimer = setInterval(gameLoop, getGameLoopIntervalsInMS()); // Create a Game Loop Interval Function
    app.gameLoopTimer = gameLoopTimer;                             // Globally Available Game Loop Timer

    // Disable Stop and Pause
    const backButtons = $all("#pause, #stop");
    backButtons.forEach(b => b.disabled = true);
}




async function getTab() {
    // Get a Predefined Tab for Testing Purposes
    const tabID = "643ec462e514d909f57d4826";
    try {
        const options = {
            method: 'GET',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        };
        
        const URL = "http://localhost:5000/api/tabs/" + tabID;
        const response = await fetch(URL, options);
        const { success, message, tab } = await response.json();
        return { success, message, tab }
    } catch (ex) { return { success: false, message: ex }; }
}



function getDOMElements() {
    app.DOM.board_LI = [...$all("#guitar li.fret-note")];
    app.DOM.board_SPAN = [...$all("#guitar span.fret-note")];
    app.DOM.board_BTN = [...$all("#guitar button")];
    app.DOM.boardStrings = [...$all(".guitar__string")];
    app.DOM.noteElems = [...$all(".note-track__string")];
}


 
function handleStrumActivated(event, strum) {
    const positions = app.controllerState.highestFretPositions[strum - 1];  // Finger Positions on a String Row
    const upperMost =  positions[positions.length - 1];                     // Topmost Pressed Position
    
    if (event !== 0) {                                                      // Strum Pressed  
        displayActionOnBoard(upperMost, strum, strum, !event);              // Highlight Played Note and String
    }
    else {                                                                  // Strum Released
        if (upperMost === undefined) return;
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
}




function getGameLoopIntervalsInMS() {
    const beatInMS = 60 / app.tab.tempo;                           // How Many Beats In a Second
    const thirtysecondInMS = beatInMS / 8 * 1000;                  // Interval of One Thirtysecondth Note (Shortest Playable Note)
    const gameLoopFreqMs = Math.round(thirtysecondInMS);           // Calculate Loop Frequency in Milli Seconds
    return gameLoopFreqMs;
}



// Note Placement Offsets for Each String
const getNoteDurationInMS = duration => {
    const beat = 60 / app.tempo * 1000;                            // How Many Beats In a Second
    const noteMS = { 
        "w": beat * 4,
        "h": beat * 2,
        "q": beat,
        "e": beat / 2,
        "x": beat / 4,
        "t": beat / 8
     };
    
    const durationSymbol = duration.match(/[whqext]/ig)?.[0];
    const isExtended = /\./ig.test(duration);
    const isLongExtended = /\.\./ig.test(duration);
    if (!durationSymbol) $fullScreenMessage({ 
        headerText: "Tablature Error", 
        content: "Could Not Translate Duration Into a Valid Note Length!<br />" + duration,
        actionButtons: [
            { text: "Back", color, callback: () => $redirect(indexPage) },
            { text: "OK" }
        ]});

    let ms = noteMS[durationSymbol.toLowerCase()];
    const extended1 = isExtended ? ms * 0.5 : 0;
    const extended2 = isLongExtended ?  extended1 * 0.5 : 0;
    return ms + extended1 + extended2;
}



const stringJumps = { E: 0, A: 5, D: 10, G: 15, B: 19, e: 24 };
// Game Loop
function gameLoop() {                                              // Run on Every 32nd Beat
    if (app.play) {                                                // If User Pressed Play Button
        if (app.noteIndex === 0) {
            centerCurrentBarInTab();                               // On First Beat Redraw for Centering Active Bar and Notes
            highlightCurrentBar();                                 // Highlight Current Bar
        }
        highlightCurrentNotes();
        placeNotesOnTrack(app.tab.bars, app.noteTrack);
        scoreBeat();
        
        // Play Tab Notes
        const bar = app.tab.bars[app.barIndex];
    
         app.noteIndex++;                                  
        // Increment Bar and Beat
        const MAXBEAT = 32;                                        // 32 Notes in a Bar
        if (app.noteIndex === MAXBEAT) {                           // If Maximum Reached
            app.noteIndex = 0;                                     // Reset Note
            app.barIndex++;                                        // Increment Bar Index

            if (app.barIndex >= app.tab.bars.length) {             // If No More Bars to Play
                play(true);                                 // Pause
                    app.barIndex = 0;                              // Reset Bar Index
                    app.noteIndex = 0;                             // Reset Note Index
            }
        }
    }
}



// Toggle Play and Pause Buttons
function play(pause = false) {
    if (app.tab.bars.length === 0) return;
    const playBtn = $("#play");                                    // Get Play Button
    const pauseBtn = $("#pause");                                  // Get Pause Button

    if (!pause) {                                                  // If Game is Not Paused
        let countDownState = 3;
        const countDownTimer = setInterval(() => {
            if (countDownState > 0) console.log(countDownState--);
            else {
                clearInterval(countDownTimer);
            }
        }, 1000);
        
        app.play = true;                                           // Set Play
        playBtn.disabled = true;                                   // Disable Play Button
        pauseBtn.disabled = false;                                 // Enable Pause Button
        displayNotesOnTab(app.tab.bars);                               
        $("#stop").disabled = false;          
    }
    else {                                                         // If Pause Pressed
        app.play = false;                                          // Unset Play
        playBtn.disabled = false;                                  // Enable Play Button
        pauseBtn.disabled = true;                                  // Disable Pause Button
        $("#stop").disabled = true;          
    }
}




function stopPlaying() {
    play(true);
    clearTabStyling();
    app.barIndex = 0;
    app.noteIndex = 0;
    centerCurrentBarInTab();
    highlightCurrentBar();                                 // Highlight Current Bar
    highlightCurrentNotes();
    createNoteTrack(app.noteTrack);
    placeNotesOnTrack(app.tab.bars, app.noteTrack);
}



// Center the Cursor on the Screen for an Improved UX
function centerCurrentBarInTab() {
    const totalBars = app.staffNum * app.barsInTabLine;            // Get the Total Number of Displayable Bars 
    const overHalfLine = app.barIndex > totalBars / 2;             // If Current Bar is Over the Half of the Possible Bars
    let from = 0;

    if (overHalfLine) {                                            // Redraw Tab if Offset
        if (app.staffNum === 1) {                                  // If Only One Row id Displayed Move Left
            from = app.barIndex - Math.floor(totalBars / 2);       // Calculate From Which Bar Should the Tab Display
        }
        else {                                                     // If Multiline Tab Sheet
            from = app.barIndex - Math.floor(totalBars / 2);       // Calculate From Which Bar Should the Tab Display

            if (from > app.tab.bars.length - totalBars) {
                from = app.tab.bars.length - totalBars;            // For Multiline Don't Let Empty Bars Appear
                if (from < 0) from = 0;
           }
        }
    }
    displayNotesOnTab(app.tab.bars, from);
}



// Find Bar with the Current Bar Index and Highlight it
function highlightCurrentBar() {
    let index = app.barIndex + 1;                                // Get Index (DOM Display Starts with Number 1)
    if (index < 1) index = 0;

    const barNumberDiv = $(`#bar-number-${ index }`);              // Get Number Div with Bar Number
    const highlightedBar = barNumberDiv.closest(".bar");           // Get the Bar Parent
    highlightedBar.classList.add("highlight");                     // Highlight Parent
    app.highlightedBar = highlightedBar;
}



function highlightCurrentNotes() {                                 
    const index = app.noteIndex;                                   // Get Current Note Index
    const barID = app.highlightedBar.id;                           // Get Highlighted Bar ID
    
    // Take Off Previous Highlights
    const prevNoteElems = [...$all(`.bar .highlight`)];
    if (prevNoteElems.length) 
        prevNoteElems.forEach(e => e.classList.remove("highlight"));
    
    
    const noteElems = [...$all(`#${ barID } .note-${ index }.beat`)];
    noteElems.forEach(e => e.classList.add("highlight"));
}




function createNoteTrack(noteTrack) {
    const noteTrackElem = $("#note-track");                         // Get Track
    noteTrackElem.innerHTML = "";                                   // Clear Track
    
    const STRING_NUM = noteTrack.dimensions.strings;                // Six Strings on the Guitar
    const PREV_BEATS = noteTrack.dimensions.playedNotes;            // Show a Predefined Number of Played Notes (Beats)
    const NEXT_BEATS = noteTrack.dimensions.upcomingNotes;          // Show a Predefined Number of Next Notes (Beats)
    const totalBeats = PREV_BEATS + 1 + NEXT_BEATS;                 // Add Current Beat to the Total
    
    for (let string_i = 0; string_i < STRING_NUM; string_i++) {     // Iterate Strings to Add a Line for Strings
        $append({                                                   // Append String Element
            tag: "div",
            id: `note-track__string-line-${ string_i }`,
            className: "note-track__string-line",
            parent: noteTrackElem
        }); 
    }

    for (let beat_i = 0; beat_i < totalBeats; beat_i++) {           // Iterate Beats
        const beatElem = $append({                                  // Add Beat Element
            tag: "div",
            id: "note-track__beat-" + beat_i,
            className: "note-track__beat",
            parent: noteTrackElem
        });
        for (let string_i = 0; string_i < STRING_NUM; string_i++) {
            const stringElem = $append({                            // Append String Element
                tag: "div",
                id: `note-track__beat-${ beat_i }-string-${ string_i }`,
                className: "note-track__string",
                parent: beatElem
            }); 
        }
    }
}


/*
 Transform Original Bar Strings to a More Suitable Format
 Original Example: 
    [
        [ "A2,e0:16:Q", "e2:20:E"],
        [ "e3:16:E" ]
    ]
  Transformed:
    [
        [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, { notes: ["A2", "e0"], duration: 16 }, {}, {}, {}, { notes: ["e3"], duration: 32 }, {}, {} ... ]
        ...
    ]
  This Way We Do Not Need to Deconstruct and Search for Notes in 
  Every Iteration of Track Display
*/
 
function transformBars(bars) {
    const durationsInUnits = [
        { name: "W..", duration: 32 + 16 + 8 },
        { name: "W.", duration: 32 + 16 },
        { name: "W", duration: 32 },
        { name: "H..", duration: 16 + 8 + 4 },
        { name: "H.", duration: 16 + 8 },
        { name: "H", duration: 16 },
        { name: "Q..", duration: 8 + 4 + 2 },
        { name: "Q.", duration: 8 + 4 },
        { name: "Q", duration: 8 },
        { name: "E..", duration: 4 + 2 + 1 },
        { name: "E.", duration: 4 + 2 },
        { name: "E", duration: 4 },
        { name: "X..", duration: 4 },
        { name: "X.", duration: 3 },
        { name: "X", duration: 2 },
        { name: "T..", duration: 2 },
        { name: "T.", duration: 1 },
        { name: "T", duration: 1 },
    ];
    
    const transformedBars = [];
    bars.forEach(bar => {
        const barContent = new Array(32).fill(undefined);
        bar.forEach(beatContent => {
            const [ notes, beatIndex, duration, _ ] = beatContent.split(":");
            const durationUnit = durationsInUnits.find(d => d.name === duration).duration;
            const beat = {
                notes: notes.split(","),
                duration: durationUnit,
            };
            barContent[beatIndex] = beat;
        });
        transformedBars.push(barContent);
    });
    return transformedBars;
}




// Function Builds a Table from the Transformed Bar List
// This Will be Stored in the App State for Checking If User Strummed the Right Note at the Right Time
// And Will be Used to Create the Notes on the Note Track
// EG: a A Minor Quarter Chord, a Quarter Rest and an E Major Quarter Chord Looks Like the Following
// [
//  [ 0, 0, 0, 0, 0, 0, 0, 0, , , , , , , , , 0, 0, 0, 0, 0, 0, 0, 0 ]
//  [ 1, 1, 1, 1, 1, 1, 1, 1, , , , , , , , , 0, 0, 0, 0, 0, 0, 0, 0 ]
//  [ 2, 2, 2, 2, 2, 2, 2, 2, , , , , , , , , 1, 1, 1, 1, 1, 1, 1, 1 ]
//  [ 2, 2, 2, 2, 2, 2, 2, 2, , , , , , , , , 2, 2, 2, 2, 2, 2, 2, 2 ]
//  [ 0, 0, 0, 0, 0, 0, 0, 0, , , , , , , , , 2, 2, 2, 2, 2, 2, 2, 2 ]
//  [  ,  ,  ,  ,  ,  ,  ,  , , , , , , , , , 0, 0, 0, 0, 0, 0, 0, 0 ]
//]

function placeNotesOnTrack(unformattedBars, noteTrack) {
    app.transformedBars = transformBars(unformattedBars);           // Transform Bar for a More Efficient Structure
    const bars = app.transformedBars;                               // Create Short Variable to Reference it in the Fucntion

    // Read Bars and Create an Empty Track Map Structure
    const STRING_NUM = noteTrack.dimensions.strings;                // Six Strings on the Guitar
    const PREV_BEATS = noteTrack.dimensions.playedNotes;            // Show a Predefined Number of Played Notes (Beats)
    const NEXT_BEATS = noteTrack.dimensions.upcomingNotes;          // Show a Predefined Number of Next Notes (Beats)
    const BEAT_NUM = 32;                                            // 32 Beats in a Bar
    const totalBeats = PREV_BEATS + 1 + NEXT_BEATS;                 // Add Current Beat to the Total
    const { barIndex, noteIndex } = { ...app };                     // Extract Note and Bar Index from App State
    const noteTrackMap = [];                                        // Create an Empty Array for the Map
    const stringIndexMap = { E: 5, A: 4, D: 3, G: 2, B: 1, e: 0 };  // Get Index from Letters
    for (let i = 0; i < STRING_NUM; i++) {                          // Iterate the Strings
        noteTrackMap.push(new Array(totalBeats).fill(undefined));   // Filled with an Array of Undefined with the Length of the Track
    }
    
    // Fill Up Track Map
    for (let i = 0 - PREV_BEATS; i <= NEXT_BEATS; i++ ) {           // Iterate Relative Index Numbers From Negative EG: -50 to 50
        const relativeBarIndex = Math.floor(i / BEAT_NUM);          // Get the Bar Index Relative to the Current Bar
        let absoluteBarIndex = barIndex + relativeBarIndex;         // Get the Absolute Bar Indexing
        let absoluteNoteIndex = Math.abs(i % BEAT_NUM >= 0          // Get the Absolute Index of Notes
            ? i % BEAT_NUM                                          // Positive is the Remainder of Beat Numbers
            : BEAT_NUM + (i % BEAT_NUM));                           // Negative Values Should Be Taken From the Back
        absoluteNoteIndex += noteIndex;                             // Add Current Note Index to Show Note Incrementations As Well
        if (absoluteNoteIndex >= BEAT_NUM) {                        // Do Not Let Array Out of Boundaries
            absoluteNoteIndex -= BEAT_NUM;                          // Correct Note Indexing If Over Boundary
            absoluteBarIndex++;                                     // Incerment Barindex to Get the Correct Note
        }
        if (absoluteBarIndex < 0 || absoluteBarIndex > bars.length - 1) continue; // Absolute Bar Index Must Be Positive
        const beat = bars[absoluteBarIndex][absoluteNoteIndex];     // Get the Beat from the Bars
        if (!beat) continue;                                        // Skip to the Next If Beat Could Not be Found

        const duration = beat.duration;                             // Get the Duration of the Notes
        beat.notes.forEach(note => {                                // Iterate Beat Notes
            const stringName = note.match(/^[A-Z]/i)[0];            // Get String Name of the Note
            const fretNumber = Number(note.match(/\d+$/g)[0]);      // Get Fret Number of the Note
            const stringIndex = stringIndexMap[stringName];         // Get the String Index by the String Name
            const indexOnMap = i + PREV_BEATS;                      // The Note Position on the Note Track Map
            
            for (let d = 0; d < duration; d++) {                    // Look Ahead and Fill Up Positions On the Map
                if (indexOnMap + d > totalBeats - 1) continue;      // Do Not Let Indices Out of the Boundary of Note Track Map
                const isStartOfNote = d === 0;                      // Get the First Note Item for Marking
                const isEndOfNote = d === duration - 1;             // Get the Last Note Item for Marking
                let mapStr = "";                                    // Initial String
                if (isStartOfNote) mapStr += "<";                   // Add Start Mark
                mapStr += fretNumber;                               // Add Fret Number
                if (isEndOfNote) mapStr += ">";                     // Add End Mark
                noteTrackMap[stringIndex][indexOnMap + d] = mapStr; // Add the Fret Position to the Index
            }
        });
    }

    // Display Notes Based on String Map
    const colors = ["yellow", "orange", "red", "purple", "blue", "green"];  // Colour Scheme
    app.noteTrackMap = noteTrackMap;                                // Save or Update Map for Reference in Game Loop
    for (let string_i = 0; string_i < STRING_NUM; string_i++) {     // Iterate Strings
        for (let beat_i = 0; beat_i < totalBeats; beat_i++) {       // Iterate Notes
            const id = `#note-track__beat-${ beat_i }-string-${ string_i }`; // Create the Index String for the DOM Element
            const noteElem = $(id);                                 // Get the DOM Element with ID
            
            const mapPosition = noteTrackMap[string_i][beat_i];     // Get Element with Position
            noteElem.classList.remove(...noteElem.classList);       // Remove All Classes
            noteElem.classList.add("note-track__string");           // Add Back Original Class Name
            noteElem.innerHTML = "";                                // Delete Text Content
            if (mapPosition === undefined) continue;                // Next Iteration If No Item on Map Position 
            
            const isStartOfNote = mapPosition[0] === "<";           // Decide If Beat is The Beggining of a Note Press
            const isEndOfNote = mapPosition[mapPosition.length - 1] === ">"; // Decide If Beat is The End of a Note Press
            const fretNumber = mapPosition.match(/\d+/g)[0];        // Get Fret Number from Map
            if (isStartOfNote) {                                    // Start Notes Look Different
                noteElem.innerHTML = fretNumber;                    // Add Fret Number for Starter Notes
                noteElem.classList.add("start");                    // Add Special Class to Them
            }
            if (isEndOfNote) noteElem.classList.add("end");         // End Notes Look Different As Well
            if (beat_i < PREV_BEATS) noteElem.classList.add("prev");// Dim Played Notes
            if (beat_i === PREV_BEATS) noteElem.classList.add("current"); // Highlight Actual Note
            noteElem.classList.add("active");                       // Add Activated to Show Note on Track
            noteElem.classList.add(colors[string_i]);               // Add Colour Class
        }
    }
}



function scoreBeat() {
    console.log("SCORE HERE")
    console.log(app)
    console.log(app.controllerState.highestFretPositions)
}



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



// function placeNotesOnTrack(unformattedBars, noteTrack) {
//     console.log("********************")
//     app.transformedBars = transformBars(unformattedBars);           // Transform Bar for a More Efficient Structure
//     console.log(app.transformedBars);
//     const bars = app.transformedBars;                               // Create Short Variable to Reference it in the Fucntion

//     // Read Bars and Create an Empty Track Map Structure
//     const STRING_NUM = noteTrack.dimensions.strings;                // Six Strings on the Guitar
//     const PREV_BEATS = noteTrack.dimensions.playedNotes;            // Show a Predefined Number of Played Notes (Beats)
//     const NEXT_BEATS = noteTrack.dimensions.upcomingNotes;          // Show a Predefined Number of Next Notes (Beats)
//     const BEAT_NUM = 32;                                            // 32 Beats in a Bar
//     const totalBeats = PREV_BEATS + 1 + NEXT_BEATS;                 // Add Current Beat to the Total
//     const { barIndex, noteIndex } = { ...app };                     // Extract Note and Bar Index from App State
//     const noteTrackMap = [];                                        // Create an Empty Array for the Map
//     const stringIndexMap = { E: 5, A: 4, D: 3, G: 2, B: 1, e: 0 };  // Get Index from Letters
//     for (let i = 0; i < STRING_NUM; i++) {                          // Iterate the Strings
//         noteTrackMap.push(new Array(totalBeats).fill(undefined));   // Filled with an Array of Undefined with the Length of the Track
//     }
    
//     // Fill Up Track Map
//     for (let i = 0 - PREV_BEATS; i <= NEXT_BEATS; i++ ) {   // Iterate Relative Index Numbers From Negative EG: -50 to 50
//         const relativeBarIndex = Math.floor(i / BEAT_NUM);          // Get the Bar Index Relative to the Current Bar
//         const absoluteBarIndex = barIndex + relativeBarIndex;       // Get the Absolute Bar Indexing
//         const absoluteNoteIndex = Math.abs(i % BEAT_NUM >= 0        // Get the Absolute Index of Notes
//             ? i % BEAT_NUM                                          // Positive is the Remainder of Beat Numbers
//             : BEAT_NUM + (i % BEAT_NUM));                           // Negative Values Should Be Taken From the Back
//         console.log(relativeBarIndex, absoluteBarIndex, absoluteNoteIndex);
//         if (absoluteBarIndex < 0 || absoluteBarIndex > bars.length - 1) continue; // Absolute Bar Index Must Be Positive
//         const beat = bars[absoluteBarIndex][absoluteNoteIndex];     // Get the Beat from the Bars
//         if (!beat) continue;                                        // Skip to the Next If Beat Could Not be Found

//         const duration = beat.duration;                             // Get the Duration of the Notes
//         beat.notes.forEach(note => {                                // Iterate Beat Notes
//             const stringName = note.match(/^[A-Z]/i)[0];            // Get String Name of the Note
//             const fretNumber = Number(note.match(/\d+$/g)[0]);      // Get Fret Number of the Note
//             const stringIndex = stringIndexMap[stringName];         // Get the String Index by the String Name
//             const indexOnMap = i + PREV_BEATS;                      // The Note Position on the Note Track Map
            
//             for (let d = 0; d < duration; d++) {                    // Look Ahead and Fill Up Positions On the Map
//                 if (indexOnMap + d > totalBeats - 1) continue;      // Do Not Let Indices Out of the Boundary of Note Track Map
//                 const isStartOfNote = d === 0;                      // Get the First Note Item for Marking
//                 const isEndOfNote = d === duration - 1;             // Get the Last Note Item for Marking
//                 let mapStr = "";                                    // Initial String
//                 if (isStartOfNote) mapStr += "<";                   // Add Start Mark
//                 mapStr += fretNumber;                               // Add Fret Number
//                 if (isEndOfNote) mapStr += ">";                     // Add End Mark
//                 noteTrackMap[stringIndex][indexOnMap + d] = mapStr; // Add the Fret Position to the Index
//             }
//         });
//     }

//     // Display Notes Based on String Map
//     const colors = ["yellow", "orange", "red", "purple", "blue", "green"];  // Colour Scheme
//     app.noteTrackMap = noteTrackMap;                                // Save or Update Map for Reference in Game Loop
//     for (let string_i = 0; string_i < STRING_NUM; string_i++) {     // Iterate Strings
//         for (let beat_i = 0; beat_i < totalBeats; beat_i++) {       // Iterate Notes
//             const id = `#note-track__beat-${ beat_i }-string-${ string_i }`; // Create the Index String for the DOM Element
//             const noteElem = $(id);                                 // Get the DOM Element with ID
            
//             const mapPosition = noteTrackMap[string_i][beat_i];     // Get Element with Position
//             noteElem.classList.remove(...noteElem.classList);       // Remove All Classes
//             noteElem.classList.add("note-track__string");           // Add Back Original Class Name
//             noteElem.innerHTML = "";                                // Delete Text Content
//             if (mapPosition === undefined) continue;                // Next Iteration If No Item on Map Position 
            
//             const isStartOfNote = mapPosition[0] === "<";           // Decide If Beat is The Beggining of a Note Press
//             const isEndOfNote = mapPosition[mapPosition.length - 1] === ">"; // Decide If Beat is The End of a Note Press
//             const fretNumber = mapPosition.match(/\d+/g)[0];        // Get Fret Number from Map
//             if (isStartOfNote) {                                    // Start Notes Look Different
//                 noteElem.innerHTML = fretNumber;                    // Add Fret Number for Starter Notes
//                 noteElem.classList.add("start");                    // Add Special Class to Them
//             }
//             if (isEndOfNote) noteElem.classList.add("end");         // End Notes Look Different As Well
//             noteElem.classList.add("active");                       // Add Activated to Show Note on Track
//             noteElem.classList.add(colors[string_i]);               // Add Colour Class
//         }
//     }
// }
