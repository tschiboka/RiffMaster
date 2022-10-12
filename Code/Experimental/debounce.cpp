const int buttonPin = 2;                                                    // the number of the pushbutton pin
const int ledPin = 13;                                                      // the number of the LED pin
int ledState = HIGH;                                                        // the current state of the output pin
int buttonState;                                                            // the current reading from the input pin
int lastButtonState = LOW;                                                  // the previous reading from the input pin
unsigned long lastDebounceTime = 0;                                         // the last time the output pin was toggled
unsigned long debounceDelay = 50;                                           // the debounce time; increase if the output flickers
                   
void setup() {                   
  pinMode(buttonPin, INPUT);                   
  pinMode(ledPin, OUTPUT);                   
  digitalWrite(ledPin, ledState);                   
}                   
                   
void loop() {                   
  int reading = digitalRead(buttonPin);                                     // read the state of the switch into a local variable:
  if (reading != lastButtonState) {                                         // If the switch changed, due to noise or pressing:
    lastDebounceTime = millis();                                            // reset the debouncing timer
  }                   
                   
  if ((millis() - lastDebounceTime) > debounceDelay) {                   
    // whatever the reading is at, it's been there for longer than the debounce delay, so take it as the actual current state
    if (reading != buttonState) {                   
      buttonState = reading;                   
      if (buttonState == HIGH) {                                            // only toggle the LED if the new button state is HIGH
        ledState = !ledState;                   
      }                   
    }                   
  }                   
                   
  digitalWrite(ledPin, ledState);                                           // set the LED:
  lastButtonState = reading;                                                // save the reading
}



