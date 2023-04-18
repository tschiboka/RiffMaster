/* 
    Tabs are Read from a Source and Translated into a Tab Object.
    Tab Object's Syntax Discription:
        title:     The Title of the Song,
        band:      Band Name,
        tempo: Beat per Second (120 Default)
        bars:      An Array of Bar (4 * 4th Beat of Notes)
        
    One Bar Consists of 32 Notes (Fastest Beat Represented is a 1/32)
    A 32nd Note Beat Syntax Description:
        "Notes:Duration:Chord"
        Notes:     String Char (E|A|D|G|B|e) and Fret Number | Empty String
        Duration:  N of 32nd
        Chord:     Chord Name (Em7, G#, ...)
*/



// Initial Application State
const app = {
    title: undefined,                                              // Title Initially Undefined
    band: undefined,                                               // Band Initially Undefined
    tempo: 120,                                                    // Beat per Minute
    play: false,                                                   // Play May be Set True By the User
    barIndex: 0,                                                   // Start From Bar 0
    noteIndex: 0,                                                  // Start From Beat 0
    staffNum: 3,                                                   // Number of 6 of Lines (Strings) Displayed Horizontally
    metronomeAudio: null,                                          // Will Hold the Howler Object for Metronome
    metronomeVolume: 0.2,                                          // Metronome on Low Volume by Default
    metronomeIsOn: true,                                           // Default Metronome
    tab: null,                                                     // Save Tab Here
    tabEditingEnabled: false,                                      // User Cannot Change the Content of the Tablature
    tabHistoryStack: [],                                           // History for Undo Feature
    repeatAllowed: false,                                          // Allow Users to Repeat a Section or the Whole Tab
    isRecordAllowed: false,                                        // Allow RiffMaster Console as a Tab Input
    controllerState: initialiseAppControllerState(),               // Set Inital Controller State and Variables
    unfinalisedNotes: [],                                          // Store Strums that Has Not Yet Been Finalised (Record Playing)
}



// Temporary Here (This Will Be Dynamically Loaded)
let tab = {
    title: "Untitled",
    band: "No Band",
    tempo: 120,
    bars: [
        []
        // [   
        //     "E0,A2,D2:0:Q..:E5",
        // ],
        // [
        //     "E10,A12:0:Q:D5",
        //     "E9,A11:8:Q:C#5",
        //     "E8,A10:16:W:C5",
        // ],
        // [],
        // [
        //     "E0:0:E",
        //     "E0:3:E",
        //     "E12:7:E",
        //     "E0:11:E",
        //     "E0:15:E",
        //     "E11:19:E",
        //     "E0:23:E",
        //     "E0:27:E",
        // ],
        // [
        //     "E10,A12:0:Q:D5",
        //     "E9,A11:8:Q:C#5",
        //     "E8,A10:16:W:C5",
        // ],
        // [
        //     "E0:0:E",
        //     "E0:3:E",
        //     "E7:7:E",
        //     "E0:11:E",
        //     "E0:15:E",
        //     "E6:19:E",
        //     "E0:23:E",
        //     "E0:27:E",
        // ],
        // [
        //     "E5:0:E",
        //     "E0:3:E",
        //     "E4:7:E",
        //     "E0:11:E",
        //     "E3:15:E",
        //     "E0:19:E",
        //     "E2:23:E",
        //     "E0:27:E",
        // ],
        // [
        //     "E0:0:E",
        //     "E0:3:E",
        //     "E12:7:E",
        //     "E0:11:E",
        //     "E0:15:E",
        //     "E11:19:E",
        //     "E0:23:E",
        //     "E0:27:E",
        // ],
        // [
        //     "E10,A12:0:Q:D5",
        //     "E9,A11:8:Q:C#5",
        //     "E8,A10:16:W:C5",
        // ],
        // [
        //     "E0:0:E",
        //     "E0:3:E",
        //     "E7:7:E",
        //     "E0:11:E",
        //     "E0:15:E",
        //     "E6:19:E",
        //     "E0:23:E",
        //     "E0:27:E",
        // ],
        // [
        //     "E5:0:E",
        //     "E0:3:E",
        //     "E4:7:E",
        //     "E0:11:E",
        //     "E3:15:E",
        //     "E0:19:E",
        //     "E2:23:E",
        //     "E0:27:E",
        // ],
        // [
        //     "E0:0:E",
        //     "E1:3:E",
        //     "A2:7:E",
        //     "E0:11:E",
        //     "E1:15:E",
        //     "A3:19:E",
        //     "E0:23:E",
        //     "E1:27:E",
        // ],
        // [
        //     "A4:0:E",
        //     "E0:3:E",
        //     "E2:7:E",
        //     "A3:11:E",
        //     "E0:15:E",
        //     "E2:19:E",
        //     "A2:23:E",
        //     "A2:27:E",
        // ],
        // [
        //     "E0:0:E",
        //     "E1:3:E",
        //     "A2:7:E",
        //     "E0:11:E",
        //     "E1:15:E",
        //     "A3:19:E",
        //     "E0:23:E",
        //     "E1:27:E",
        // ],
        // [
        //     "E3,A5:0:E:G5",
        //     "E2,A4:3:E:F#5",
        //     "E3,A5:11:E:G5",
        //     "E2,A4:15:E:F#5",
        //     "E3,A5:23:E:G5",
        //     "E2,A4:27:E:F#5",
        // ],
    ]
}



// Set Application State and Load Tablature
function start() {
    const storage = $getStorage();
    if (!storage?.user) $redirect("http://127.0.0.1:5501/Frontend/index.html");
    app.musicAgreement = true;                                     // Temporary Solution

    // LOAD TAB!!!!!!!!!!!!
    app.tab = app.tab || tab;                                      // Set Tab
    const validTab = validateTabFormatting(app.tab);               // Only Validated Tabs Can Be Displayed
    if (!validTab) return;
    saveHistory();                                                 // Start History

    app.title = app.tab.title;                                     // Set Title
    app.band = app.tab.band;                                       // Set Band
    app.tempo = app.tab.tempo;                                     // Set Tempo
    
    
    setTabTitle(app.tab);                                          // Place Title and Band on Page
    displayTabSheet(app.tab, app.staffNum, true);                  // Display an Empty Tab Sheet
    displayNotesOnTab(app.tab.bars);                               // Display Notes on the Tab Sheet (from Bar 0)
    tab = undefined;
    
    // Reset Game Loop Timer
    if (app.gameLoopTimer) clearInterval(app.gameLoopTimer);
    const gameLoopTimer = setInterval(gameLoop, getGameLoopIntervalsInMS()); // Create a Game Loop Interval Function
    app.gameLoopTimer = gameLoopTimer;                             // Globally Available Game Loop Timer

    const backButtons = $all("#fast-backward, #backward, #stop");
    if (app.barIndex < 0) backButtons.forEach(b => b.disabled = true);

    updateTabIndexInfo();
    
}



