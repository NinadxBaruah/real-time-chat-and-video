const track = document.querySelector('.carousel-track');
const slides = Array.from(track.children);
const nextButton = document.querySelector('.next');
const prevButton = document.querySelector('.prev');

let currentIndex = 0;
const slidesPerView = 4;
const slideWidth = 100 / slidesPerView;

// Initialize slide positions
slides.forEach((slide, index) => {
    slide.style.transform = `translateX(${index * slideWidth}%)`;
});

// Update slide positions
const moveToSlide = (currentIndex) => {
    track.style.transform = `translateX(-${currentIndex * slideWidth}%)`;
};

// Next button click handler
nextButton.addEventListener('click', () => {
    if (currentIndex < slides.length - slidesPerView) {
        currentIndex++;
        moveToSlide(currentIndex);
    }
});

// Previous button click handler
prevButton.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        moveToSlide(currentIndex);
    }
});

// Disable buttons at ends
const updateButtons = () => {
    prevButton.style.display = currentIndex === 0 ? 'none' : 'block';
    nextButton.style.display = 
        currentIndex >= slides.length - slidesPerView ? 'none' : 'block';
};

// Update buttons initially and after each slide
updateButtons();
nextButton.addEventListener('click', updateButtons);
prevButton.addEventListener('click', updateButtons);

// Optional: Add touch support for mobile
let touchStartX = 0;
let touchEndX = 0;

track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
});

track.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].clientX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const difference = touchStartX - touchEndX;

    if (Math.abs(difference) > swipeThreshold) {
        if (difference > 0) {
            // Swipe left
            if (currentIndex < slides.length - slidesPerView) {
                currentIndex++;
                moveToSlide(currentIndex);
                updateButtons();
            }
        } else {
            // Swipe right
            if (currentIndex > 0) {
                currentIndex--;
                moveToSlide(currentIndex);
                updateButtons();
            }
        }
    }
}


const bookNowButtonForScrool = document.querySelector(".book-now-button");
const contactSection = document.getElementById("contact");


bookNowButtonForScrool.addEventListener("click", () => {
  // Smoothly scroll to the contact section
  contactSection.scrollIntoView({
    behavior: "smooth", 
    block: "start", 
  });
});
