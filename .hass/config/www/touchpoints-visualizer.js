let circle = document.createElement('div');
circle.setAttribute('id', 'touchpoint');

circle.style.position = "fixed";
// pointerEvents property is very important and must be "none".
// Since browsers add a mouse click event _after_ a touch event is finished, by moving the circle
// under the touch position we "capture" the click event that the browser will spawn. Even worse,
// since the circle is attached to body, the event will never bubble to the original element.
circle.style.pointerEvents = "none";
circle.style.zIndex = "99999";

circle.style.opacity = "0";

circle.style.width = "15px";
circle.style.height = "15px";
circle.style.borderRadius = "100vmax";
circle.style.borderColor = "#333";
circle.style.borderStyle = "solid";
circle.style.borderWidth = "1px";
circle.style.backgroundColor = "#eee";
circle.style.transition = "opacity 0.5s";


document.body.appendChild(circle);

function moveCircle(event) {
  if (event.touches.length > 1) {
    throw "Unsupported number of touchpoints: " + event.touches.length;
  }
  circle.style.left = (event.touches[0].clientX - 15 / 2) + "px";
  circle.style.top = (event.touches[0].clientY - 15 / 2) + "px";
}


document.body.addEventListener(
  "touchstart",
  (event) => {
    circle.style.opacity = ".7";
    moveCircle(event);
  }
);
document.body.addEventListener(
  "touchmove",
  (event) => {
    moveCircle(event);
  }
);
document.body.addEventListener(
  "touchend",
  () => {
    circle.style.opacity = "0";
  },
);
