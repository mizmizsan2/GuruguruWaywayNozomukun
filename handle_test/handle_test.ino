//                           _______         _______       
//               PinA ______|       |_______|       |______ PinA
// negative <---         _______         _______         __      --> positive
//               PinB __|       |_______|       |_______|   PinB

/* Read Quadrature Encoder
* Connect Encoder to Pins encoder0PinA, encoder0PinB, and +5V.
*
* Sketch by max wolf / www.meso.net
* v. 0.1 - very basic functions - mw 20061220
*
*/  
 
 
int val; 
int encoder0PinA = 27;
int encoder0PinB = 28;
int encoder0PinALast = LOW;
int n = LOW;

int nowsp = 0;
int agosp = 0;

int spd;

int starttm = 0;
 
void setup() { 
    starttm = millis();
  
    pinMode (encoder0PinA,INPUT);
    pinMode (encoder0PinB,INPUT);
    Serial.begin (115200);
} 
 
void loop() { 
    n = digitalRead(encoder0PinA);
    if ((encoder0PinALast == LOW) && (n == HIGH)) {
        if (digitalRead(encoder0PinB) == LOW) {
            nowsp--;
        } else {
            nowsp++;
        }
    } 
    encoder0PinALast = n;

    int sabun = millis() - starttm;
    
  if(sabun >= 100){
    spd = nowsp + agosp;
    
    Serial.println (spd);

    agosp = nowsp;
    nowsp = 0;
    
    Serial.println ("xxxxx");
    starttm = millis();
  }
}
