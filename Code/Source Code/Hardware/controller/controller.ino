//const byte COL_PINS[20] = { 35, 34, 33, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16 };
//const byte ROW_PINS[6] = { 2, 3, 4, 5, 6, 7 };

const byte ROW_NUM = 2;
const byte COL_NUM = 2;
const byte ROW_PINS[ROW_NUM] = { 4, 5 };
const byte COL_PINS[COL_NUM] = { 6, 7 };

void setup()
{
  pinMode(LED_BUILTIN, OUTPUT);             // Built-in LED UP
  
  for (byte i = 0; i < ROW_NUM; i++) {      // Iterate Strings on the Neck
    pinMode(ROW_PINS[i], OUTPUT);           // Set String to Input
    digitalWrite(ROW_PINS[i], HIGH);        // Initialise Pin by Setting it to HIGH
  }

  for (byte i = 0; i < COL_NUM; i++) {      // Iterate Fret Pins
    pinMode(COL_PINS[i], INPUT_PULLUP);     // Pull Up Resistor on Fret PIN
  }
  
  Serial.begin(115200);
}

void loop()
{
  Serial.println("HELLO");
  digitalWrite(6, LOW);         // Set ROW to LOW
  Serial.println(digitalRead(4));

  // // Read Neck State
  // for (byte i = 0; i < ROW_NUM; i++) {      // Iterate ROWS
  //   digitalWrite(ROW_PINS[i], LOW);         // Set ROW to LOW
    
  //   for (byte j = 0; j < COL_NUM; j++) {
  //     bool res = digitalRead(COL_PINS[j]);
  //     Serial.print(res);
  //   }

  //   Serial.println("");
  //   digitalWrite(ROW_PINS[i], HIGH);        // Set Neck String Back to HIGH
  // }

  // Serial.println("--------------------");
  delay(500);
}