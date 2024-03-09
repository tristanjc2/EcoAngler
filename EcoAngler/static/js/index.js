// Initialize Swiper
var swiper = new Swiper('.swiper-container', {
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    on: {
        init: function () {
            // Initially show only the first slide
            this.slides[this.activeIndex].classList.add('swiper-slide-active');
        },
        slideChange: function () {
            // Show the active slide and hide the others
            this.slides.forEach((slide, index) => {
                slide.classList.remove('swiper-slide-prev', 'swiper-slide-next', 'swiper-slide-active');
                if (index === this.activeIndex) {
                    slide.classList.add('swiper-slide-active');
                } else if (index === this.activeIndex - 1) {
                    slide.classList.add('swiper-slide-prev');
                } else if (index === this.activeIndex + 1) {
                    slide.classList.add('swiper-slide-next');
                }
            });
        },
    },
});

// ----------------------------------------------------------------------------------------------------------------------------------------------

// Get the button and overlay elements
const signUpBtn = document.getElementById('sign-up-btn');
const signUpOverlay = document.getElementById('sign-up-overlay');
const loginBtn = document.getElementById('login-btn');
const loginOverlay = document.getElementById('login-overlay');

// Function to toggle overlay visibility
function toggleOverlay(overlay) {
    overlay.style.display = (overlay.style.display === 'flex') ? 'none' : 'flex';
}

// Function to close overlay
function closeOverlay(overlayId) {
    const overlay = document.getElementById(overlayId);
    overlay.style.display = 'none';
}

// Add click event listeners if elements are found
if (signUpBtn) {
    signUpBtn.addEventListener('click', (event) => {
        console.log('Sign Up button clicked');
        toggleOverlay(signUpOverlay);
        event.stopPropagation(); // Stop the event from reaching the document
    });
}

if (loginBtn) {
    loginBtn.addEventListener('click', (event) => {
        console.log('Login button clicked');
        toggleOverlay(loginOverlay);
        event.stopPropagation(); // Stop the event from reaching the document
    });
}

// Close the overlay when clicking outside
document.addEventListener('click', () => {
    signUpOverlay.style.display = 'none';
    loginOverlay.style.display = 'none';
});

// Prevent clicks inside the overlay from closing it
signUpOverlay.addEventListener('click', (event) => {
    event.stopPropagation();
});

loginOverlay.addEventListener('click', (event) => {
    event.stopPropagation();
});

//--------------------------------------------------------------------------------------------------------------------------------------------------