// Audio Functions
function playNote(note, string) { app.audio[note].play(); }
function stopNote(note) { app.audio[note].stop(); }
const guitarNotes = ["E2", "F2", "Fs2", "G2", "Gs2", "A2", "As2", "B2", "C3", "Cs3", "D3", "Ds3", "E3", "F3", "Fs3", "G3", "Gs3", "A3", "As3", "B3", "C4", "Cs4", "D4", "Ds4", "E4", "F4", "Fs4", "G4", "Gs4", "A4", "As4", "B4", "C5", "Cs5", "D5", "Ds5", "E5", "F5", "Fs5", "G5", "Gs5", "A5", "As5", "B5", "C6"];



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



const getRepeatValues = () => {
    let from = Number(document.querySelector("#repeat-from").value);
    let to = Number(document.querySelector("#repeat-to").value);
    
    if (isNaN(from) || from < 1 || !Number.isInteger(from)) from = 1;
    if (isNaN(to) || to < 1 || !Number.isInteger(to)) to = app.tab.bars.length;

    return { from, to };
}



const stringJumps = { E: 0, A: 5, D: 10, G: 15, B: 19, e: 24 };
// Game Loop
function gameLoop() {                                              // Run on Every 32nd Beat
    if (app.play) {                                                // If User Pressed Play Button
        updateTabIndexInfo();
        if (app.noteIndex === 0) {
            centerCurrentBarInTab();                               // On First Beat Redraw for Centering Active Bar and Notes
            highlightCurrentBar();                                 // Highlight Current Bar

            const backButtons = $all("#fast-backward, #backward");
            backButtons.forEach(b => b.disabled = true);
            const foreButtons = $all("#fast-forward, #forward");
            foreButtons.forEach(b => b.disabled = true);
        }
        highlightCurrentNotes();
        
        // Play Tab Notes
        const bar = app.tab.bars[app.barIndex];
        bar.forEach((note, noteIndex) => { 
            const [ noteStr, start, duration] = note.split(":");
            
            if (start == app.noteIndex) {
                const indNotesElem = $("#current-note");
                indNotesElem.innerHTML = noteIndex + 1;
                
                noteStr.split(",").forEach(n => {
                    const letter = n.match(/[a-z]/gi)[0];
                    const number = n.match(/[0-9]+/gi)[0];
                    const offSet = stringJumps[letter];
                    const audioIndex = Number(number) + Number(offSet);
                    const audioName = guitarNotes[audioIndex];
                    playNote(audioName);
                    
                    const durationMS = getNoteDurationInMS(duration);
                    const noteTimer = setTimeout(() => {
                        stopNote(audioName);
                        clearTimeout(noteTimer);
                    }, durationMS);
                });
            }
        });

        // Metronome for Every Beat
        if (app.noteIndex % 8 === 0) {                             // Every 8 32nd Note
            if (app.metronomeIsOn) {
                app.metronomeAudio.volume(app.metronomeVolume);        // Set Metronome Volume
                app.metronomeAudio.play();                             // Play Metronome
            }
        }

        app.noteIndex++;                                  
        // Increment Bar and Beat
        const MAXBEAT = 32;                                        // 32 Notes in a Bar
        if (app.noteIndex === MAXBEAT) {                           // If Maximum Reached
            app.noteIndex = 0;                                     // Reset Note
            app.barIndex++;                                        // Increment Bar Index

            let { from, to } = getRepeatValues();
            if (app.barIndex >= to)
            if (app.repeatAllowed) app.barIndex = from - 1;        // Reset Bar Index
            app.noteIndex = 0;                                     // Reset Note Index

            if (app.barIndex >= app.tab.bars.length) {             // If No More Bars to Play
                if (app.isRecordAllowed) app.tab.bars.push([]);    // Always Append Tab While Recording
                // Stop or Repeat at the End
                else if (!app.repeatAllowed) {
                    playTab(true);                                 // Pause
                    app.barIndex = 0;                              // Reset Bar Index
                    app.noteIndex = 0;                             // Reset Note Index
                }
                else {
                    app.barIndex = from - 1;                       // Reset Bar Index
                    app.noteIndex;                                 // Reset Note Index
                    console.log(from, $("#repeat-from"))
                }
            }
        }
    }
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



// Toggle Play and Pause Buttons
function playTab(pause = false) {
    if (app.tab.bars.length === 0) return;
    const metronomeAudio = new Howl({ src: ["../../sounds/metronome.mp3"] }); // Get Metronome Audio
    if (!app.metronomeAudio) app.metronomeAudio = metronomeAudio;  // Set Metronome Audio If Not Set Yet
    if (!app.audio) app.audio = getAudio();
    const playBtn = $("#play");                                    // Get Play Button
    const pauseBtn = $("#pause");                                  // Get Pause Button

    if (!pause) {                                                  // If Game is Not Paused
        app.play = true;                                           // Set Play
        playBtn.disabled = true;                                   // Disable Play Button
        pauseBtn.disabled = false;                                 // Enable Pause Button
        displayNotesOnTab(app.tab.bars);                               
        disableTabEditing();
        const buttons = $all("#function-buttons button");          // Get Function Buttons
        buttons.forEach(b => b.disabled = true);                   // Disable Every Function Button
        $("#stop").disabled = false;          
        $("#record").disabled = true;          
        const stepBtns = $all("#forward, #fast-forward, #backward, #fast-backward");          // Get Function Buttons
        stepBtns.forEach(b => b.disabled = true);                  // Disable 
    }
    else {                                                         // If Pause Pressed
        app.play = false;                                          // Unset Play
        playBtn.disabled = false;                                  // Enable Play Button
        pauseBtn.disabled = true;                                  // Disable Pause Button
        const buttons = $all("#function-buttons button");          // Get Function Buttons
        buttons.forEach(b => b.disabled = false);                  // Enable Every Function Button
        $("#stop").disabled = true;          
        $("#record").disabled = false;          
        const stepBtns = $all("#forward, #fast-forward, #backward, #fast-backward");          // Get Function Buttons
        stepBtns.forEach(b => b.disabled = false);                  // Disable 
    }
}



function setTempo() {
    const message = $append({ tag: "div", className: "message", parent: $("body") });         // Append Body with Message Div
    const messageBox = $append({ tag: "div", className: "message__box", parent: message });   // Append Message Box Div
    const header = $append({ tag: "div", className: "message__header", parent: messageBox }); // Append Message Box Div
    header.innerHTML = "Set Tempo";                                // Set Header Text
    header.style.color = "white";                                  // Set Header Color
    const content = "The music sheet's tempo may be set for a different tempo. The tempo measurement is in BPM (Beat per Minute), and its value must be between 20 and 300.";
    const messageContent = $append({ tag: "p", parent: messageBox });                         // Append Message Box Div
    messageContent.innerHTML = content;                            // Set Message Content Text

    const input = $append({ tag: "input", id:"tempo-input", className: "input", parent: messageBox });  // Append Message Action Button Box Div
    input.placeholder = app.tab.tempo + " BPM";


    // Buttons
    const buttonBox = $append({ tag: "div", className: "button__box", parent: messageBox });  // Append Message Action Button Box Div
    const messageButton = $append({ tag: "button", parent: buttonBox }); // Append Message Box Div
    messageButton.innerHTML = "OK";                                // Set Button Text
    messageButton.style.color = "springgreen"; 
    messageButton.addEventListener("click", () => {
        const value = $("#tempo-input").value;
        if (!isNaN(value) && value >= 20 && value <= 300) app.tab.tempo = Number(value);
        setTabTitle(app.tab);
        clearInterval(app.gameLoopTimer);
        const gameLoopTimer = setInterval(gameLoop, getGameLoopIntervalsInMS()); // Create a Game Loop Interval Function
        app.gameLoopTimer = gameLoopTimer;                             // Globally Available Game Loop Timer
        $("body").removeChild(message);
    });  
}



function setTitleAndAuthor() {
    const message = $append({ tag: "div", className: "message", parent: $("body") });         // Append Body with Message Div
    const messageBox = $append({ tag: "div", className: "message__box", parent: message });   // Append Message Box Div
    const header = $append({ tag: "div", className: "message__header", parent: messageBox }); // Append Message Box Div
    header.innerHTML = "Set Title and Author";                                // Set Header Text
    header.style.color = "white";                                  // Set Header Color
    const content = "Author or Band Property May Be Left Empty.";
    const messageContent = $append({ tag: "p", parent: messageBox });                         // Append Message Box Div
    messageContent.innerHTML = content;                            // Set Message Content Text

    const titleInput = $append({ tag: "input", id:"title-input", className: "input", parent: messageBox });  // Append Message Action Button Box Div
    titleInput.placeholder = app.tab.title;

    const authorInput = $append({ tag: "input", id:"band-input", className: "input", parent: messageBox });  // Append Message Action Button Box Div
    authorInput.placeholder = app.tab.band;


    // Buttons
    const buttonBox = $append({ tag: "div", className: "button__box", parent: messageBox });  // Append Message Action Button Box Div
    const messageButton = $append({ tag: "button", parent: buttonBox }); // Append Message Box Div
    messageButton.innerHTML = "OK";                                // Set Button Text
    messageButton.style.color = "springgreen"; 
    messageButton.addEventListener("click", () => {
        const title = $("#title-input").value;
        const band = $("#band-input").value;
        if (title) app.tab.title = title;
        app.tab.band = band;
        setTabTitle(app.tab);
        
        $("body").removeChild(message);
    });  
}




function toggleTabEditing() { 
    app.tabEditingEnabled = !app.tabEditingEnabled;                // Toggle Editing Flag
    if (app.tabEditingEnabled) enableTabEditing();
    else disableTabEditing();
}



function enableTabEditing() {
    // Highlight Button
    const button = $("#edit-button .btn-switch-light");
    if (!button.classList.contains("active")) button.classList.add("active"); // Do Not Add Class Multiple Times Accidentally
    
    // Tab Cursor Magnifier
    const tabSheet = $("#tab-sheet");
    if (!tabSheet.classList.contains("edit-enabled")) tabSheet.classList.add("edit-enabled"); // Do Not Add Class Multiple Times Accidentally
    
    button.disabled = false;
}



function disableTabEditing() {
    const button = $("#edit-button .btn-switch-light");
    button.classList.remove("active");

    const tabSheet = $("#tab-sheet");
    tabSheet.classList.remove("edit-enabled");
}



function getBeatInfoForEditing(event) {
    const elem = event.target;
    const rect = elem.getBoundingClientRect();
    const from = app.barIndex;
    const [ row, bar, beat] = elem.id.match(/\d+/g);
    const string = elem.id.match(/string\w/g)[0].replace("string", "");
    const barElem = elem.closest(".bar");
    const barNumElem = barElem.querySelector(".bar-number");
    const index = Number(barNumElem.id.replace("bar-number-", "")) - 1;
    const barInfo = app.tab.bars[index];
    const noteItem = barInfo.filter(b => {
        const sections = b.split(":");
        const start = sections[1];
        return start === beat;
    })[0];
    const stringValues = { E: undefined, A: undefined, D: undefined, G: undefined, B: undefined, e: undefined };
    if (noteItem) {
        const sections = noteItem.split(":");
        const notes = sections[0].split(",");
        notes.forEach(n => {
            const string = n.replace(/\d+/g, "");
            const fret = n.replace(/[a-z]/gi, "");
            stringValues[string] = fret;
        });
    }
    return ({ target: elem, rect, from, row, bar, string, barElem, barNumElem, index, barInfo, noteItem, stringValues });
}



// Edit Tablature Note
$("#tab-sheet").addEventListener("click", editBeat);
function editBeat(event) {
    const body = $("body");
    const elem = event.target;
    if (!app.tabEditingEnabled) return;
    if (!elem.classList.contains("beat")) return;

    const prevEditForms = $("#beat-edit-bg");
    if (prevEditForms) body.removeChild(prevEditForms);

    const beatInfo = getBeatInfoForEditing(event);
    app.editFormInfo = {};

    // Align Edit Form Around the Clicked Element
    const { width, height } = elem.getBoundingClientRect()
    const windowWidth = window.innerWidth || body.clientWidth;
    const windowHeight = window.innerHeight || body.clientHeight;
    const { x, y } = beatInfo.rect;
    const placeLeft = x >= windowWidth / 2;
    const placeTop = y >= windowHeight / 2;

    // Add Edit Form
    const bg = $append({ tag: "div", id: "beat-edit-bg", parent: body });
    bg.addEventListener("click", event => { 
        if (event.target.id === "beat-edit-bg") body.removeChild(bg);
    });
    const offSet = 0;
    const form = $append({ tag: "form", id: "beat-edit", parent: bg });
    if (placeLeft) form.style.right = (windowWidth - x + offSet) + "px";
    else form.style.left = (x + width + offSet) + "px";
    if (placeTop) form.style.bottom = (windowHeight - y + offSet) + "px";
    else form.style.top = (y + height + offSet) + "px";

    // Add Chord Name Input
    const chordNameInputField = $append({ tag: "fieldset", parent: form });
    const chordNameInput = $append({ tag: "input", id: "chord-name-input", parent: chordNameInputField });
    chordNameInput.placeholder = "Chord Name";
    if (beatInfo.noteItem) {
        const sections = beatInfo.noteItem.split(":");
        const chordName = sections[3];
        if (chordName) chordNameInput.value = chordName;
    }

    // Fret Position Inputs
    const fretInputs = $append({ tag: "fieldset", id: "fret-inputs", parent: form });
    const input_E = $append({ tag: "input", id: "input-E", parent: fretInputs });
    const input_A = $append({ tag: "input", id: "input-A", parent: fretInputs });
    const input_D = $append({ tag: "input", id: "input-D", parent: fretInputs });
    const input_G = $append({ tag: "input", id: "input-G", parent: fretInputs });
    const input_B = $append({ tag: "input", id: "input-B", parent: fretInputs });
    const input_e = $append({ tag: "input", id: "input-e", parent: fretInputs });
    
    input_E.placeholder = "E";
    input_A.placeholder = "A";
    input_D.placeholder = "D";
    input_G.placeholder = "G";
    input_B.placeholder = "B";
    input_e.placeholder = "e";

    input_E.value = beatInfo.stringValues["E"] ? beatInfo.stringValues["E"] : "";
    input_A.value = beatInfo.stringValues["A"] ? beatInfo.stringValues["A"] : "";
    input_D.value = beatInfo.stringValues["D"] ? beatInfo.stringValues["D"] : "";
    input_G.value = beatInfo.stringValues["G"] ? beatInfo.stringValues["G"] : "";
    input_B.value = beatInfo.stringValues["B"] ? beatInfo.stringValues["B"] : "";
    input_e.value = beatInfo.stringValues["e"] ? beatInfo.stringValues["E"] : "";

    // Note Durations
    const durationInputs = $append({ tag: "fieldset", id: "duration-inputs", parent: form });
    const durs = "W__,W_,W,H__,H_,H,Q__,Q_,Q,E__,E_,E,X__,X_,X,T__,T_,T".split(",");
    durs.forEach(d => {
        const durInput = $append({ tag: "button", parent: durationInputs });
        durInput.classList.add(d);
        const icon = $append({ tag: "div", className: "duration-icon", parent: durInput });
        const url = "url(../../images/music-notations/" + d.toLocaleLowerCase().replace(/_/g, "-") + ".png)";
        icon.style.backgroundImage = url;
        durInput.addEventListener("click", function(event) {
            event.preventDefault();
            app.editFormInfo.duration = d;
            highlightDurationButton();
            this.classList.add("highlight");
            return false;
        });
    });

    // Set Duration If Notes are on Beat
    if (beatInfo.noteItem) {
        const sections = beatInfo.noteItem.split(":");
        const durationString = sections[2].replace(/\./g, "_");
        app.editFormInfo.duration = durationString;
        highlightDurationButton();
    }

    function highlightDurationButton() {
        const durBtns = [ ...$all("#duration-inputs button") ];
        durBtns.forEach(btn => {
            btn.classList.remove("highlight");
        });
        if (app.editFormInfo.duration) {
            const durBtn = $(`.${ app.editFormInfo.duration }`);
            durBtn.classList.add("highlight");
        }
    }

    const messageBox = $append({ tag: "fieldset", id: "edit-message-box", parent: form });
    const message = $append({ tag: "div", id: "edit-message", parent: messageBox });

    // Edit Function Buttons
    const editBtnBox = $append({ tag: "fieldset", id: "edit-btn-box", parent: form });
    const prevBtn = $append({ tag: "button", parent: editBtnBox });
    prevBtn.innerHTML = `<i class="fa-solid fa-angle-left"></i>`;
    prevBtn.title = "Move Note to the Left";
    prevBtn.addEventListener("click", event => {
        event.preventDefault();
        moveNote(-1, beatInfo);
    });

    const delBtn = $append({ tag: "button", parent: editBtnBox });
    delBtn.innerHTML = '<i class="fa-solid fa-delete-left"></i>';
    delBtn.title = "Delete This Bar";
    delBtn.addEventListener("click", event => {
        event.preventDefault();
        deleteBar(beatInfo);
    });

    const delNote = $append({ tag: "button", parent: editBtnBox });
    delNote.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
    delNote.title = "Delete This Note";
    delNote.addEventListener("click", event => {
        event.preventDefault();
        deleteNote(beatInfo);
    });

    const insertBtn = $append({ tag: "button", parent: editBtnBox });
    insertBtn.innerHTML = '<i class="fa-solid fa-plus"></i>';
    insertBtn.title = "Insert a Bar";
    insertBtn.addEventListener("click", event => {
        event.preventDefault();
        insertBox.style.display = "flex";
        const insertLeft = $append({ tag: "button", parent: insertBox });
        insertLeft.innerHTML = "Insert Left";
        insertLeft.type = "button";
        insertLeft.addEventListener("click", () => insertBar(0, beatInfo.index));

        const insertRight = $append({ tag: "button", parent: insertBox });
        insertRight.innerHTML = "Insert Right";
        insertRight.type = "button";
        insertRight.addEventListener("click", () => insertBar(1, beatInfo.index));
    });

    const nextBtn = $append({ tag: "button", parent: editBtnBox });
    nextBtn.innerHTML = '<i class="fa-solid fa-angle-right"></i>';
    nextBtn.title = "Move Note to the Right";
    nextBtn.addEventListener("click", event => {
        event.preventDefault();
        moveNote(1, beatInfo);
    });

    const insertBox = $append({ tag: "fieldset", id:"insert-box", parent: form });

    // OK Button
    const okBtnBox = $append({ tag: "fieldset", id: "ok-btn-box", parent: form });
    const okBtn = $append({ tag: "button", parent: okBtnBox });
    okBtn.innerHTML = "Apply";
    okBtn.addEventListener("click", event => {
        event.preventDefault();
        const values = getEditFormValues();
        const emptyNote = isEmptyForm(values);
        if (emptyNote) return;
        const valid = validateNote(values);
        if (!valid.valid) {
            messageBox.style.display = "flex";
            message.innerHTML = valid.message;
        }
        else editBar(values, beatInfo);
    });
}


function getEditFormValues() {
    const chordName = $("#chord-name-input").value;
    const E = $("#input-E").value;
    const A = $("#input-A").value;
    const D = $("#input-D").value;
    const G = $("#input-G").value;
    const B = $("#input-B").value;
    const e = $("#input-e").value;
    const duration = app.editFormInfo.duration;
    return ({ chordName, E, A, D, G, B, e, duration });
}



function validateNote(values) {
    if (values.chordName && values.chordName.length > 10) return { valid: false, message: "Chord Name Must is Max 10 Character" };
    if (values.E && isNaN(values.E)) return { valid: false, message: "String E Must Be a Number" };
    if (values.E && Number(values.E < 0)) return { valid: false, message: "String E Must Be Positive" };
    if (values.E && Number(values.E > 20)) return { valid: false, message: "String E Must Be Less Than 20" };
    if (values.A && isNaN(values.A)) return { valid: false, message: "String A Must Be a Number" };
    if (values.A && Number(values.A < 0)) return { valid: false, message: "String A Must Be Positive" };
    if (values.A && Number(values.A > 20)) return { valid: false, message: "String A Must Be Less Than 20" };
    if (values.D && isNaN(values.D)) return { valid: false, message: "String D Must Be a Number" };
    if (values.D && Number(values.D < 0)) return { valid: false, message: "String D Must Be Positive" };
    if (values.D && Number(values.D > 20)) return { valid: false, message: "String D Must Be Less Than 20" };
    if (values.G && isNaN(values.G)) return { valid: false, message: "String G Must Be a Number" };
    if (values.G && Number(values.G < 0)) return { valid: false, message: "String G Must Be Positive" };
    if (values.G && Number(values.G > 20)) return { valid: false, message: "String G Must Be Less Than 20" };
    if (values.B && isNaN(values.B)) return { valid: false, message: "String B Must Be a Number" };
    if (values.B && Number(values.B < 0)) return { valid: false, message: "String B Must Be Positive" };
    if (values.B && Number(values.B > 20)) return { valid: false, message: "String B Must Be Less Than 20" };
    if (values.e && isNaN(values.e)) return { valid: false, message: "String e Must Be a Number" };
    if (values.e && Number(values.e < 0)) return { valid: false, message: "String e Must Be Positive" };
    if (values.e && Number(values.e > 20)) return { valid: false, message: "String e Must Be Less Than 20" };
    if (values.E || values.A || values.D || values.G || values.B || values.e) {
        if (!values.duration) return { valid: false, message: "Note Length Must be Set" };
    }
    if (values.duration) {
        if (!(values.E || values.A || values.D || values.G || values.B || values.e)) return { valid: false, message: "Minimum 1 String Must be Set" };
    }
    if (values.chordName) {
        if (!(values.duration || values.E || values.A || values.D || values.G || values.B || values.e)) return { valid: false, message: "Cannot Set Only Chord Name!" };
    }

    return { valid: true }
}



function isEmptyForm(values) {
    if (!(values.chordName || values.duration || values.E || values.A || values.D || values.G || values.B || values.e)) return true;
    return false;
}


function editBar(values, beatInfo) {
    const barIndex = beatInfo.index;
    const noteIndex = Number(beatInfo.target.id.match(/beat\d+/g)[0].replace("beat", ""));
    const bar = app.tab.bars[barIndex];
    // Find If Bar Already Has a Note on the Beat
    const barHasBeatPosition = bar.find(b => {
        const sections = b.split(":");
        const start = Number(sections[1]);
        return start === noteIndex;
    });
    // Delete Beat If Found
    if (barHasBeatPosition) {
        const foundIndex = bar.indexOf(barHasBeatPosition);
        bar.splice(foundIndex, 1);
    }
    // Create New Note String
    const stringNames = "EADGBe".split("");
    const note = stringNames
        .map(s => values[s] ? s + values[s] : "")
        .filter(n => n)
        .join(",");
    const duration = values.duration.replace(/_/g, ".");
    let newNoteString = `${ note }:${ noteIndex }:${ duration }`;
    if (values.chordName) newNoteString += `:${ values.chordName }`;

    // Add New Note
    bar.push(newNoteString);
    saveHistory();
    displayNotesOnTab(app.tab.bars);
    $("#beat-edit-bg").click();
}


function deleteNote(beatInfo) {
    const barIndex = beatInfo.index;
    const noteIndex = Number(beatInfo.target.id.match(/beat\d+/g)[0].replace("beat", ""));
    const bar = app.tab.bars[barIndex];
    
    // Find If Bar Already Has a Note on the Beat
    const barHasBeatPosition = bar.find(b => {
        const sections = b.split(":");
        const start = Number(sections[1]);
        return start === noteIndex;
    });
    
    // Delete Beat If Found
    if (barHasBeatPosition) {
        const foundIndex = bar.indexOf(barHasBeatPosition);
        bar.splice(foundIndex, 1);
    }

    saveHistory();
    displayNotesOnTab(app.tab.bars);
    centerCurrentBarInTab();
    highlightCurrentBar();                                 // Highlight Current Bar
    updateTabIndexInfo();
}


function moveNote(count, beatInfo, times = 0) {
    if (times === 3) return;
    const values = getEditFormValues();
    const emptyNote = isEmptyForm(values);
    if (emptyNote) {
        const messageBox = $("#edit-message-box");
        const message = $("#edit-message");    
        messageBox.style.display = "flex";
        message.innerHTML = "Cannot Move Empty Beat!";
        return;
    }
    
    const barIndex = beatInfo.index;
    let noteIndex = beatInfo.noteIndex;
    if (noteIndex === undefined) noteIndex = Number(beatInfo.target.id.match(/beat\d+/g)[0].replace("beat", ""));

    let newNoteIndex = noteIndex + count;
    let newBarIndex = barIndex;

    if (newNoteIndex > 31) {
        newNoteIndex = 0;
        newBarIndex++;
        if (newBarIndex > app.tab.bars.length - 1) {
            app.tab.bars.push([]);
        }
    }   
    else if (newNoteIndex < 0) {
        if (newBarIndex > 0) {
            newNoteIndex = 31;
            newBarIndex--;
        }
        else {
            newNoteIndex = 0;
        }
    }

    
    // Find If Bar Already Has a Note on the Beat
    const barHasBeatPosition = app.tab.bars[newBarIndex].find(b => {
        const sections = b.split(":");
        const start = Number(sections[1]);
        
        return start === newNoteIndex;
    });

    if (barHasBeatPosition) {
        beatInfo.index = newBarIndex;
        beatInfo.noteIndex = newNoteIndex;
        moveNote(count, beatInfo, ++times);
    }
    else {
        // Delete Old Note
        const foundIndex = app.tab.bars[barIndex].indexOf(beatInfo.noteItem);
        if (foundIndex !== -1) app.tab.bars[barIndex].splice(foundIndex, 1);

        // Append to New Position
        const [ n, _, d, c ] = beatInfo.noteItem.split(":");
        let newNoteString = `${ n }:${ newNoteIndex }:${ d }`;
        if (c) newNoteString += `:${ c }`;
        beatInfo.noteItem = newNoteString;
        app.tab.bars[newBarIndex].push(newNoteString);
        saveHistory();
        displayNotesOnTab(app.tab.bars);
        centerCurrentBarInTab();
        highlightCurrentBar();                                 // Highlight Current Bar
        updateTabIndexInfo();
        $("#beat-edit-bg").click();
    }
}



function deleteBar(beatInfo) {
    app.tab.bars.splice(beatInfo.index, 1);
    saveHistory();
    displayNotesOnTab(app.tab.bars);
    centerCurrentBarInTab();
    highlightCurrentBar();                                 
    updateTabIndexInfo();
    $("#beat-edit-bg").click();
}



function insertBar(count, index) {
    const newIndex = count + index;
    app.tab.bars.splice(newIndex, 0, []);
    saveHistory();
    displayNotesOnTab(app.tab.bars);
    centerCurrentBarInTab();
    highlightCurrentBar();                                 
    updateTabIndexInfo();
    $("#beat-edit-bg").click();
}



function updateTabIndexInfo() {
    const indBarsElem = $("#current-bar");
    indBarsElem.innerHTML = app.barIndex + 1;
    
    const totBarsElem = $("#total-bars");
    totBarsElem.innerHTML = app.tab.bars.length;
    
    const totNotesElem = $("#total-notes");
    totNotesElem.innerHTML = app.tab.bars[app.barIndex].length;
}



function stepForward(fast = false) {
    if (app.play) return;
    if (fast) app.barIndex = app.tab.bars.length - 1;
    else app.barIndex++;
    const lastIndex = app.tab.bars.length - 1;
    if (app.barIndex >= lastIndex) {
        const foreButtons = $all("#fast-forward, #forward");
        foreButtons.forEach(b => b.disabled = true);
    }

    const backButtons = $all("#fast-backward, #backward");
    backButtons.forEach(b => b.disabled = false);
    app.noteIndex = 0;

    centerCurrentBarInTab();
    highlightCurrentBar();                                 // Highlight Current Bar
    updateTabIndexInfo();
}



function stepBackward(fast = false) {
    if (app.play) return;
    if (fast) app.barIndex = 0;
    else app.barIndex--;
    
    const foreButtons = $all("#fast-forward, #forward");
    foreButtons.forEach(b => b.disabled = false);
    
    if (app.barIndex <= 0) {
        const backButtons = $all("#fast-backward, #backward");
        backButtons.forEach(b => b.disabled = true);
    }
    app.noteIndex = 0;

    centerCurrentBarInTab();
    highlightCurrentBar();                                 // Highlight Current Bar
    updateTabIndexInfo();
}



function stopPlaying() {
    playTab(true);
    clearTabStyling();
    stepBackward(true);
}


function saveHistory() {
    const history = JSON.stringify(app.tab);
    app.tabHistoryStack.push(history);
    $("#undo").disabled = false;
}


function undo() {
    if (app.tabHistoryStack.length <= 1) return $("#undo").disabled = true;
    app.tabHistoryStack.pop();
    app.tab = JSON.parse(app.tabHistoryStack[app.tabHistoryStack.length - 1]);
    displayNotesOnTab(app.tab.bars);
    if (app.tabHistoryStack.length <= 1) return $("#undo").disabled = true;
}



$("#repeat").addEventListener("click", e => repeat(e));
function repeat(event){
    if (event.target.id === "repeat" || event.target.id === "repeat-icon") {
        const inputBox = $("#repeat__from-to");
        const light = $("#repeat-btn-switch-light");
        app.repeatAllowed = !app.repeatAllowed;
        const lastBarIndex = app.tab.bars.length;
        
        if (app.repeatAllowed) {
            const inputFrom = $("#repeat-from");
            const inputTo = $("#repeat-to");
            inputBox.style.display = "flex";
            light.classList.add("active");

            if (!inputFrom.value) inputFrom.value = 1;
            if (!inputTo.value)  inputTo.value = lastBarIndex;
        }
        else {
            light.classList.remove("active");
            inputBox.style.display = "none";
        }
    }
}



function setMetronome() {
    app.metronomeIsOn = !app.metronomeIsOn;
    const light = $("#metronome-btn-switch-light");

    if (app.metronomeIsOn) light.classList.add("active");
    else light.classList.remove("active");
}


function save() {
    const bgElem = $("#save__bg");
    const titleInput = $("#save__title");
    const artistInput = $("#save__artist");
    const authorInput = $("#save__author");
    const tempoInput = $("#save__tempo");
    const user = $getStorage().user;

    titleInput.value = app.tab.title;
    artistInput.value = app.tab.band;
    authorInput.value = user.userName;
    tempoInput.value = app.tab.tempo;

    bgElem.style.display = "flex";
    const messageElem = $("#save__message");
    messageElem.style.display = "none";
}



function setDifficultyRangeText(elem) {
    const difficulty = elem.value;
    const text = ["For Babies", "Super Easy", "Easy", "Begginner", "Moderate", "Intermediate", "Hard", "Super Hard", "Expert", "God Level"];
    $("#save__difficulty-text").innerHTML = difficulty + " - " + text[difficulty - 1];
}



function closeSaveForm() {
    const bgElem = $("#save__bg");
    bgElem.style.display = "none";
    const messageElem = $("#save__message");
    messageElem.style.display = "none";
}



async function saveTablature() {
    const user = $getStorage().user;   
    const title = $("#save__title").value;
    const artist = $("#save__artist").value;
    const tempo = $("#save__tempo").value;
    const isPublic = $("#save__public").checked;
    const difficulty = $("#save__difficulty").value;
    const messageElem = $("#save__message");
    const content = app.tab.bars;

    const { valid, message = "" } = validateSaveForm(title, artist, tempo, app.tab);
    if (!valid) {
        messageElem.style.display = "block";
        messageElem.innerHTML = message;
        return;
    }
    else {
        messageElem.style.display = "none";
    }

    try {
        const options = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                userID: user._id, 
                title, 
                artist, 
                difficulty, 
                isPublic, 
                tempo, 
                content: JSON.stringify(content) 
            })
        };

        const URL = "http://localhost:5000/api/tabs/";
        const response = await fetch(URL, options);
        const responseJSON = await response.json();

        if (responseJSON.success) {
            messageElem.style.display = "block";
            messageElem.innerHTML = "Tab Saved!";
            closeSaveForm();
        }
        else {
            messageElem.style.display = "block";
            messageElem.innerHTML = responseJSON.message;
            // If Tab Exists with Title
            const tabID = responseJSON.id;
            if (response.status === 409 && tabID) modifyTab(options, tabID);
            return false;
        }
    } catch (ex) {
        messageElem.style.display = "block";
        messageElem.innerHTML = ex;
        return true;
    }
}



