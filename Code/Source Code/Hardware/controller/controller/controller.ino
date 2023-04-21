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

    Example (Play Note B1 on String 1):
        Press 7th Fret on String 1: 1071,
        Activate Strum String 1: 1001,
        Deactivate Strum String 1: 0001, 
        Release 7th Fret on String 1: 0071,        
*/

#include <Keyboard.h>                                                // Use Keyboard Library to Communicate with Devices

// Global Variables
const byte COLUMN_PINS[20] = {                                       // Column PINs (Frets): Put Voltage Through
    16, 17, 18, 19, 20,                                              // PIN: 16 - 20  |  Fret:  1 - 5 
    21, 22, 23, 24, 25,                                              //      21 - 25  |  Fret:  6 - 10
    26, 27, 28, 29, 30,                                              //      26 - 30  |  Fret: 11 - 15
    31, 32, 33, 34, 35 };                                            // 
const byte ROW_PINS[6] = { 7, 6, 5, 4, 3, 2 };                       // Row PINs (Strings): Read Voltage on a Fret
const byte STRUM_PINS[6]  = {A0, A1, A2, A3, A4, A5};                // Analogue Pins as Digital Pins
const byte COL_LEN = sizeof(COLUMN_PINS);                            // Number of Frets
const byte ROW_LEN = sizeof(ROW_PINS);                               // Number of Strings
const int BAUD = 9600;//2000000;                                     // Serial Base-Clock Frequency (Highest)
const byte BLU_LED = 13;                                             // Blue LED Pin (User Interaction: For Testing Purposes and for Fun)
const byte GRE_LED = 12;                                             // Green LED Pin (Toggle Switch On)
const byte RED_LED = 11;                                             // Red LED Pin (USB On)                                
const byte TOG_IN  = 10;                                             // Toggle Switch Input Pin
const byte TOG_OUT = 9;                                              // Toggle Switch Output Pin
const int maxAllowedDebounceTime = 20;                               // Set the Debounce Time to Prevent Uninitiated Button Presses



// Console States
// Left Hand Inputs
bool newFretState[ROW_LEN][COL_LEN] = {                              // State of Fret Positions Switches
    { 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 },
    { 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 },
    { 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 },
    { 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 },
    { 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 },
    { 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 },
};
bool oldFretState[ROW_LEN][COL_LEN] = {                              // Store Old State to Compare to New in Every Loop
    { 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 },
    { 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 },
    { 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 },
    { 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 },
    { 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 },
    { 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 },
};
unsigned long debounceFret[ROW_LEN][COL_LEN] = {                     // Store Last Message Sending Time for Debounce Control
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
};

// Right Hand States
bool newStrumState[6] = { 1, 1, 1, 1, 1, 1 };                        // State of Strum String Switches
bool oldStrumState[6] = { 1, 1, 1, 1, 1, 1 };                        // Store Old State to Compare to New in Every Loop
unsigned long debounceStrum[6] = { 0, 0, 0, 0, 0, 0 };               // Store Last Message Sending Time for Debounce Control

// Controller Body Displays
bool onConnected = 1;                                                // USB Cable Powered the Device        |  LED-Red
bool onState = 0;                                                    // Indicates If Device Switch is ON    |  LED-Green
bool transactionState = 0;                                           // USB Communication Activity          |  LED-Blue




