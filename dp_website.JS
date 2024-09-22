// JavaScript to toggle the navigation menu on mobile
document.addEventListener("DOMContentLoaded", function() {
    const mobileNavToggle = document.querySelector('.bi-list.mobile-nav-toggle');
    const navbar = document.querySelector('#navbar ul');

    if (mobileNavToggle && navbar) {
        mobileNavToggle.addEventListener('click', function() {
            navbar.classList.toggle('navbar-mobile'); // Toggle class to show the menu
            mobileNavToggle.classList.toggle('bi-list'); // Toggle between list and X icons
            mobileNavToggle.classList.toggle('bi-x');
        });
    }

    // Close dropdown when clicking outside the menu
    document.addEventListener('click', function(event) {
        const isClickInside = navbar.contains(event.target) || mobileNavToggle.contains(event.target);
        if (!isClickInside && navbar.classList.contains('navbar-mobile')) {
            navbar.classList.remove('navbar-mobile');
            mobileNavToggle.classList.add('bi-list');
            mobileNavToggle.classList.remove('bi-x');
        }
    });
});
