const chords = getChords()
const app = {
    rootNote: "C",                   // Root such as C, C#, Bb, Ab
    chordType: "",                   // Type m, m7, 9, dim
    base: ""                         // "" or /D, /Ab, /c#
}


function start() {
    const chordName = getChordName();
    const displayProps = {
        chordNames: [ chordName ],  //,["A", "Bm7", "C#9", "E"],
        fingerVersions: [0, 3, 2, 20],
        all: true
    }
    displayChordList(displayProps);
    createOptionButtons();
    highLightActiveBtns();
}



function displayChordList(props) {
    const { chordNames, fingerVersions, all } = { ...props };
    const parent = $(".chords-list");
    parent.innerHTML = "";
    let chordList = []                                                 // Set Empty Chordlist

    if (all) {
        // Create a Complete Chord List with ALL the Items Under ONE Specific Name
        if (chordNames.length > 1) throw Error("Display set to DISPLAY ALL! Names parameter expect an array of string of 1");
        
        // Display Chords
        const chordList = chords[chordNames[0]] || [];                 // Extract List with Key Name
        for (let i = 0; i < chordList.length; i++)                     // Iterate List
            displayChord(chordList[i], parent, chordNames[0]);         // Display ALL Chords

        // Set Chord List Filter and Chord Info
        const filterInfoDOM = $("#chord_search__filter-info");          // Get Info Element 
        const chordsLength = Object.keys(chords).length;                // Get List Length
        filterInfoText = `${ chordList.length } / ${ chordsLength }`;   // Create Info Text
        filterInfoDOM.innerHTML = filterInfoText;                       // Add Text
        const chordInfoDOM = $("#chord_search__chord-info");            // Get Info Element 
        chordInfoDOM.innerHTML = getChordName();
    }
    else {
        // Create Chord List with Specified Versions
        // Check Names and Versions
        const namesLength = chordNames.length;
        const versionsLength = fingerVersions.length;
        const versionLengthMathes = namesLength === versionsLength;
        if (namesLength && versionsLength && !versionLengthMathes) 
            throw Error("Versions and Names Argument Must Match");
        
        for (let i = 0; i < chordNames.length; i++) {                   // Iterate Names
            const name = chordNames[i];                                 // Extract Name
            const version = fingerVersions[i];                          // Extract Version
            const chordVersionList = chords[chordNames[0]]              // Get Firs Elem of Cords Versions

            if (!chordVersionList) throw Error("No Chord with name: " + name); // Chords Not Found
            if (version >= chordVersionList.length) {                   // Version not Found
                const maxIndex = chordVersionList.length - 1;           // Get Max Index
                const msg = `Chord Finger Version ${ version } not Found! \nMAX: ${ maxIndex }`;
                throw Error(msg);
            }
            chordList.push(chords[chordNames[i]][fingerVersions[i]]);   // Append Chord List
            displayChord(chordList[i], parent, chordNames[i]);          // Display ALL Chords
        }
    }
}



