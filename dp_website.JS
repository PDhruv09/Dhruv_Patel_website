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

    // Initially hide all sections except 'Home'
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';  // Hide all pages initially
    });
    document.getElementById('home').style.display = 'block';  // Show the home content

    // Add event listeners to each navbar link to show the relevant section on click
    document.querySelectorAll('#navbar a').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();  // Prevent default link behavior (page reload)

            // Hide all sections
            document.querySelectorAll('.page').forEach(page => page.style.display = 'none');

            // Get the target section from the link's href attribute (e.g., #about, #resume)
            const targetId = this.getAttribute('href').substring(1);

            // Show the target section
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
        });
    });
});