async function modifyTab(options, tabID) {
    const messageElem = $("#save__message");
    options.method = "PUT";

    try {
        const URL = "http://localhost:5000/api/tabs/" + tabID;
        const response = await fetch(URL, options);
        const responseJSON = await response.json();
        if (responseJSON.success) {
            closeSaveForm();
            messageElem.style.display = "block";
            messageElem.innerHTML = "Tab Modified!";
            return true;
        }
        else {
            messageElem.style.display = "block";
            messageElem.innerHTML = responseJSON.message;
            return false;
        }
    } catch (ex) {
        messageElem.style.display = "block";
        messageElem.innerHTML = ex;
        return true;
    }
}



function validateSaveForm(title, artist, tempo, content) {
    const valid = false;
    if (!title) return { valid, message: "Title Cannot Be Empty!" };
    if (title.length > 255) return { valid, message: "Title is Maximum 255 Characer!" };
    if (artist.length > 255) return { valid, message: "Artist is Maximum 255 Characer!" };
    if (tempo < 20) return { valid, message: "Tempo Must Be Greater Than 19 BPM!" };
    if (tempo > 300) return { valid, message: "Tempo Must Be Less Than 300 BPM!" };
    if (!validateTabFormatting(content)) return { valid, message: "Tablature Format Error!" };
    return { valid: true }
}



