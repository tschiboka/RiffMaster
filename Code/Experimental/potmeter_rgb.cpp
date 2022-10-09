// Potmeter settings will determine LED
const byte LED_RED = 9;
const byte LED_YEL = 10;
const byte LED_GRE = 11;
const byte LEDS[] = { LED_RED, LED_YEL, LED_GRE };
const byte POT = A0;
const short max = 1022;

void setup() {
  Serial.begin(9600);
}

void switchToLED(byte led) {
  for (byte i = LEDS[0]; i <= LEDS[sizeof(LEDS) - 1]; i++) {
    digitalWrite(i, i == led);
  }
}

void loop() {
  int potState = analogRead(POT);
  
  if (potState <= max / 3) switchToLED(LED_RED);
  else if (
    potState <= max - (max / 3) &&
    potState > max / 3
  ) 
    switchToLED(LED_YEL);
  else switchToLED(LED_GRE);
}