// Run When USB Connected
void setup() {
    //  FRETS INIT 
    for (byte ci = 0; ci < COL_LEN; ci++) {                          // Cycle through Columns (Frets)
        pinMode(COLUMN_PINS[ci], INPUT_PULLUP);                      // Column Pull-Up Resistor ON   
    	  digitalWrite(COLUMN_PINS[ci], HIGH);                         // Set Voltage High
    }
    
    // STRING INIT
    for (byte ri = 0; ri < ROW_LEN; ri++){                           // Cycle Rows (Strings)
        pinMode(ROW_PINS[ri], OUTPUT);                               // Set Row as Output
    }

    // STRUM INIT
    for (byte i = 0; i < 6; i++) {                                   // Cycle Strum PINS
        pinMode(STRUM_PINS[i], INPUT_PULLUP);                        // Built In Pullup On
        digitalWrite(STRUM_PINS[i], HIGH);                           // Set Strum High as Default
    }

    // LED INIT
    pinMode(RED_LED, OUTPUT);                                        // Initialise LEDs 
    pinMode(GRE_LED, OUTPUT);
    pinMode(BLU_LED, OUTPUT);
    digitalWrite(RED_LED, LOW);
    digitalWrite(GRE_LED, LOW);
    digitalWrite(BLU_LED, LOW);

    // TOGGLE INIT
    pinMode(TOG_IN, INPUT_PULLUP);                                   // Initialise Toggle Switch
    pinMode(TOG_OUT, OUTPUT);
  
    Serial.begin(BAUD);                                              // Start Serial Communication
}



// Display the State on Serial Monitor | Use for Testing and Troubleshooting the Device
void printState(short frequency = 0) {
    for (byte ri = 0; ri < ROW_LEN; ri++) {                          // Traverse Rows (Strings)
        const char stringNames[6] = {'E', 'A', 'D', 'G', 'B', 'e'};  // From Lowest to Highest    
        Serial.print(stringNames[ri]);                               // Display String Name
        Serial.print(" |");                                       
        for (byte ci = 0; ci < COL_LEN; ci++) {                      // Traverse Columns (Frets)
            Serial.print(oldFretState[ri][ci]);                      // Display Old State
            Serial.print(newFretState[ri][ci]);                      // Display New State
            Serial.print("|");
        }

        Serial.println();                                            // New Line Between Rows
    }
    if (frequency) delay(frequency);                                 // Optionally Delay Frequency of Loop (Only for Testing Purposes)
}




// Controller Main Loop
void loop() {
    // Green and Red LEDs (USB Communication ON / OFF)
    const bool TOG_STATE = digitalRead(TOG_IN);                      // Read Toggle State
    onState = TOG_STATE;                                             // Set Global Toggle State

    if (onConnected == 1 && onState == 0) {                          // If Toggle OFF Only Red LED HIGH
        digitalWrite(GRE_LED, LOW);
        digitalWrite(RED_LED, HIGH);
    }
    else if (onConnected == 1 && onState == 1) {                     // Off Toggle ON Only Green LED HIGH
        digitalWrite(GRE_LED, HIGH);  
        digitalWrite(RED_LED, LOW);
    }

    setState();                                                      // Store Old State and Set New One
    digitalWrite(BLU_LED, transactionState);

    // Send New State if Changes Detected and Transaction Allowed (Toggle is ON)
    const bool fretStateChanged = getFretStateChanged();                   // Has Fret State Changed
    const bool strumStateChanged = getStrumStateChanged();                 // Has Fret State Changed

    if (onState && (fretStateChanged || strumStateChanged)) {        // If Communication is On and Either Input Changed
      sendState();                                                   // Send Message Through USB Serial
      //printState();                                                // Display State on Serial Monitor
    }
}



// Set the Controller's State Variables (Global Vars) and Detect Fret and Strum Presses
void setState() {
    transactionState = false;
    for (byte ri = 0; ri < ROW_LEN; ri++) {                          // Traverse Rows (Strings)
        digitalWrite(ROW_PINS[ri], LOW);                             // Set Row Voltage LOW
        
        for (byte ci = 0; ci < COL_LEN; ci++) {                      // Traverse Columns (Frets)
            oldFretState[ri][ci] = newFretState[ri][ci];             // Store Previous State

            const byte COL_READ = digitalRead(COLUMN_PINS[ci]);      // Read Column Voltage
            newFretState[ri][ci] = COL_READ;                         // Set New Fret State

            if (COL_READ == 0) transactionState = true;              // Set Blue LED ON when User Interacts with Fret Board
        }
  
        digitalWrite(ROW_PINS[ri], HIGH);                            // Reset Row Voltage HIGH   
    }

    for (byte i = 0; i < 6; i++) {                                   // Traverse Strums
        oldStrumState[i] = newStrumState[i];                         // Store Previous State
        newStrumState[i] = digitalRead(STRUM_PINS[i]);               // Set New Strum State

        if (newStrumState[i] == 0) transactionState = true;          // Set Blue LED ON when User Interacts with Fret Board
    }
}



