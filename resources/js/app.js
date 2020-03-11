function main() {
    document.getElementById('para').innerHTML = 'TEST';
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}