// JavaScript to toggle the navigation menu on mobile
document.addEventListener("DOMContentLoaded", function() {
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navbar = document.querySelector('#navbar ul');

    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', function() {
            navbar.classList.toggle('show'); // Toggle the visibility of the menu
            mobileNavToggle.classList.toggle('bi-list'); // Change icon from three lines to "X"
            mobileNavToggle.classList.toggle('bi-x');
        });
    }

    // Close dropdown when clicking outside the menu
    document.addEventListener('click', function(event) {
        const isClickInside = navbar.contains(event.target) || mobileNavToggle.contains(event.target);
        if (!isClickInside && navbar.classList.contains('show')) { // Close the menu if click is outside
            navbar.classList.remove('show');
            mobileNavToggle.classList.add('bi-list');
            mobileNavToggle.classList.remove('bi-x');
        }
    });
});