// Compare Old and New Fret State and Return a Boolean
bool getFretStateChanged() {
    for (byte ri = 0; ri < ROW_LEN; ri++) {                          // Iterate Rows (Strings)
        for (byte ci = 0; ci < COL_LEN; ci++) {                      // Iterate Columns (Frets)
            bool oldState = oldFretState[ri][ci];                    // Get Old Fret Position
            bool newState = newFretState[ri][ci];                    // Get New Fret Position
  
            if (oldState != newState) return true;                   // Early Stopping
        }
    }
    return false;                                                    // Return Default False
}



// Compare Old and New Strum State and Return a Boolean
bool getStrumStateChanged() {
    for (byte i = 0; i < 6; i++) {                                   // Traverse Strums
        if (oldStrumState[i] != newStrumState[i]) return true;       // Early Stopping
    }

    return false;                                                    // Return Default False
}



// Send State Changes as Keyboard Events
void sendState() {
    const unsigned long currentTime = millis();                      // Get the Current Time
    // Read Fret State
    for (byte ri = 0; ri < ROW_LEN; ri++) {                          // Iterate Rows (Strings)
        for (byte ci = 0; ci < COL_LEN; ci++) {                      // Iterate Columns (Frets)
            bool oldState = oldFretState[ri][ci];                    // Get Old Fret Position
            bool newState = newFretState[ri][ci];                    // Get New Fret Position
            const unsigned long lastPressed = debounceFret[ri][ci];  // Read Last Time a Particular Fret Has Been Pressed
            const unsigned long elapsedTime =  currentTime - lastPressed; // Calculate Elapsed Time   
            if (oldState != newState) {
                debounceFret[ri][ci] =  currentTime;                 // Register Fret Interaction Time for Debounce If State Changes
                if (elapsedTime > maxAllowedDebounceTime) {          // Send Keyboard Presses
                bool event = !newState;                              // Negate Pressed State to get HIGH = 1 and LOW = 0
                int fret = ci + 1;                                   // Add One as Frets are Numbered from 1 - 20
                int string = ri + 1;                                 // Add One as Strings are Numbered from 1 - 
                Keyboard.print(event);                               // Add Event
                if (fret < 10) Keyboard.print("0");                  // Pad Single Digits with a 0
                  Keyboard.print(fret);                              // Add Fret Number
                  Keyboard.println(string);                          // Add String Number
                }        
            }            
        }
    }
    
    // Read Strum State
    for (byte i = 0; i < 6; i++) {                                   // Traverse Strums
        if (oldStrumState[i] != newStrumState[i]) {                  // If Change Detected
            // Debounce Control
            const unsigned long lastChanged = debounceStrum[i];      // Read Last Message Sent on a Particular Fret 
            const unsigned long elapsedTime = currentTime - lastChanged;// Calculate Elapsed Time   

            if (elapsedTime > maxAllowedDebounceTime) {              // Act on Changes After Debounce Time
              debounceStrum[i] = currentTime;                        // Register State Change
              bool event = !newStrumState[i];                        // Negate Pressed State to get HIGH = 1 and LOW = 0
              Keyboard.print(event);                                 // Add Event
              Keyboard.print("00");                                  // Double Zero For Fret Number
              Keyboard.println(i + 1);                               // Add String Number
            } 
        }
    }
}

