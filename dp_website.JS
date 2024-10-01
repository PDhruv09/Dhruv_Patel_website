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

    // Initially hide all sections except 'About Me'
    document.querySelectorAll('.page').forEach(page => {
        if (page.id !== 'about') {
            page.style.display = 'none';  // Hide all sections except 'About Me'
        }
    });

    // Add event listeners to each navbar link to show the relevant section on click
    document.querySelectorAll('#navbar a').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();  // Prevent default link behavior (page reload)

            // Hide all sections including 'About Me'
            document.querySelectorAll('.page').forEach(page => page.style.display = 'none');

            // Get the target section from the link's href attribute (e.g., #resume, #projects)
            const targetId = this.getAttribute('href').substring(1);

            // Show the target section
            document.getElementById(targetId).style.display = 'block';
        });
    });
});
