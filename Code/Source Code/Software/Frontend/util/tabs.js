// Tabs are Read from a Source and Translated into a Tab Object.
// Tab Object's Syntax Discription:
//     title:     The Title of the Song,
//     band:      Band Name,
//     tempo:     Beat per Second (120 Default)
//     bars:      An Array of Bar (4 * 4th Beat of Notes)
    
// One Bar Consists of 32 Notes (Fastest Beat Represented is a 1/32)
// A 32nd Note Beat Syntax Description:
//     "Notes:Start:Duration:ChordName"
//     Notes:     String Char (E|A|D|G|B|e) and Fret Number | Empty String
//     Start:     N of 32nd (0 - 31)
//     Duration:  W:whole, H:Half, Q:Quarter, E:Eight, X:Sixteenth, T:Thirtysecondth .:Extended ..: Long-Extended -:Rest
//     Chord:     Chord Name (Em7, G#, ...)



// Validate Tab Formatting and Values; Return a Boolean
function validateTabFormatting(tab) {
    const indexPage = "http://127.0.0.1:5501/Frontend/index.html";
    const color = "mediumOrchid";
    const actionButtons = [
        { text: "Back", color, callback: () => $redirect(indexPage) },
        { text: "OK" }
    ];
    const headerText = "Tablature Format Error";
    let msg = "";

    if (!tab) msg = "The Provided Tab is Undefined and Cannot Be Loaded!";
    else {
        if (!tab.tempo) msg = "The Provided Tab Must Have a Tempo!";
        else if (isNaN(tab.tempo)) msg = "The Provided Tab Must Have a Tempo in the Form of a Number!";
        else if (tab.tempo < 20) msg = "The Minimum Tab Tempo is 20!";
        else if (tab.tempo > 300) msg = "The Maximum Tab Tempo is 300!";
        else {
            const bars = tab.bars;
            if (bars) {
                bars.forEach(bar => bar.forEach(note => {
                    const [ noteStr, start, duration, chord] = note.split(":");
                    const notes = noteStr.split(",");
                    
                    notes.forEach(n => {
                        const isValidFormat = /^[a-z]\d\d?$/i.test(n);
                        if (!isValidFormat) msg = "Invalid Note Format!<br />" + note;
                       
                        const string = n.match(/E|A|D|G|B/gi)?.[0];       // Get the String Letter
                        if (!string) msg = "Missing or Invalid String Value!<br />" + note;
                        
                        const fret = n.match(/\d+/g)?.[0];                // Get the Fret Number
                        if (isNaN(fret)) msg = "Fret Must be a Number!<br />" + note;
                        if (Number(fret) > 20) msg = "Fret Number Must Be Between 0 and 20!<br />" + note;
                    });
                
                    if (isNaN(start) || isNaN(parseInt(start))) msg = "Start Must Be a Number!<br />" + note;
                    if (Number(start) < 0 || Number(start) > 31) msg = "Start Must Be Between 0 and 32!<br />" + note;

                    if (!duration) msg = "Invalid Duration!<br />" + note;
                    if (!duration.match(/^[whqext]\.?\.?$/ig)) msg = "Invalid Duration!<br />" + note;
                }));
            }
        }
    }
    
    const content = msg;
    if (msg.length) $fullScreenMessage({ headerText, content, actionButtons });
    return !msg.length;
}



// Set the Title and Band of the Tablature and Tempo
function setTabTitle(tab) {
    const bandElem = $("#band");                                  // Get Band Element
    const titleElem = $("#title");                                // Get Title Element
    const tempoElem = $("#tempo");                                // Get Tempo Element
    const { title, band, tempo } = { ...tab };                    // Get Tab Info
    const tempoNames = [
        { name: "Grave", maxBPM: 20 },
        { name: "Lento", maxBPM: 60 },
        { name: "Larghetto", maxBPM: 66 },
        { name: "Adagio", maxBPM: 76 },
        { name: "Andante", maxBPM: 108 },
        { name: "Moderato", maxBPM: 120 },
        { name: "Allegro", maxBPM: 156 },
        { name: "Vivace", maxBPM: 168 },
        { name: "Presto", maxBPM: 200 },
        { name: "Prestissimo", maxBPM: 208 },
    ];

    const tn = tempoNames.map(t => t.maxBPM <= tempo && t).filter(t => !!t);
    const tempoName = tn[tn.length - 1].name;

    titleElem.innerHTML = title || "No Title";                    // Set Title
    bandElem.innerHTML = "&nbsp;|&nbsp;" +  (band || "No Band");            // Set Band
    tempoElem.innerHTML = `[ &#119135; = ${ tempo } - ${ tempoName } ]`; // Set Tempo
}



