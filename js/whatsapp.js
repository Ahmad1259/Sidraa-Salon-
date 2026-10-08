// whatsapp.js

document.addEventListener('DOMContentLoaded', () => {
    const templates = {
        general: "Hello SIDRA'S Salon! 👋\nI would like to book an appointment.\n\nService:\nPreferred Date:\nPreferred Time:\n\nPlease let me know your availability.\n\nThank you.",
        hair: "Hello SIDRA'S Salon! 👋\nI would like to enquire about a hair service.\n\nService:\nPreferred Date:\nPreferred Time:\n\nPlease let me know your availability.",
        nails: "Hello SIDRA'S Salon! 👋\nI would like to book a nail service.\n\nService:\nPreferred Date:\nPreferred Time:\n\nPlease share your available timings.",
        makeup: "Hello SIDRA'S Salon! 👋\nI would like to enquire about makeup services.\n\nService:\nPreferred Date:\nPreferred Time:\n\nPlease let me know your availability.",
        bridal: "Hello SIDRA'S Salon! 👋\nI am interested in your bridal makeup and beauty services.\n\nWedding Date:\nEvent Date:\nPreferred Service:\n\nPlease share availability and further details.\n\nThank you.",
        spa: "Hello SIDRA'S Salon! 👋\nI would like to enquire about your spa services.\n\nService:\nPreferred Date:\nPreferred Time:\n\nPlease let me know the available options."
    };

    const phoneNumber = "923001091104";

    const openWhatsApp = (type) => {
        const messageTemplate = templates[type] || templates['general'];
        const encodedMessage = encodeURIComponent(messageTemplate);
        const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        window.open(url, '_blank');
    };

    // Elements with data-whatsapp
    const whatsappElements = document.querySelectorAll('[data-whatsapp]');
    whatsappElements.forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const type = el.getAttribute('data-whatsapp');
            openWhatsApp(type);
        });
    });

    // Elements with class .book-now-btn but no data-whatsapp
    const defaultBookBtns = document.querySelectorAll('.book-now-btn:not([data-whatsapp])');
    defaultBookBtns.forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            openWhatsApp('general');
        });
    });
});
