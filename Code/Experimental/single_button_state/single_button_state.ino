const byte BTN_PIN = 7;
const byte OUTPUT_PIN = 8;

void setup() {
  pinMode(BTN_PIN, INPUT_PULLUP);  
  digitalWrite(BTN_PIN, HIGH);
  pinMode(OUTPUT_PIN, OUTPUT);

  Serial.begin(9600);
}

void loop() {
  const byte BTN_STATE = digitalRead(BTN_PIN);
  Serial.println(BTN_STATE);
}