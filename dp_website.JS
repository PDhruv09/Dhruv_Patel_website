document.addEventListener("DOMContentLoaded", function() {
    const mobileNavToggle = document.querySelector('.bi-list.mobile-nav-toggle');
    const navbar = document.querySelector('#navbar ul');

    if (mobileNavToggle && navbar) {
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

    // Function to show the correct section based on the URL hash
    function showSectionFromHash() {
        const hash = window.location.hash || '#about'; // Default to 'about' if no hash
        document.querySelectorAll('.page').forEach(page => {
            if ('#' + page.id === hash) {
                page.style.display = 'block';  // Show the target section
            } else {
                page.style.display = 'none';  // Hide other sections
            }
        });
    }

    // Initially show the correct section when the page loads
    showSectionFromHash();

    // Add event listeners to each navbar link to show the relevant section on click
    document.querySelectorAll('#navbar a').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();  // Prevent default link behavior
            const targetId = this.getAttribute('href');  // Get the href target (e.g., #resume)
            window.location.hash = targetId;  // Update the URL hash
            showSectionFromHash();  // Show the target section
        });
    });

    // Also listen to hash changes (for direct access via URL)
    window.addEventListener('hashchange', showSectionFromHash);
});
