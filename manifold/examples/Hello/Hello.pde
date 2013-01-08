import manifold.*;
import processing.opengl.*;

Manifold manifold;

void setup() {
  size(700, 700, OPENGL);
  smooth();
  
  // initialise an empty manifold
  manifold = new Manifold(this);
}

void draw() {
  background(0);
  manifold.draw();
}