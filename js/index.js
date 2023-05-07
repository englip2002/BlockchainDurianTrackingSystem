
var bgImage = document.querySelector('.bodyBackground');
var xOffset = 0;
var yOffset = 0;


setInterval(() => {
    bgImage.style.transform = `translateX(${xOffset}px) translateY(${yOffset}px)`;
    xOffset += 1;
    yOffset += 1;
    if (xOffset >= 612) {
        xOffset = 0;
    }
    if (yOffset >= 610) {
        yOffset = 0;
    }
}, 20);