// Get How Many Bars Can Fit Screen and Staff Width
function getBarMeasurements() {
    const padding = 80;
    const staff = $(".staff");                                     // Get Staff Element
    const width = staff.offsetWidth - padding;                     // Staff (Cotta Lines) Width
    const minNoteWidth = 10;                                       // Minimum Note Width
    const notesOnBar = 32;                                         // 32 * 32nd Notes Can Be Displayed
    const minBarWidth = minNoteWidth * notesOnBar;                 // Min 320px Bar Widht
    const barsInTabLine = Math.floor(width / minBarWidth);         // How Many Bars Have Space If Bar is Min 320px
    const barWidth = Math.floor(width / barsInTabLine);            // Adjust to Screen Real Estate

    app.barsInTabLine = barsInTabLine;
    return ({ barsInTabLine, barWidth });
}




// Lay Down the Tablature Sheet Structure with Replacable Content
// Replace Only the Text when Read a Tab
function displayTabSheet(tab, rows = 1, editable = false) {   
    // Append Tablature Sheet
    const tabSheet = $("#tab-sheet");                              // Get Tab Sheet Element
    
    for (let row = 0; row < rows; row++) {                         // Number of Bar Rows (Default 1)
        // Adjust Bar Width to Screen
        const staff = $append({ tag: "div", className: "staff", parent: tabSheet });  // Add Staff Element (Horizontal Separator Bar)
        const { barsInTabLine, barWidth } = getBarMeasurements();  // Get How Many Bars Can Fit Screen and Staff Width
        if (barsInTabLine === 0) throw Error("No Space to Display Tab"); // Error If No Space for Bars

        // Fill Up Staff with Bars
        for (let bar = 0; bar < barsInTabLine; bar++) {            // Iterate Bar Spaces
            const id = `row${ row }-bar${ bar }`;                  // Create ID String
            const barElem = $append({ tag: "div", id, className: "bar", parent: staff });  // Create Empty Bar Element
            barElem.style.width = barWidth + "px";                 // Set Width

            // Append Bar Chord Notes
            const fontSize = barWidth / 22 + "px";                 // Calculate Font Size 
            const barSuper = $append({ tag: "div", id: id + "-super", className: "bar-super", parent: barElem });  // Add Line Above Staff
            barSuper.style.minHeight = fontSize;                   // Set Height of Line Above Stuff


            // Add String Lines to Bar
            for (let string = 0; string < 6; string++) {           // Iterate Strings 0 - 5
                const stringName = "eBGDAE"[string];               // Get String Name
                const stringElem = $append({ tag: "div", className: "string", parent: barElem });  // Create String Element

                // Append Notes
                for (let beat_i = 0; beat_i < 32; beat_i++) {      // Iterate Beats 0 - 31
                    const noteId = `row${ row }-bar${ bar }-string${ stringName }-beat${ beat_i }`;  // Create Note ID String
                    const noteElem = $append({ tag: "div", id: noteId, className: "beat", parent: stringElem }); // Create Note Element
                    noteElem.classList.add("note-" + beat_i);
                    noteElem.innerHTML = "—";                      // Add a Hyphen - As the Content
                    noteElem.style.minWidth = Math.floor(barWidth / 32) + "px"; // Set Minimum Note Width
                    noteElem.style.fontSize = fontSize;            // Set Font Size
                }   
            }

            // Duration Box
            const durationBoxElem = $append({ tag: "div", className: "duration-box", parent: barElem });  // Create Duration Box Element
            for (let beat_i = 0; beat_i < 32; beat_i++) {          // Iterate Beats 0 - 31
                const durationElem = $append({ tag: "div", className: "duration", id:`row${ row }-bar${ bar }-duration${ beat_i }`, parent: durationBoxElem });
                durationElem.classList.add("duration-" + beat_i);  // Add Duratiion Beat Class
                durationElem.style.width = Math.floor(barWidth / 32) + "px"; // Set Minimum Note Width
                $append({ tag: "div", parent: durationElem });
            }
        }
    }
}