function displayChord(chord, parent, name, unitPx = 16) {
    // Create Chord Element
    const chordElem = $append({ tag: "div", className: "chord", parent});
    chordElem.style.height = unitPx * 12 + "px";
    chordElem.dataset.positions = chord.positions.join(",")
    
    const chordNameElem = $append({ tag: "span", className: "chord-name", parent: chordElem });
    chordNameElem.innerHTML = name;

    const pos = chord.positions;                          // Extract Positions
    const fin = chord.fingerings[0];                      // Get Finger Positions
    const posNums = pos.filter(p => p !== "x");           // Filter Numbers Only
    const posNumsNoZero = posNums.filter(p => p !== "0"); // Filter Numbers Only
    const min = Math.min(...posNumsNoZero);               // Get Smallest Number Except 0
    const max = Math.max(...posNums);                     // Get Greatest Number
    const posRange = max - min + 1;                       // Get Finger Position Range
    const base = max <= 4 ? 0 : min;                      // Calculate Base Fret

    // Create a 7 x 9 Pixel Unit SVG DOM Element
    svg = $append({ tag: "svg", parent: chordElem, ns: "svg" });
    svg.setAttribute("width", unitPx * 7);
    svg.setAttribute("height", unitPx * 10);
    svg.style.background = "rgba(0, 0, 0, 0.3)";

    // Frets
    const topLine = `<line x1=${ unitPx } y1=${ unitPx } x2=${ 6 * unitPx } y2=${ unitPx } style="stroke: #999; stroke-width:2;" />`;
    svg.innerHTML += topLine;

    const fretNum = posRange > 4 ? posRange : 4;
    for (i = 1; i <= fretNum; i++) {
        const string = `<line x1=${ unitPx } y1=${ unitPx * (i * 2 + 1) } x2=${ unitPx * 6 } y2=${ unitPx * (i * 2 + 1) } style="stroke: #444; stroke-width:1" />`;
        svg.innerHTML += string;
    }
    
    // Strings
    for (i = 1; i <= 6; i++) {
        if (pos[i - 1] === "x") {
            const string = `<line x1=${ unitPx * i } y1=${ unitPx } x2=${ unitPx * i } y2=${ unitPx * 10 } style="stroke: #555; stroke-width:1" />`;
            svg.innerHTML += string;
        }
        else {
            const string = `<line x1=${ unitPx * i } y1=${ unitPx } x2=${ unitPx * i } y2=${ unitPx * 10 } style="stroke: #999; stroke-width:1" />`;
            svg.innerHTML += string;
        }
    }

    // Dots
    for (i = 1; i <= 6; i++) {
        if (pos[i - 1] !== "x") {
            const x = i * unitPx;
            const y = (pos[i - 1] * 2 + 0.5) * unitPx;
            if (pos[i - 1] === "0")  {
                const dot = `<circle cx=${ x } cy=${ y - 3 } r=${ unitPx * 0.25 } } style="stroke: #999; stroke-width:2; fill:#aaa" />`;
                svg.innerHTML += dot;
            }
            else  {
                if (base === 0) {
                    const dot = `<circle cx=${ x } cy=${ y } r=${ unitPx * 0.4 } } style="stroke: #888; stroke-width:2; fill:#444" />`;
                    svg.innerHTML += dot;
                }
                else {
                    const _y = ((pos[i - 1] - base + 1) * 2 + 0.5) * unitPx;
                    const dot = `<circle cx=${ x } cy=${ _y } r=${ unitPx * 0.4 } } style="stroke: #888; stroke-width:2; fill:#444" />`;
                    svg.innerHTML += dot;
                }
            }
        }
    }

    // Find Barre Fret Positions (When One Finger Touches Across Multiple Strings)
    function getBarres(pos, fing) {
        const multiTouches = []                                            // Create Result Array
        const noFinger0 = fing.filter(f => f !== "0");                     // 0 Finger Cannot be Barre
        const isMultitouch = noFinger0.length !== new Set(noFinger0).size; // Check for Size Difference
        if (!isMultitouch) return multiTouches;                            // Return Empty If No Difference

        for (let i = 0; i < 6; i++) {                                      // Iterate Finger Positions
            if (fing[i] !== "0" && !multiTouches.find(t => t.finger === fing[i])) { // If F Position is NOT 0
                const start = i;                                           // Start Counting from I
                let end = i;                                               // Set End Initially I

                for (let j = i + 1; j < 6; j++) {                          // Look Ahead
                    if (fing[i] === fing[j]) end = j;                      // If Same Finger Found Set End
                }
                if (start !== end) multiTouches.push({ 
                    finger: fing[i],
                    position: pos[i],
                    start, end
                });
            }
        }
        return multiTouches;
    }
    const barres = getBarres(pos, fin);
    
    barres.forEach(barre => {
        const x = (barre.start + 0.6) * unitPx;
        const y = ((barre.position - base + 1.05) * 2) * unitPx;
        const width = (barre.end - barre.start + 0.8) * unitPx;
        const bar = `<rect x=${ x } width=${ width } y=${ y } height=${ unitPx * 0.8 } rx=${ unitPx / 2 } } style="stroke: #888; stroke-width:2; fill:#444" />`;
        svg.innerHTML += bar;
    });

    // String Position Texts
    for (i = 1; i <= 6; i++) {
        if (pos[i - 1] !== "0") {
            const txt = $append({ tag: "span", className: "chord-number", parent: chordElem });
            txt.innerHTML = pos[i - 1].toUpperCase();
            txt.style.width = unitPx + "px";
            const x = i * unitPx - 0.5 * unitPx;
            txt.style.fontSize = unitPx - 2 + "px";
            txt.style.top = unitPx * 1.5 - 2 + "px";
            txt.style.left = x + "px";

            if (pos[i - 1] === "x") txt.style.color = "#fff";
        }
    }

    // Fret Number Texts
    for (i = 1; i <= fretNum; i++) {
        const txt = $append({ tag: "span", className: "fret-number", parent: chordElem });
            txt.innerHTML = base === 0 ? base + i : base + i - 1;
            txt.style.width = unitPx + "px";
            const y = i * unitPx * 2 + 2 * unitPx;
            txt.style.fontSize = unitPx - 2 + "px";
            txt.style.top = y + "px";
            txt.style.left = "0 px";

            if (i === 0) txt.style.color = "#aaa";
            else txt.style.color = "#555";
    }
}