async function openTabForm() {
    const bgElem = $("#open__bg");
    const user = $getStorage().user;
    $("#open__tab").disabled = true;            // Disable Open Tab

    bgElem.style.display = "flex";
    const messageElem = $("#open__message");
    messageElem.style.display = "none";

    // Load User's Tabs
    const { success, message, tabs } = await loadTabsFromDB(user._id);
    
    if (success) {
        app.userTabList = tabs;
        const tabListElem = $("#open__tab-list");
        tabListElem.innerHTML = "";
        tabs.forEach((tab, i) => {
            const listItem = $append({ tag: "li", id: "tab__" + i ,parent: tabListElem });
            listItem.addEventListener("click", e => {
                const highlightedItems = $all("#open__tab-list li.highlight");
                highlightedItems.forEach(h => h.classList.remove("highlight"));
                e.target.classList.add("highlight");

                $("#open__tab").disabled = false;            // Enable Open Tab
            });

            const titleArtistElem = $append({ tag: "div", parent: listItem });
            titleArtistElem.innerHTML = tab.title + " | " + tab.artist;

            const publicElem = $append({ tag: "div", parent: listItem });
            publicElem.innerHTML = tab.isPublic ? '<i class="fa-regular fa-eye"></i>' : '<i class="fa-regular fa-eye-slash"></i>';
            publicElem.style.color = tab.isPublic ? "deeppink" : "aqua";

            const difficultyElem = $append({ tag: "div", parent: listItem });
            const colors = ["aqua", "aqua", "springgreen", "springgreen", "yellow", "yellow", "orange", "orange", "deeppink", "deeppink"];
            for (let i = 0; i < 10; i++) {
                const line = $append({ tag: "div", className: "line", parent: difficultyElem });
                line.style.backgroundColor = colors[i];
                if (tab.difficulty > i) line.classList.add("highlight");
            }

            const dateElem = $append({ tag: "div", parent: listItem });
            const pad = n => n < 10 ? "0" + n : n;
            const date = new Date(tab.updated)
            const year = date.getFullYear();
            const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][date.getMonth()];
            const day = pad(date.getDate());
            const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];
            const hour = pad(date.getHours());
            const min = pad(date.getMinutes());
            const formattedDate = `${ day }.${ month }.${ year } ${ dayName } ${ hour }:${ min }`;
            dateElem.innerHTML = formattedDate;
        });
    } else {
        messageElem.style.display = "block";
        messageElem.innerHTML = message;
    }
}



