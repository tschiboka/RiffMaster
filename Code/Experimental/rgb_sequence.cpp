// Sequence of Red, Green, Blue LED progression

void setup(){
  pinMode(6, OUTPUT);
  pinMode(7, OUTPUT);
  pinMode(8, OUTPUT);
  Serial.begin(9600);
}

void loop(){
  static byte ledPin = 6;
  if (ledPin > 8) ledPin = 6;
  
  // Set Pins LOW
  digitalWrite(6, LOW);
  digitalWrite(7, LOW);
  digitalWrite(8, LOW);
  
  digitalWrite(ledPin, HIGH);
  Serial.println(ledPin);
  ledPin++;
  delay(500);
}