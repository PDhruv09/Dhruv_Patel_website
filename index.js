console.log("IT'S ALIVE!");

// Helper function to select multiple elements
function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

// Dark Mode Toggle Across All Pages
document.addEventListener("DOMContentLoaded", () => {
    // Add the dark mode switcher
    document.body.insertAdjacentHTML(
        "afterbegin",
        `
        <label class="color-scheme" style="position: absolute; top: 10px; right: 10px;">
            Theme:
            <select id="theme-switcher">
                <option value="light dark">Automatic</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
            </select>
        </label>
    `
    );

    const select = document.getElementById("theme-switcher");

    // Apply saved preference
    if ("colorScheme" in localStorage) {
        setColorScheme(localStorage.colorScheme);
        select.value = localStorage.colorScheme;
    }

    // On theme change
    select.addEventListener("input", (event) => {
        const colorScheme = event.target.value;
        setColorScheme(colorScheme);
        localStorage.colorScheme = colorScheme;
    });

    function setColorScheme(colorScheme) {
        document.documentElement.style.setProperty("color-scheme", colorScheme);
    }

    // Background music
    const backgroundMusic = document.getElementById('background-music');
    if (backgroundMusic) {
        backgroundMusic.muted = false;
        setTimeout(() => backgroundMusic.pause(), 8000); // Stop after 8 seconds
    }

    // Enter button functionality
    const enterButton = document.getElementById("enter-button");
    if (enterButton) {
        enterButton.addEventListener("click", enterSite);
    }

    // Add animated class to trigger CSS animations
    setTimeout(() => {
        document.querySelector(".center-content").classList.add("animated");
    }, 100); // slight delay to trigger CSS animations

});

// Redirect to home.html
function enterSite() {
    window.location.href = 'home.html';
}
