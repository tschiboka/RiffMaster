/*
    COMMUNICATION PROTOCOL

    Definitions:
        EVENT  | BOOL  0 - 1  | Indicates a KEY DOWN Event
        STRUM  | DIGIT 1 - 6  | The Right Hand's String Activations
        STRING | DIGIT 1 - 6  | The Left Hand's Finger Vertical Position (Distance from Side of Neck)
        FRET   | DIGIT 0 - 20 | The Left Hand's Finger Horizontal Position (Distance from Saddle / 0 Reserved for Strum)

    Messaging:
        Left Hand Event:  [ EVENT, FRET, STRING ]
        Right Hand Event: [ EVENT, 00, STRUM ]

    Device Triggers a 4 Character Long Keyboard Press Sequence with a New Line at the End.
    Character Lengths: [ 1, 2, 1 ] - FRET is 2 Character Long and Single Digits are 0 Padded

    Example: 
        Play Note B1 on String 1:
            Press 7th Fret on String 1: 1071,
            Activate Strum String 1: 1001,
            Deactivate Strum String 1: 1001, 
            Release 7th Fret on String 1: 0071,        

    Note: One Simple Stroke is Broken Down to 4 Messages Consisting of Digits Followed a New Line Character.
          No Special Symbols Required to Distinguish Between Keyboard and Controller Events to Keep a Backdoor
          for Testing, Troubleshooting and Presenting without a Using a RiffMaster Controller.
*/




// Initialise App with an Empty Controller State
function initialiseAppControllerState() {
    const controllerState = {
        message: "",
        highestFretPositions: [[0], [0], [0], [0], [0], [0]],
    }
    
    return controllerState;
}



// Read a Print Line from Console or a Sequence of Keyboard Events
function controllerListener(event) {
    if (!app.musicAgreement) return;
    
    // Listen to Only Key Downs as Message is Passed as a Sequence of KeyStrokes
    if (event.type !== "keydown") {                                                     
        // If Key is Digit
        if (event.key >= "0" && event.key <= "9") {                                      // If Digit
            app.controllerState.message += event.key;                                    // Concatinate Message

            if (app.controllerState.message.length === 4) {                              // Attempt to Decode Every 4 Digit
                translateConsoleMessage(app.controllerState.message);                    // Call Decode
            }
        }
        else app.controllerState.message = "";                                           // Otherwise Clear Message
    }
}


// Translate a Keypress Message Containing 4 Digits
function translateConsoleMessage(message) {
    const event = parseInt(message[0]);                                                   // Pressed or Released
    const fret =  parseInt(message[1] + message[2]);                                      // Fret 0 - 20
    const string = parseInt(message[3]);                                                  // String 0 - 6

    if (event > 1 || string > 6 || string === 0 || fret > 20) return app.controllerState.message = ""; // Reset

    // Strum
    if (fret === 0) {
        handleStrumActivated(event, string);                                               // Strum Event
    }
    
    // Fret Position
    else {                                                                                 // Fret Event
        let positionsOnString = app.controllerState.highestFretPositions[string - 1];      // Get Finger Positions on String
        // If Fret Pressed
        if (event === 1) {
            positionsOnString.push(fret);                                                  // Append Current Positions
            positionsString = positionsOnString.sort((a, b) => a - b);                     // Sort Ascending
            positionsOnString = [ ...(new Set(positionsOnString)) ];                       // Disallow Repeatition
            app.controllerState.highestFretPositions[string - 1] = positionsOnString;      // Save Position
        }
        // Fret Released
        else {
            const index = positionsOnString.indexOf(fret);                                 // Find Index of Removable Position
            positionsOnString.splice(index, 1);                                            // Remove Position
            app.controllerState.highestFretPositions[string - 1] = positionsOnString;
        }

        handleFretActivated(event, fret, string);
    }
    
    app.controllerState.message = "";
}