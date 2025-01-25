document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    if (!form) return; // Exit if no form exists

    form.addEventListener("submit", (event) => {
        event.preventDefault(); // Stop the default form submission

        const data = new FormData(form);
        let url = "mailto:dhruv.patel.imp@gmail.com?";
        url += Array.from(data)
            .map(([name, value]) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
            .join("&");

        location.href = url; // Open mail client
    });
});