function closeOpenTabForm() {
    const bgElem = $("#open__bg");
    bgElem.style.display = "none";
    const messageElem = $("#open__message");
    messageElem.style.display = "none";
}



async function loadTabsFromDB(userID) {
    try {
        const options = {
            method: 'GET',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        };

        const URL = "http://localhost:5000/api/tabs/user/" + userID;
        const response = await fetch(URL, options);
        console.log(response)
        const { success, message, tabs } = await response.json();
        return { success, message, tabs }
    } catch (ex) { return { success: false, message: ex }; }
}



async function openTablature() {
    const messageElem = $("#open__message");
    const highlightedItems = $all("#open__tab-list li.highlight");
    highlightedItems.forEach(h => h.classList.remove("highlight"));
    if (highlightedItems.length) {
        const tabIndex = Number(highlightedItems[0].id.match(/tab__\d+/g)[0].replace("tab__", ""));
        const tabToOpen = app.userTabList[tabIndex]._id;
        
        const { success, message, tab } = await loadTabWithIDFromDB(tabToOpen);
        if (success) {
            try {
                tab.bars = JSON.parse(tab.content);
                tab.band = tab.artist;
                const isValid = validateTabFormatting(tab);
                if (isValid) {
                    app.tab = tab;
                    console.log(app.tab);
                    closeOpenTabForm();
                    start();
                }
            } catch(ex) {
                messageElem.style.display = "block";
                messageElem.innerHTML = "Compromised Tab Content Format!";    
                console.log(ex)
            }
        } 
        else {
            messageElem.style.display = "block";
            messageElem.innerHTML = message;
        }
    }
}



