// script.js
const textElements = document.querySelectorAll('.nav-item');
const logo = document.querySelector(".logo")


gsap.from(logo, {
  y: -100, 
  opacity: 0, 
  duration: 1, 
  ease: "power3.out", 
  delay: 0.5, 
});

gsap.from(textElements, {
  y: 50,
  opacity: 0,
  duration: 1,
  stagger: 0.2,
  ease: 'power3.out'
});

const bookNow = document.querySelector(".book-now span");
const bookNowButton = document.querySelector(".book-now button");

// Animate each line
gsap.from(".book-now span", {
  y: 50, 
  opacity: 0, 
  duration: 0.8, 
  ease: "power2.out", 
  stagger: 0.3, 
});

// Animate the button after text appears
gsap.from(bookNowButton, {
  scale: 0, 
  opacity: 0, 
  duration: 0.8, 
  ease: "elastic.out(1, 0.5)",
  delay: 1.5, 
});


gsap.registerPlugin(ScrollTrigger);

// Animate the heading
gsap.from("#about-heading", {
  opacity: 0, // Start fully transparent
  y: 50, // Start 50px lower
  duration: 1, // Animation duration
  ease: "power3.out", // Smooth easing
  scrollTrigger: {
    trigger: "#about-heading",
    start: "top 80%", // Animation starts when heading is 80% in the viewport
  },
});

// Animate the paragraph
gsap.from(".about-contents p", {
  opacity: 0,
  y: 50,
  duration: 1,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".about-contents p",
    start: "top 80%",
  },
});

// Animate the "Learn more" text
gsap.from(".about-contents span", {
  opacity: 0,
  y: 30,
  duration: 0.8,
  ease: "power2.out",
  scrollTrigger: {
    trigger: ".about-contents span",
    start: "top 90%",
  },
});

// Animate the image
gsap.from("#about-image", {
  opacity: 0,
  scale: 0.8, // Slightly smaller scale
  duration: 1.2,
  ease: "power2.out",
  scrollTrigger: {
    trigger: "#about-image",
    start: "top 80%",
  },
});


// Animate the bottom bar items
gsap.from(".about-container-bottom-bar .item-1, .about-container-bottom-bar .item-2", {
  opacity: 0, // Fade-in effect
  y: 50, // Slide up effect
  duration: 1, // Duration of animation
  stagger: 0.2, // Delay between each item's animation
  ease: "power3.out", // Smooth easing
  scrollTrigger: {
    trigger: ".about-container-bottom-bar",
    start: "top 85%", // Animation starts when the container is 85% visible
    toggleActions: "play none none reverse", // Play on enter, reverse on exit
  },
});

// Animation for project-heading
gsap.from(".project-heading", {
  opacity: 0,
  y: 50,
  duration: 1,
  ease: "power2.out",
  scrollTrigger: {
    trigger: ".project-heading",
    start: "top 80%",
    end: "bottom 50%",
    toggleActions: "play none none none",
  },
});

// Animation for carousel container
gsap.from(".carousel-container", {
  opacity: 0,
  y: 50,
  duration: 1,
  ease: "power2.out",
  scrollTrigger: {
    trigger: ".carousel-container",
    start: "top 80%",
    end: "bottom 50%",
    toggleActions: "play none none none",
  },
});

// Optional animation for each carousel slide to fade in one by one
gsap.from(".carousel-slide", {
  opacity: 0,
  stagger: 0.2,  // Apply stagger to each slide
  duration: 1,
  ease: "power2.out",
  scrollTrigger: {
    trigger: ".carousel-container",
    start: "top 80%",
    end: "bottom 50%",
    toggleActions: "play none none none",
  },
});


