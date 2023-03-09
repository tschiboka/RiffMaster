void setup() {
  // LEDS
  pinMode(13, OUTPUT);
  pinMode(12, OUTPUT);
  pinMode(11, OUTPUT);
  pinMode(10, INPUT_PULLUP);
  pinMode(9, OUTPUT);
  digitalWrite(13, LOW);
  digitalWrite(12, LOW);
  digitalWrite(11, LOW);
  Serial.begin(9600);
}

void loop() {
  Serial.println(digitalRead(10));
  Serial.println("HERE");
  digitalWrite(10, HIGH);
  delay(500);
  digitalWrite(11, LOW);
  digitalWrite(13, HIGH);
  delay(500);
  digitalWrite(13, LOW);
  digitalWrite(12, HIGH);
  delay(500);
  digitalWrite(12, LOW);
  digitalWrite(11, HIGH);
}
