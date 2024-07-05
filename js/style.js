// scripts.js

let currentSlide = 0;

function moveSlide(direction) {
    const slides = document.querySelectorAll('.slide');
    const sliderContainer = document.querySelector('.slider-container');
    currentSlide += direction;
    if (currentSlide < 0) {
        currentSlide = slides.length - 1;
    }
    if (currentSlide >= slides.length) {
        currentSlide = 0;
    }
    sliderContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
}
