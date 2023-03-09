#include <Keyboard.h>
#include <KeyboardLayout.h>
#include <Keyboard_da_DK.h>
#include <Keyboard_de_DE.h>
#include <Keyboard_es_ES.h>
#include <Keyboard_fr_FR.h>
#include <Keyboard_it_IT.h>
#include <Keyboard_sv_SE.h>

byte pin = 7;
bool state = true;

bool getState() {
    return digitalRead(pin);
}

void setup() {
    Serial.begin(9600);
    Keyboard.begin();
    pinMode(pin, INPUT_PULLUP);
    state = getState();
}

void loop() {
    bool prevState = state;
    state = getState();
  
    // State Changed
    if (prevState != state) {
        if (state == true) {
            Keyboard.release('p');
            Serial.println("Release P");
        }
        else {
            Keyboard.press('p');
            Serial.println("Press P");
        }
    }
}










      // Read Current State
      // byte currentState [10];
      // bool stateChanged = false;

      // for (byte i = 33; i < 53; i += 2) {
      //     Serial.print(currentState[i]);
      //     currentState[i] = digitalRead(i + 1);
      //     if (currentState[i] != state[i]) stateChanged = true;
      // }
      // Serial.println("");
      
      // // Check State
      // if (stateChanged) {
      //     for (byte i = 33; i < 53; i += 2) {
      //       state[i] = currentState[i];
      //       Serial.print(currentState[i]);
      //     }
      // Serial.println("");
      //}