function createTypeButtons() {
    const rootNote = app.rootNote;
    const types = [];
    const names = Object.keys(chords);
    const extendedKeys = ["C#", "Db", "D#", "Eb", "F#", "Gb", "G#", "Ab", "A#", "Bb"];

    // Select Chords with the Root Note
    for (let i = 0; i < names.length; i++) {
        const subName = rootNote.substring(0, rootNote.length);
        const key = names[i];
        const subKey = key.substring(0, rootNote.length);

        // Ignore C# F# etc When Root Note is C, F
        let correctRoot = true;
        if (rootNote.length === 1) {                               
            const first2Char = key.substring(0, 2);
            if (extendedKeys.includes(first2Char)) correctRoot = false;
        }

        // Get Rid of Slashes
        const base = (key.match(/\/.+/g) || [""])[0];
        let correctBase = app.base === base;

        // Correct
        if ((subKey === subName) && correctRoot && correctBase) {
            let chordType = key.replace(base, "");
            chordType = chordType.replace(rootNote, "")
            types.push(chordType);
        }
    }

    types.sort((a, b) => a > b);
    types.forEach(type => {
        const typeBtn = $append({
            tag: "button",
            id: type + "-btn",
            className: "type-btn",
            parent: $("#chords-filter__type-list")
        });
        typeBtn.innerHTML = type || "-";
    });
}

$(".chords-filter").addEventListener("click", e => {
    const value = e.target.id.replace("-btn", "");
    let chordName = "";

    if (e.target.classList.contains("key-btn")) {
        app.rootNote = value;
        app.base = "";
    }
    else if (e.target.classList.contains("type-btn")) {
        app.chordType = value;
    }
    else if (e.target.classList.contains("base-btn")) {
        app.base = "/" + value;
    }
    
    // Same Root and Name is NOT Possible eg: E/E, F#m7/F
    if (app.rootNote === app.base.replace(/\//, "")) app.base = "";

    // Redraw Chord List
    const displayProps = {
        chordNames: [ getChordName() ],  //,["A", "Bm7", "C#9", "E"],
        fingerVersions: [],
        all: true
    }
    displayChordList(displayProps);
    highLightActiveBtns();
})

function createOptionButtons() {
    const keys = ["C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"];
    const selectionList = $("#chords-filter__type-list");
    selectionList.innerHTML = "";  
    
    ["key", "base"].forEach(type => {
        keys.forEach(k => {
            const parent = $(`.${ type }note-btns__btn-list`);
            const btn = $append({ tag: "button", id: k + "-btn", className: type + "-btn", parent});
            btn.innerHTML = type === "key" ? k : "/" + k;
        });
    });
    
    createTypeButtons();
}



function getChordName() {
    const root = app.rootNote;                         // Start with Key
    const type = app.chordType;                        // Add Chord Type
    const base = app.base;                             // Delete Slash If No Base
    return root + type + base;
}



function highLightActiveBtns() {
    // Root Note Button Highlight
    [...$all(".key-btn")].forEach(b => {
        b.classList.remove("active");
        if (b.id.replace("-btn", "") === app.rootNote) b.classList.add("active");
    });

    // Chord Type Button Highlight
    [...$all(".type-btn")].forEach(b => {
        b.classList.remove("active");
        if (b.id.replace("-btn", "") === app.chordType) b.classList.add("active");
    });

    // Base Note Button Highlight
    [...$all(".base-btn")].forEach(b => {
        b.classList.remove("active");
        if (b.id.replace("-btn", "") === app.base.replace("/", "")) b.classList.add("active");
    });
}



// Play Chords when User Clicks on Chord Image
$(".chords-list").addEventListener("click", soundChord);
function soundChord(e) {
    // Get Notes of the Chord
    const positions = e.target.dataset.positions.split(",");
    const guitarNotes = ["E2", "F2", "Fs2", "G2", "Gs2", "A2", "As2", "B2", "C3", "Cs3", "D3", "Ds3", "E3", "F3", "Fs3", "G3", "Gs3", "A3", "As3", "B3", "C4", "Cs4", "D4", "Ds4", "E4", "F4", "Fs4", "G4", "Gs4", "A4", "As4", "B4", "C5", "Cs5", "D5", "Ds5", "E5", "F5", "Fs5", "G5", "Gs5", "A5", "As5", "B5", "C6"];
    const notes = [];

    positions.forEach((p, i) => {
        if (p !== "x") {
            const stringJump = [0, 5, 10, 15, 19, 24][i];
            const note = guitarNotes[stringJump + Number(p)];
            if (note) notes.push(note);
        }
    });
    
    // Play Notes
    const dir = "../../sounds/"
    const lastNote = notes.length;
    let i = 0;
    const soundTimer = setInterval(() => {
        const sound = new Howl({ src: [dir + notes[i] + ".mp3"] });
        sound.play();
        if (++i === lastNote) clearInterval(soundTimer);
    }, 100);
}