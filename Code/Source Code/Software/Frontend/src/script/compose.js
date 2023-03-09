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

const app = {
    title: undefined,
    band: undefined,
    tempo: 120,       // Beat per Minute
    play: false,
    currentBar: 0,
    currentBeat: 0,
    staffNum: 1,      // Number of 6 of Lines (Strings) Displayed Horizontally
    displayFromBar: 0, // Start Displaying the Tab from a Certain Bar
}
