// Speaker frequency will change according to
// the potentiometer state form note C4 to C5

const byte POT = A0;         // 0 - 1023 Reads 10K 
const byte BUZ = 7;          // Digital PIN 7
const short C5 = 523;		 // Note C Middle
const short C4 = 262;        // Note C Octave Above
const short RANGE = C5 - C4; // Note Range
const short MAX_POT = 1023;  // Max Potmeter Value     
float potState;              // Potmeter Read
float potPerc;				 // Potmeter Percent

void setup() {
  pinMode(POT, INPUT);		 // Set A0 INPUT
  pinMode(BUZ, OUTPUT);      // Set D8 OUTPUT
}

// Calculate the frequency of the tune
// in relation to the potmeter state
float getFreq(float voltage) {
  return C4 + (voltage / MAX_POT * RANGE);
}

void loop() {
  potState = analogRead(POT); // Get A0 Value
  float freq = getFreq(potState);
  tone(BUZ, freq);            // Make Sound
}