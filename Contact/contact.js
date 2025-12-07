/* ==========================================
   CONTACT FORM - ENHANCED VERSION
   ========================================== */

console.log("📧 Contact page loading...");

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");
    if (!form) {
        console.warn("Contact form not found");
        return;
    }

    setupFormValidation(form);
    setupFormSubmission(form);
    
    console.log("✨ Contact page ready!");
});

// ==========================================
// FORM VALIDATION
// ==========================================
function setupFormValidation(form) {
    const inputs = form.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
        // Real-time validation on blur
        input.addEventListener('blur', () => {
            validateField(input);
        });
        
        // Clear error on input
        input.addEventListener('input', () => {
            clearFieldError(input);
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const name = field.name;
    
    // Check if required and empty
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Email validation
    if (type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
    }
    
    // Name validation (at least 2 characters)
    if (name === 'name' && value.length > 0 && value.length < 2) {
        showFieldError(field, 'Name must be at least 2 characters');
        return false;
    }
    
    // Message validation (at least 10 characters)
    if (name === 'message' && value.length > 0 && value.length < 10) {
        showFieldError(field, 'Message must be at least 10 characters');
        return false;
    }
    
    clearFieldError(field);
    return true;
}

function showFieldError(field, message) {
    field.style.borderColor = 'var(--danger-color, #ef4444)';
    field.setAttribute('aria-invalid', 'true');
    
    // Create or update error message
    let errorMsg = field.parentElement.querySelector('.field-error');
    if (!errorMsg) {
        errorMsg = document.createElement('span');
        errorMsg.className = 'field-error';
        errorMsg.style.cssText = `
            display: block;
            color: var(--danger-color, #ef4444);
            font-size: 0.875rem;
            margin-top: 0.25rem;
        `;
        field.parentElement.appendChild(errorMsg);
    }
    errorMsg.textContent = message;
}

function clearFieldError(field) {
    field.style.borderColor = '';
    field.setAttribute('aria-invalid', 'false');
    
    const errorMsg = field.parentElement.querySelector('.field-error');
    if (errorMsg) {
        errorMsg.remove();
    }
}

// ==========================================
// FORM SUBMISSION
// ==========================================
function setupFormSubmission(form) {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        
        // Validate all fields
        const fields = form.querySelectorAll('input, textarea');
        let isValid = true;
        
        fields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            showMessage('Please fix the errors before submitting', 'error');
            announceToScreenReader('Form has errors. Please check the fields.');
            return;
        }
        
        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = 'Sending<span class="spinner"></span>';
        
        try {
            // Create mailto link
            const mailtoLink = createMailtoLink(data);
            
            // Small delay for UX
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Open email client
            window.location.href = mailtoLink;
            
            // Show success message
            showMessage('Opening your email client...', 'success');
            announceToScreenReader('Form submitted successfully. Opening email client.');
            
            // Reset form after short delay
            setTimeout(() => {
                form.reset();
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }, 2000);
            
        } catch (error) {
            console.error('Error submitting form:', error);
            showMessage('Something went wrong. Please try again.', 'error');
            announceToScreenReader('Error submitting form. Please try again.');
            
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    });
}

// ==========================================
// CREATE MAILTO LINK
// ==========================================
function createMailtoLink(data) {
    const email = 'dhruv.patel.imp@gmail.com';
    const subject = encodeURIComponent(data.subject || 'Contact Form Message');
    const body = encodeURIComponent(
        `Name: ${data.name}\n` +
        `Email: ${data.email}\n` +
        `Subject: ${data.subject}\n\n` +
        `Message:\n${data.message}`
    );
    
    return `mailto:${email}?subject=${subject}&body=${body}`;
}

// ==========================================
// SHOW MESSAGE
// ==========================================
function showMessage(text, type) {
    // Remove existing message
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const message = document.createElement('div');
    message.className = `form-message ${type}`;
    message.setAttribute('role', type === 'error' ? 'alert' : 'status');
    message.textContent = text;
    
    // Add to form
    const form = document.getElementById('contactForm');
    form.appendChild(message);
    
    // Show with animation
    setTimeout(() => message.classList.add('show'), 10);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        message.classList.remove('show');
        setTimeout(() => message.remove(), 300);
    }, 5000);
}

// ==========================================
// SCREEN READER ANNOUNCEMENTS
// ==========================================
function announceToScreenReader(message) {
    let announcer = document.getElementById("contact-announcer");
    
    if (!announcer) {
        announcer = document.createElement("div");
        announcer.id = "contact-announcer";
        announcer.setAttribute("role", "status");
        announcer.setAttribute("aria-live", "polite");
        announcer.setAttribute("aria-atomic", "true");
        announcer.style.position = "absolute";
        announcer.style.left = "-10000px";
        announcer.style.width = "1px";
        announcer.style.height = "1px";
        announcer.style.overflow = "hidden";
        document.body.appendChild(announcer);
    }
    
    announcer.textContent = message;
}

// ==========================================
// FORM AUTO-SAVE (OPTIONAL)
// ==========================================
function setupAutoSave(form) {
    const fields = form.querySelectorAll('input, textarea');
    
    fields.forEach(field => {
        // Load saved value
        const savedValue = localStorage.getItem(`contact_${field.name}`);
        if (savedValue && !field.value) {
            field.value = savedValue;
        }
        
        // Save on input
        field.addEventListener('input', debounce(() => {
            localStorage.setItem(`contact_${field.name}`, field.value);
        }, 500));
    });
    
    // Clear on successful submit
    form.addEventListener('submit', () => {
        setTimeout(() => {
            fields.forEach(field => {
                localStorage.removeItem(`contact_${field.name}`);
            });
        }, 2000);
    });
}

// ==========================================
// DEBOUNCE UTILITY
// ==========================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ==========================================
// COPY TO CLIPBOARD FUNCTIONALITY
// ==========================================
function setupCopyButtons() {
    const infoBoxes = document.querySelectorAll('.info-box');
    
    infoBoxes.forEach(box => {
        const details = box.querySelector('.details p');
        if (!details) return;
        
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.innerHTML = '📋';
        copyButton.setAttribute('aria-label', 'Copy to clipboard');
        copyButton.style.cssText = `
            background: transparent;
            border: none;
            cursor: pointer;
            font-size: 1.2rem;
            padding: 0.5rem;
            opacity: 0;
            transition: opacity 0.2s;
        `;
        
        box.style.position = 'relative';
        box.appendChild(copyButton);
        
        box.addEventListener('mouseenter', () => {
            copyButton.style.opacity = '1';
        });
        
        box.addEventListener('mouseleave', () => {
            copyButton.style.opacity = '0';
        });
        
        copyButton.addEventListener('click', async () => {
            const text = details.textContent.trim();
            try {
                await navigator.clipboard.writeText(text);
                copyButton.innerHTML = '✅';
                setTimeout(() => {
                    copyButton.innerHTML = '📋';
                }, 2000);
                announceToScreenReader(`Copied ${text} to clipboard`);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        });
    });
}

// Initialize copy buttons after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    setupCopyButtons();
});