// Clear Notes and Styling from Any Previous Displays
function clearTabStyling() {
    const noteElems = [...$all(".hasnote")];                       // Select All Elements with HASNOTE Class Name
    noteElems.forEach(noteElem => {                                // Iterate Note Elements
        noteElem.classList.remove("hasnote");                      // Remove HASNOTE Class
        noteElem.innerHTML = "—";                                  // Reset Content to -
    });
    const chordNameDivs = [...$all(".bar-super")];                 // Get All Chord Name Divisions
    chordNameDivs.forEach(div => div.innerHTML = "");              // Clear Chords
    const highlightedBars = [...$all(".bar")];                     // Get All Highlighted Bars
    highlightedBars.forEach(b => b.classList.remove("highlight")); // Remove Highlight
    const durations = [...$all(".duration")];                      // Get All Highlighted Bars
    durations.forEach(d => {
        d.classList.remove(...d.classList);                        // Remove Every Class
        d.classList.add("duration");                               // Add Duration Class Back
    });
}



// Read a Bars and Display Their Content From a Given Bar
function displayNotesOnTab(bars, from = 0) {
    clearTabStyling();                                             // Clear Previous Tab Styling
    // Measure Note Width to Adjust Chords and Timings
    const { _, barWidth } = getBarMeasurements();                  // Get Bar Width
    const chordFontSize = barWidth / 32;                           // Set Chord Font Size

    // Iterate Bars
    if (from < 0) from = 0;                                        // Do Not Let From Negative Index
    for (let bar_i = from; bar_i < bars.length; bar_i++) {         // Cycle Through Bars From the Given Bar Index
        const rowNum = Math.floor((bar_i - from) / app.barsInTabLine);  // Calculate Row (Staff)
        const barNum = (bar_i - from) % app.barsInTabLine;         // Calculate Bar
        if ((bar_i - from) >= app.barsInTabLine * app.staffNum) return; // Stop When Run Out of Bars

        // Set Bar Chords Div
        const bar = bars[bar_i];                                   // Get Current Bar
        const barChordsDiv = $(`#row${ rowNum }-bar${ barNum }-super`); // Get Bar Chords Div (Above Staff)
        barChordsDiv.innerHTML = "";                               // Clear Previous Chords

        
        // Set Bar Number
        const absoluteBarNum = rowNum * app.barsInTabLine + barNum + from + 1; // Calculate the Displayed Bar Number
        const barNumberDiv = $append({ tag: "div", className: "bar-number", id: "bar-number-" + absoluteBarNum ,parent: barChordsDiv }); // Create Bar Number Div
        barNumberDiv.innerHTML = absoluteBarNum;                   // Display Bar Number
        
        // Iterate Beats
        for (let beat_i = 0; beat_i < bar.length; beat_i++) {      // Traverse Each Note in a Bar
            const noteItem = bar[beat_i];                          // Get the Note from the Bar
            const [ notesStr, start, duration, chordName ] = [...noteItem.split(":")]; // Deconstruct Note and Get Details

            
            // Place Note
            notesStr.split(",").map(note => {                      // Iterate Note String (Each May Have Multiple Individual Notes Eg.: E0A2 is Note E0 and Note A2)
                const string = note.match(/E|A|D|G|B/gi)[0];       // Get the String Letter
                const fret = note.match(/\d+/g)[0];                // Get the Fret Number
                
                const noteId = `#row${ rowNum }-bar${ barNum }-string${ string }-beat${ start }`; // Create an ID for the Note Element
                const noteElem = $( noteId );                      // Get Note Element by Its ID
                if (noteElem.classList.contains("hasnote")) noteElem.classList.add("has-multiple-notes");
                else noteElem.classList.add("hasnote");            // Add HASNOTE Class to Note Element
                noteElem.innerHTML = fret;                         // Add the Corresponing Fret Number
            });

            // Add Chord Name
            if (chordName) {                                       // If Note Has a Chord Name Provided
                const chordTextElem = $append({ tag: "div", className: "bar-chord-txt", parent: barChordsDiv }); // Create Chord Name Element
                chordTextElem.innerHTML = chordName;               // Add Chord Text
                chordTextElem.style.left = start * barWidth / 32 + 2 + "px"; // Set Left Position
                chordTextElem.style.fontSize = chordFontSize;      // Set Font Size
            }

            // Add Beat Duration
            const durationID = `#row${ rowNum }-bar${ barNum }-duration${ start }`; // Create the Note Duration ID
            const durationDiv = $(durationID);                     // Get Duration Element
            durationDiv.classList.add("duration-type-" + duration.replace(/\./g, "-").toLowerCase()); // Add the Appropriate Note Duration Class
        }
    }
}
