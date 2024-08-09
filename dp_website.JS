// JavaScript to toggle the navigation menu on mobile
document.addEventListener("DOMContentLoaded", function() {
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navbar = document.querySelector('#navbar');

    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', function() {
            navbar.classList.toggle('navbar-mobile');
            mobileNavToggle.classList.toggle('bi-list');
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
