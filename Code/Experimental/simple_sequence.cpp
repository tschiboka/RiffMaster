// Simple series with 3 LEDs

const byte LEDS[3] = {7, 8, 9};

void setup(){
  Serial.begin(9600);
  for (byte i = 0; i < sizeof(LEDS); i++) {
  	pinMode(LEDS[i], OUTPUT);
  }
}

void ledsOff(){
  for (byte i = 0; i < sizeof(LEDS); i++) {
  	digitalWrite(LEDS[i], LOW);	
  }
}

void loop()
{
  for (byte i = 0; i < sizeof(LEDS); i++) {
    ledsOff();
  	digitalWrite(LEDS[i], HIGH);
    delay(500);
  }
}