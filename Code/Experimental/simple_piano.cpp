// Arduino Piano Keyboard
const byte BIN_VAL [8] = {128, 64, 32, 16, 8, 4, 2, 1};
const float TONES [8] = {261.63, 293.67, 329.63, 349.23, 392., 440., 493.88, 523.25};
const byte PIN_ST = 6;
const byte SPKR = A0;
byte keyBrdState = 0;

void setup() {
  for (byte pin = PIN_ST; pin <= PIN_ST + 7; pin++) {
    pinMode(pin, INPUT);
  }
  Serial.begin(9600);
}

// Eight button represent a byte
byte getStateInBytes() {
  byte keys = 0;
  for (byte i = 0; i <= 7; i++) {
    bool pinValue = digitalRead(PIN_ST + i);
    if (pinValue) keys += BIN_VAL[i];
  }
  return keys;
}

// Translate byte to multiple tones and sound speaker
void makeSound(byte keyBrdState) {
  Serial.println(keyBrdState);
  for (byte i = 0; i <= 7 && keyBrdState != 0; i++) {
    if (keyBrdState >= BIN_VAL[i]) {
      keyBrdState -= BIN_VAL[i];
      tone(SPKR, TONES[i], 500);
      delay(500);
    }
  }
}

void loop() {
  keyBrdState = getStateInBytes();
  makeSound(keyBrdState);
}