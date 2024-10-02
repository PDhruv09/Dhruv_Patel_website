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

    // Function to display the relevant section based on the URL hash
    function showSectionFromHash() {
        const hash = window.location.hash.substring(1) || 'about';  // Default to 'about' if no hash
        document.querySelectorAll('.page').forEach(page => {
            page.style.display = (page.id === hash) ? 'block' : 'none';  // Show the matching section
        });
    }

    // Show the correct section on initial page load based on URL hash
    showSectionFromHash();

    // Show the correct section when the hash changes (e.g., when clicking navbar links)
    window.addEventListener('hashchange', showSectionFromHash);

    // Add event listeners to navbar links to show the correct section and update the URL
    document.querySelectorAll('#navbar a').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            window.location.hash = targetId;  // Update URL hash
        });
    });
});
