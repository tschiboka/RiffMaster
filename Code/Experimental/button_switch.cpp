// When Push Button is Pressed the LED is turned on
const byte BTN = 7;
const byte LED = 8;
bool ledState = LOW;

void setup(){
  pinMode(BTN, INPUT);
  pinMode(LED, OUTPUT);
}

void switchLED(byte LED) {
      ledState = !ledState;
      digitalWrite(LED, ledState);
}

void loop(){
  const bool buttonState = digitalRead(BTN);
  static bool pressed = false;
  
  if (buttonState){
    if (!pressed) switchLED(LED);
    pressed = true;
  } 
  else pressed = false;
}