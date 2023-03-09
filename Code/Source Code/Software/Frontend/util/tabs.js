/* 
    Tabs are Read from a Source and Translated into a Tab Object.
    Tab Object's Syntax Discription:
        title:     The Title of the Song,
        band:      Band Name,
        tempo:     Beat per Second (120 Default)
        bars:      An Array of Bar (4 * 4th Beat of Notes)
        
    One Bar Consists of 32 Notes (Fastest Beat Represented is a 1/32)
    A 32nd Note Beat Syntax Description:
        "Notes:Duration:Chord"
        Notes:     String Char (E|A|D|G|B|e) and Fret Number | Empty String
        Duration:  N of 32nd
        Chord:     Chord Name (Em7, G#, ...)
*/

const tab = {
    title: "Master of Puppets",
    band: "Metallica",
    tempo: 120,
    bars: [
        ["E0,A2:2:E5", "E10,A12:8:A5","E9,A11:8:G#5","E8,A10:4:G"],
        ["E0:16", "E0:16", "E12:16", "E0:16", "E0:16", "E11:16", "E0:16", "E0:16", "E10,A12:8:A5","E9,A11:8:G#5","E8,A10:4:G"],
        ["E0:16", "E0:16", "E9:16", "E0:16", "E0:16", "E8:16", "E0:16", "E0:16", "E7:16", "E0:16", "E6:16", "E0:16", "E5:16", "E0:16","E4:16", "E0:16"],
        ["E0:16", "E0:16", "E12:16", "E0:16", "E0:16", "E11:16", "E0:16", "E0:16", "E10,A12:8:A5","E9,A11:8:G#5","E8,A10:4:G"],
        ["E0:16", "E0:16", "E9:16", "E0:16", "E0:16", "E8:16", "E0:16", "E0:16", "E7:16", "E0:16", "E6:16", "E0:16", "E5:16", "E0:16","E4:16", "E0:16"],
        ["E0:16", "E0:16", "E12:16", "E0:16", "E0:16", "E11:16", "E0:16", "E0:16", "E10,A12:8:A5","E9,A11:8:G#5","E8,A10:4:G"],
        ["E0:16", "E0:16", "E9:16", "E0:16", "E0:16", "E8:16", "E0:16", "E0:16", "E7:16", "E0:16", "E6:16", "E0:16", "E5:16", "E0:16","E4:16", "E0:16"],
        ["E0:16", "E0:16", "E12:16", "E0:16", "E0:16", "E11:16", "E0:16", "E0:16", "E10,A12:8:A5","E9,A11:8:G#5","E8,A10:4:G"],
        ["E0:16", "E0:16", "E9:16", "E0:16", "E0:16", "E8:16", "E0:16", "E0:16", "E7:16", "E0:16", "E6:16", "E0:16", "E5:16", "E0:16","E4:16", "E0:16"],
        ["E0:16", "A2:16", "A3:16", "E0:16", "A2:16", "A4:16", "E0:16", "A2:16", "A5:16", "E0:16", "A2:16", "A4:16", "E0:16", "A2:16", "A3:16", "A3:16"],
        ["E0:16", "A2:16", "A3:16", "E0:16", "A2:16", "A4:16", "E0:16", "A2:16"],
        ["E0:16", "A2:16", "A3:16", "E0:16", "A2:16", "A4:16", "E0:16", "A2:16", "A5:16", "E0:16", "A2:16", "A4:16", "E0:16", "A2:16", "A3:16", "A3:16"],
        ["E0:16", "A2:16", "A3:16", "E0:16", "A2:16", "A4:16", "E0:16", "A2:16"],
    ]
}



function setTitle() {
    const bandElem = $("#band");
    const titleElem = $("#title");
    titleElem.innerHTML = app.title || "No Title";
    bandElem.innerHTML = " | " +  (app.band || "No Band");
}



function getBarMeasurements() {
    const staff = $(".staff");
    const width = staff.offsetWidth
    const minNoteWidth = 10;                          
    const notesOnBar = 32;                                 // 32 * 32nd Notes Can Be Displayed
    const minBarWidth = minNoteWidth * notesOnBar;         // Min 320px Bar Widht
    const barsInTabLine = Math.floor(width / minBarWidth); // How many bars have space if bar is min 320px
    const barWidth = Math.floor(width / barsInTabLine);    // Adjust to Screen Real Estate

    app.barsInTabLine = barsInTabLine;
    return ({ barsInTabLine, barWidth });
}



// Lay Down the Tablature Sheet with Replacable Content
// Replace Only the Text when Read a Tab
function displayTabSheet(tab, rows = 1, editable = false) {   
    // Append Tablature Sheet
    const tabSheet = $("#tab-sheet");
    
    for (let row = 0; row < rows; row++) {
        // Adjust Bar Width to Screen
        const staff = $append({ tag: "div", className: "staff", parent: tabSheet });
        const { barsInTabLine, barWidth } = getBarMeasurements();
        if (barsInTabLine === 0) throw Error("No Space to Display Tab");

        // Append Bars
        for (let bar = 0; bar < barsInTabLine; bar++) {
            const id = `row${ row }-bar${ bar }`;
            const barElem = $append({ tag: "div", id, className: "bar", parent: staff });
            barElem.style.width = barWidth + "px";

            // Append Bar Chord Notes
            const fontSize = barWidth / 22 + "px"
            const barSuper = $append({ tag: "div", id: id + "-super", className: "bar-super", parent: barElem });
            barSuper.style.minHeight = fontSize;

            // Append Strings
            for (let string = 0; string < 6; string++) {
                const stringName = "eBGDAE"[string];
                const stringElem = $append({ tag: "div", className: "string", parent: barElem });
                // Append Notes
                for (let beat_i = 0; beat_i < 32; beat_i++) {
                    const noteId = `row${ row }-bar${ bar }-string${ stringName }-beat${ beat_i }`;
                    const noteElem = $append({ tag: "div", id: noteId, className: "beat", parent: stringElem });
                    noteElem.innerHTML = "—"
                    noteElem.style.minWidth = Math.floor(barWidth / 32) + "px";
                    noteElem.style.fontSize = fontSize;
                }   
            }
        }
    }
}


