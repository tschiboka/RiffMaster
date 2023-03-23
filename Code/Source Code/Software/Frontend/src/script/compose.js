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
    tab: null,                                                     // Save Tab Here
}



// Temporary Here (This Will Be Dynamically Loaded)
const tab = {
    title: "Master of Puppets",
    band: "Metallica",
    tempo: 80,
    bars: [
        [
            "E0:0:W:WHOLE",
        ],
        [
            "E0:0:Q",
            "E2:7:Q",
            "E3:15:Q",
            "A0:23:Q",
        ],
        [
            "E0,A2,D2,G1,B0,e0:0:E.:E",
        ],
        [
            "E0,A2,D2,G1,B0,e0:0:E:E",
        ],
        [
            "E0,A2,D2,G1,B0,e0:0:X.:E",
        ],
        [
            "E0,A2,D2,G1,B0,e0:0:X:E",
        ],
        [
            "E0,A2,D2,G1,B0,e0:0:T.:E",
        ],
        [
            "E0,A2,D2,G1,B0,e0:0:T:E",
        ],
        [
            "E0:0:E",
            "E1:8:E",
            "E2:16:E",
            "E3:24:E",
        ],
        [
            "E4:0:E",
            "E5:8:E",
            "E6:16:E",
            "E7:24:E",
        ],
        [
            "E8:0:E",
            "E9:8:E",
            "E0:16:E",
            "E1:24:E",
        ],
        [
            "E0,A2:0:E:E5",
            "E10,A12:16:X:D5",
            "E9,A11:20:X:C#5",
            "E8,A10:24:X:C5",
        ],
        [
            "E0:0:E",
            "E1:8:E",
            "E2:16:E",
            "E3:24:E",
        ],
        [
            "E4:0:E",
            "E5:8:E",
            "E6:16:E",
            "E7:24:E",
        ],
        [
            "E8:0:E",
            "E9:8:E",
            "E0:16:E",
            "E1:24:E:HERE",
        ],
        [
            "A0:0:E",
            "A9:8:E",
            "A0:16:E",
            "A1:24:X:FUCK",
        ],
        [
            "E0,A2:0:E:E5",
            "E10,A12:16:X:D5",
            "E9,A11:20:X:C#5",
            "E8,A10:24:X:C5",
        ],
        [
            "E0:0:E",
            "E1:8:E",
            "E2:16:E",
            "E3:24:E",
        ],
        [
            "E4:0:E",
            "E5:8:E",
            "E6:16:E",
            "E7:24:E",
        ],
        [
            "E0:0:E",
            "E1:8:E",
            "E2:16:E",
            "E3:24:E",
        ],
        [
            "E4:0:E",
            "E5:8:E",
            "E6:16:E",
            "E7:24:E",
        ],
        [
            "E0:0:E",
            "E1:8:E",
            "E2:16:E",
            "E3:24:E",
        ],
        [
            "E4:0:E",
            "E5:8:E",
            "E6:16:E",
            "E7:24:E",
        ],
    ]
}



// Set Application State and Load Tablature
function start() {
    app.musicAgreement = true;                                     // Temporary Solution
    //app.notes = getAudio();                                        // Load Audio Files
    
    // LOAD TAB!!!!!!!!!!!!
    const validTab = validateTabFormatting(tab);                   // Only Validated Tabs Can Be Displayed
    if (!validTab) return;
    app.tab = tab;                                                 // Set Tab

    app.title = tab.title;                                         // Set Title
    app.band = tab.band;                                           // Set Band
    app.tempo = tab.tempo;                                         // Set Tempo
    
    
    setTabTitle(tab);                                              // Place Title and Band on Page
    displayTabSheet(tab, app.staffNum, true);                      // Display an Empty Tab Sheet
    displayNotesOnTab(tab.bars);                                   // Display Notes on the Tab Sheet (from Bar 0)
    
    const gameLoopTimer = setInterval(gameLoop, getGameLoopIntervalsInMS()); // Create a Game Loop Interval Function
    app.gameLoopTimer = gameLoopTimer;                             // Globally Available Game Loop Timer
}



// Audio Functions
function playNote(note, string) { app.audio[note].play(); }
function stopNote(note) { app.audio[note].stop(); }
const guitarNotes = ["E2", "F2", "Fs2", "G2", "Gs2", "A2", "As2", "B2", "C3", "Cs3", "D3", "Ds3", "E3", "F3", "Fs3", "G3", "Gs3", "A3", "As3", "B3", "C4", "Cs4", "D4", "Ds4", "E4", "F4", "Fs4", "G4", "Gs4", "A4", "As4", "B4", "C5", "Cs5", "D5", "Ds5", "E5", "F5", "Fs5", "G5", "Gs5", "A5", "As5", "B5", "C6"];



function getGameLoopIntervalsInMS() {
    const beatInMS = 60 / app.tempo;                               // How Many Beats In a Second
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
        //selectBeat(app.staffNum);
        if (app.noteIndex === 0) {
            centerCurrentBarInTab();                               // On First Beat Redraw for Centering Active Bar and Notes
            highlightCurrentBar();                                 // Highlight Current Bar
        }
        highlightCurrentNotes();
        
        // Play Tab Notes
        const bar = app.tab.bars[app.barIndex];
        bar.forEach(note => { 
            const [ noteStr, start, duration, chord] = note.split(":");
            
            if (start == app.noteIndex)
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
                })
        });

        app.noteIndex++;                                  
        // Increment Bar and Beat
        const MAXBEAT = 32;                                        // 32 Notes in a Bar
        if (app.noteIndex === MAXBEAT) {                           // If Maximum Reached
            app.noteIndex = 0;                                     // Reset Note
            app.barIndex++;                                        // Increment Bar Index
            if (app.barIndex >= tab.bars.length) {                 // If No More Bars to Play
                playTab(true);                                     // Pause
                app.barIndex = 0;                                  // Reset Bar Index
                app.noteIndex = 0;                                 // Reset Note Index
            }
        }

        // Metronome for Every Beat
        if ((app.noteIndex - 1) % 8 === 0) {                             // Every 8 32nd Note
            app.metronomeAudio.volume(app.metronomeVolume);        // Set Metronome Volume
            app.metronomeAudio.play();                             // Play Metronome
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
    displayNotesOnTab(tab.bars, from);
}



// Find Bar with the Current Bar Index and Highlight it
function highlightCurrentBar() {
    const index = app.barIndex + 1;                                // Get Index (DOM Display Starts with Number 1)
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
        displayNotesOnTab(tab.bars);                               
    }
    else {                                                         // If Pause Pressed
        app.play = false;                                          // Unset Play
        playBtn.disabled = false;                                  // Enable Play Button
        pauseBtn.disabled = true;                                  // Disable Pause Button
    }
}