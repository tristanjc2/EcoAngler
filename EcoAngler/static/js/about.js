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