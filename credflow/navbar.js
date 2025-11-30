document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');

    const hamburger = document.createElement('button');
    hamburger.className = 'hamburger';
    hamburger.innerHTML = '<i class="bi bi-list"></i>';
    hamburger.setAttribute('aria-label', 'Menu');

    const links = document.querySelector('.links');
    if (links) {
        navbar.insertBefore(hamburger, links);

        hamburger.addEventListener('click', () => {
            links.classList.toggle('active');
            hamburger.innerHTML = links.classList.contains('active')
                ? '<i class="bi bi-x-lg"></i>'
                : '<i class="bi bi-list"></i>';
        });
    }
});