async function loadTabWithIDFromDB(tabID) {
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




async function deleteTab() {
    // Find If Tab With Title and UserID Exist
    const user = $getStorage().user;
    if (!user._id) return console.log("No User ID Found!");

    const { success, message, tabs } = await loadTabsFromDB(user._id);
    let savedTab;

    if (success) {
        savedTab = tabs.find(t => t.title === app.tab.title);
        if (savedTab) {
            // Delete Tab If Title Found in DB
            // Clear Tab Sheet If Title Is Not Found In DB
            const headerText = "Delete Tab Sheet From Database";
            const content = "You have a saved tab with the title: " + app.tab.title + ". Would you like to permanently delete it from our database?";
            const color = "springgreen";
            const actionButtons = [
                { text: "Cancel" },
                { text: "OK", color, callback: async () => {
                    $("body").removeChild($(".message"));
                    const { success, message } = await deleteTabFromDB(savedTab._id);
                    if (success) {
                        $fullScreenMessage({ 
                            headerText: "Tab Successfully Deleted",
                            content: app.title, 
                            actionButtons: [{ text: "OK", color }]
                        });                   
                        app.tab = {
                            title: "Untitled",
                            band: "No Band",
                            tempo: 120,
                            bars: [[]]
                        };
                        start();
                    }
                    else {
                        $fullScreenMessage({ 
                            headerText: "Delete Error",
                            content: message,
                            actionButtons: [{ text: "OK", color }]
                        });                   
                    }
                } },
            ];
            $fullScreenMessage({ headerText, content, actionButtons });       
        }
        else {
            // Clear Tab Sheet If Title Is Not Found In DB
            const headerText = "Clear Tab Sheet";
            const content = "Your unsaved changes will be lost!";
            const color = "springgreen";
            const actionButtons = [
                { text: "Cancel" },
                { text: "OK", color, callback: () => {
                    app.tab = {
                        title: "Untitled",
                        band: "No Band",
                        tempo: 120,
                        bars: [[]]
                    };
                    start();
                    $("body").removeChild($(".message"));
                } },
            ];
            $fullScreenMessage({ headerText, content, actionButtons });       
        }
    }
}



async function deleteTabFromDB(id) {
    try {
        const options = {
            method: 'DELETE',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        };

        const URL = "http://localhost:5000/api/tabs/" + id;
        const response = await fetch(URL, options);
        const { success, message } = await response.json();
        return { success, message }
    } catch (ex) { return { success: false, message: ex }; }
}



const placeholderForUnfinalised = '<i class="fa-solid fa-star"></i>';
function record() {
    app.isRecordAllowed = !app.isRecordAllowed;

    const light = $("#record-btn-switch-light");
    const recordBtn = $("#record");
    if (app.isRecordAllowed) {
        const metronomeAudio = new Howl({ src: ["../../sounds/metronome.mp3"] }); // Get Metronome Audio
        if (!app.metronomeAudio) app.metronomeAudio = metronomeAudio;  // Set Metronome Audio If Not Set Yet
        
        light.classList.add("active");
    }
    else {
        light.classList.remove("active");
    }
}


function handleStrumActivated(event, strum) {
    if (!app.isRecordAllowed) return;
    const guitarNotes = ["E2", "F2", "Fs2", "G2", "Gs2", "A2", "As2", "B2", "C3", "Cs3", "D3", "Ds3", "E3", "F3", "Fs3", "G3", "Gs3", "A3", "As3", "B3", "C4", "Cs4", "D4", "Ds4", "E4", "F4", "Fs4", "G4", "Gs4", "A4", "As4", "B4", "C5", "Cs5", "D5", "Ds5", "E5", "F5", "Fs5", "G5", "Gs5", "A5", "As5", "B5", "C6"];
    const strumOffsets = [0, 5, 10, 15, 19, 24];
    const positions = app.controllerState.highestFretPositions[strum - 1];  // Finger Positions on a String Row
    const upperMost =  positions[positions.length - 1];                     // Topmost Pressed Position
    
    const note = guitarNotes[strumOffsets[strum - 1] + upperMost];          // Note Name that Plays

    if (event !== 0) {                                                      // Strum Pressed  
        finaliseNote(strum);
    }
    else {                                                                  // Strum Released
        // Save Note Produced by the Controller
        placeUnfinalisedNoteOnTab(app.barIndex, app.noteIndex, upperMost, strum);
    }
}


function handleFretActivated(event, fret, string) {
    if (!app.isRecordAllowed) return;
    finaliseNote(string);
}



// Create a Note and Paste it in the Tab
// An Unfinalised Note Will Hold Information about Its Starting Bar Index
// Initial Bar and Note Position is Stored in the Chord Name Placeholder
function placeUnfinalisedNoteOnTab(barIndex, noteIndex, upperMostFret, strum) {
    const string = "EADGBe"[strum - 1];

    // Find Out If Note Exists on the Note String Index Positon
    const bar = app.tab.bars[barIndex];
    let existNoteIndex = false; 
    for (let i = 0; i < bar.length; i++) {
        const [ n, s ] = bar[i].split(":");
        if (Number(s) === noteIndex) { existNoteIndex = true; break; }
    }
    
    // Condense Notes with the Same Start Position
    if (existNoteIndex) {
        for (let i = 0; i < bar.length; i++) {
            const [ n, s, d, c ] = bar[i].split(":");
            if (Number(s) === noteIndex) {
                // Dissect Note to Separate Strings to Find If Duplicate
                const strings = n.split(",").map(s => s.replace(/\d+/g, ""));

                if (strings.includes(string)) {
                    finaliseNote(strum);
                    break;
                }
            
                // New Condensed Note
                const condensed = `${ n },${ string }${ upperMostFret }:${ s }:${ d }:${ c }`;
                app.tab.bars[barIndex][i] = condensed;
            }
        }
    } else {
        const duration = "W";                                                  // Initial Duration is a Whole Note
        const noteStr = `${ string }${ upperMostFret }:${ noteIndex }:${ duration }:${ placeholderForUnfinalised }`; // Create the Note String
        const unfinalised = `${ string }${ upperMostFret }:${ noteIndex }:${ duration }:${ barIndex }`; // Create the Note String
    
        // Paste Note in Tab
        app.tab.bars[barIndex].push(noteStr);
        app.unfinalisedNotes.push(unfinalised);    

        // Finalise Note After a Certain Time
        const longestNoteIn32s = 49;                               // Whole 32 + half 16 + 1 (Safety)
        const removeTime = getGameLoopIntervalsInMS() * longestNoteIn32s;          // Longest Possible Note
        const removeTimeout = setTimeout(() => removeWithLongestDuration(unfinalised, removeTimeout), removeTime);
    }    

    function removeWithLongestDuration(unfinalisedNoteStr, timeout) {
        const [ _, start, __, barIndex ] = unfinalisedNoteStr.split(":");
        const index = app.unfinalisedNotes.findIndex(n => n === unfinalisedNoteStr);
        if (index !== -1) {
            app.unfinalisedNotes.splice(index, 1);                         // Remove from Unfinalised Note Store
            const bar = app.tab.bars[barIndex];
            
            for (let i = 0; i < bar.length; i++) {
                const curr_n = bar[i];
                const [ n, s, _, __ ] = curr_n.split(":");                  // Notes, Start, Duration, Chord Name
                const finalised = `${ n }:${ s }:W..`;                     // The Longest Possible Note
                
                // Finalise Note
                if (s === start) app.tab.bars[barIndex][i] = finalised;
                centerCurrentBarInTab(app.tab.bars[barIndex]);
            }
        }
        clearTimeout(timeout);
    }
    centerCurrentBarInTab();
}



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
    { name: "X..", duration: 3.5 },
    { name: "X.", duration: 3 },
    { name: "X", duration: 2 },
    { name: "T..", duration: 1.75 },
    { name: "T.", duration: 1.5 },
    { name: "T", duration: 1 },
]

