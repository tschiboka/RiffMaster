// Simple Buzzer
const byte BUZZ = 7;
const short DUR = 500;
const short FRQ = 440;

void setup() {
  pinMode(BUZZ, OUTPUT);
}

void loop() {
  tone(BUZZ, FRQ, DUR);
  delay(DUR * 2);
}