// Read a Tab Object and Display Its Content
function displayNotesOnTab(bars, from = 0) {
    // Delete Notes and Styling
    const noteElems = [...$all(".hasnote")];
    noteElems.forEach(noteElem => {
        noteElem.classList.remove("hasnote");
        noteElem.innerHTML = "—";
    });
    
    // Measure Note Width to Adjust Chords and Timings
    const { _, barWidth } = getBarMeasurements();
    const chordFontSize = barWidth / 32;

    // Iterate Bars
    for (let bar_i = from; bar_i < bars.length; bar_i++) {
        const rowNum = Math.floor((bar_i - from) / app.barsInTabLine);  // Calculate Row (Staff)
        const barNum = (bar_i - from) % app.barsInTabLine;              // Calculate Bar
        if ((bar_i - from) >= app.barsInTabLine * app.staffNum) return; // Stop When Run Out of Index

        // Set Bar Chords Div
        const bar = bars[bar_i];
        const barChordsDiv = $(`#row${ rowNum }-bar${ barNum }-super`);
        barChordsDiv.innerHTML = "";                                   // Clear Previous Chords
        let currentBeat = 0;                                           // Reset Beat Counter

        
        // Set Bar Number
        const absoluteBarNum = rowNum * app.barsInTabLine + barNum + from + 1;
        const barNumberDiv = $append({ tag: "div", className: "bar-number", parent: barChordsDiv });
        barNumberDiv.innerHTML = absoluteBarNum;
        
        // Iterate Beats
        for (let beat_i = 0; beat_i < bar.length; beat_i++) {
            const notesInfo = bar[beat_i];
            const [ notesStr, duration, chord ] = [...notesInfo.split(":")];
            
            // Place Note
            notesStr.split(",").map(note => {
                if (currentBeat > 31) throw Error("Couldn't Find Beat: " + currentBeat);

                const string = note.match(/E|A|D|G|B/gi)[0];
                const fret = note.match(/\d+/g)[0];
                if (!string || !note || Number(fret) > 20) throw Error("Not a Valid Note Description: " + note);
                
                const noteId = `#row${ rowNum }-bar${ barNum }-string${ string }-beat${ currentBeat }`;
                const noteElem = $( noteId );
                noteElem.classList.add("hasnote");
                noteElem.innerHTML = fret;
            });

            // Add Chord Name
            if (chord) {
                const chordTextElem = $append({ tag: "div", className: "bar-chord-txt", parent: barChordsDiv });
                chordTextElem.innerHTML = chord;
                chordTextElem.style.left = currentBeat * barWidth / 32 + 2 + "px";
                chordTextElem.style.fontSize = chordFontSize;
            }

            // Add Beat
            const add = 32 / duration;
            currentBeat += add;
        }
    }
}



const beatPerSec = app.tempo / 60;
const gameLoopFreqMs = 1000 / beatPerSec / 8;
const gameLoopTimer = setInterval(gameLoop, gameLoopFreqMs);
function gameLoop() {
    if (app.play) {
        selectBeat(app.staffNum);
        
        // On First Beat Redraw for Centering Active Bar and Notes
        if (app.currentBeat === 0) centerCursor();

        app.currentBeat++;
        // Increment Bar and Beat
        const MAXBEAT = 32;
        if (app.currentBeat === MAXBEAT) {
            app.currentBar++;
            app.currentBeat = 0;
            if (app.currentBar >= tab.bars.length) {
                play(true);
                app.currentBar = 0;
                app.currentBeat = 0;
            }
        }

        // Metronome for Every Beat
        if (app.currentBeat % 8 === 0) {
            const metronomeAudio = new Howl({ src: ["../../sounds/metronome.mp3"] });
            metronomeAudio.volume(0.1);
            metronomeAudio.play();
        }
    }
}



function centerCursor() {
    const totalBars = app.staffNum * app.barsInTabLine;

    // If Only One Row Move Left
    if (app.staffNum === 1) {
        const isOffset = app.currentBar > totalBars / 2;
        // Redraw Tab if Offset
        if (isOffset) {
            let from = app.currentBar - totalBars / 2;
            console.log(app.currentBar, from, tab.bars.length);
            if (from + app.currentBar === tab.bars.length - 1) console.log("here")
            displayNotesOnTab(tab.bars, from);
        }
    }
}



function play(pause = false) {
    const playBtn = $("#play");
    const pauseBtn = $("#pause");

    if (!pause) {
        app.play = true;
        playBtn.disabled = true;
        pauseBtn.disabled = false;
        displayNotesOnTab(tab.bars);
    }
    else {
        app.play = false;
        playBtn.disabled = false;
        pauseBtn.disabled = true;
    }
}



function selectBeat(lines) {
    if (lines === 1) {
        
        console.log();
    }
}



// Start
app.title = tab.title;
app.band = tab.band;
setTitle();
displayTabSheet(tab, app.staffNum, true);
displayNotesOnTab(tab.bars);
selectBeat();