function calculateDuration(startBarI, startNoteI, endBarI, endNoteI) {  
    const units = 32;                                              // Maximum Unit is 1 / 32nd Note
    const absStart = startBarI * units + startNoteI;
    const absEnd = endBarI * units + endNoteI;
    const diffInUnits = absEnd - absStart;
    
    // Find Closest Duration Units
    let closest = 10000;
    let closestUnit = durationsInUnits[0];
    durationsInUnits.forEach(durationUnit => {
        const bigger = Math.max(durationUnit.duration, diffInUnits);
        const smaller = Math.min(durationUnit.duration, diffInUnits);
        const diff = bigger - smaller;
        if (diff < closest) {
            closest = diff;
            closestUnit = durationUnit;
        };
    });
    return closestUnit;
}



function finaliseNote(strum) {
    // Get Which Strings Need Finalisation
    const string = "EADGBe"[strum - 1];
    const notesToFinalise = [];
    const indices = [];

    // Find Strums from Unfinalised Ones
    app.unfinalisedNotes.forEach(noteStr => {
        const [ n, _, __, inds ] = noteStr.split(":");
        const str = n.split(",").map(x => x.replace(/\d+/g, ""));
        if (str.includes(string)) {
            notesToFinalise.push(noteStr);
            indices.push(inds);
        }
    });

    // Take of Strums from Unfinalised Ones
    notesToFinalise.forEach(n => {
        const index = app.unfinalisedNotes.findIndex(u => u === n);
        app.unfinalisedNotes.splice(index, 1);
    });

    app.tab.bars.forEach((bar, barIndex) => {
        bar.forEach((noteStr, noteIndex) => {
            const [ n, s, d, c ] = noteStr.split(":");
            const str = n.split(",").map(x => x.replace(/\d+/g, ""));
            if (str.includes(string)) {
                if (c === placeholderForUnfinalised) {
                    const duration = calculateDuration(barIndex, Number(s), app.barIndex, app.noteIndex);
                    const newString = `${ n }:${ s }:${ duration.name }`;
                    app.tab.bars[barIndex][noteIndex] = newString;
                    centerCurrentBarInTab(app.tab.bars[barIndex]);
                }
            }
        }); 
    });
}