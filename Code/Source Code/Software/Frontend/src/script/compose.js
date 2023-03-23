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
    tempo: 220,
    bars: [
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
    
    // LOAD TAB!!!!!!!!!!!!11
    // VALIDATE TAB!!!!!!!!!!

    app.title = tab.title;                                         // Set Title
    app.band = tab.band;                                           // Set Band
    app.tempo = tab.tempo;                                         // Set Tempo
    app.tab = tab;                                                 // Set Tab
    
    setTabTitle(tab);                                              // Place Title and Band on Page
    displayTabSheet(tab, app.staffNum, true);                      // Display an Empty Tab Sheet
    displayNotesOnTab(tab.bars);                                   // Display Notes on the Tab Sheet (from Bar 0)
    selectBeat();
    const gameLoopTimer = setInterval(gameLoop, getGameLoopIntervalsInMS()); // Create a Game Loop Interval Function
    app.gameLoopTimer = gameLoopTimer;                             // Globally Available Game Loop Timer
}



// Audio Functions
//function playNote(note, string) { app.audio[note].playTab(); displayActionOnEqualizer(note, true, string); }
//function stopNote(note) { app.audio[note].stop(); displayActionOnEqualizer(note, false); }



function getGameLoopIntervalsInMS() {
    const beatInMS = 60 / app.tempo;                               // How Many Beats In a Second
    const thirtysecondInMS = beatInMS / 8 * 1000;                  // Interval of One Thirtysecondth Note (Shortest Playable Note)
    const gameLoopFreqMs = Math.round(thirtysecondInMS);           // Calculate Loop Frequency in Milli Seconds
    return gameLoopFreqMs;
}


// Game Loop
function gameLoop() {                                              // Run on Every 32nd Beat
    if (app.play) {                                                // If User Pressed Play Button
        //selectBeat(app.staffNum);
        if (app.noteIndex === 0) {
            centerCurrentBarInTab();                               // On First Beat Redraw for Centering Active Bar and Notes
            highlightCurrentBar();                                 // Highlight Current Bar
        }
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
        if (app.noteIndex % 8 === 0) {                             // Every 8 32nd Note
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



function highlightCurrentBar() {
    const index = app.barIndex + 1;
    const barNumberDiv = $(`#bar-number-${ index }`);
    const barToHighlight = barNumberDiv.closest(".bar");
    barToHighlight.classList.add("highlight");
}



// Toggle Play and Pause Buttons
function playTab(pause = false) {
    if (app.tab.bars.length === 0) return;
    const metronomeAudio = new Howl({ src: ["../../sounds/metronome.mp3"] }); // Get Metronome Audio
    if (!app.metronomeAudio) app.metronomeAudio = metronomeAudio;  // Set Metronome Audio If Not Set Yet
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



function selectBeat(lines) {
    if (lines === 1) {
        
        console.log();
    }
}