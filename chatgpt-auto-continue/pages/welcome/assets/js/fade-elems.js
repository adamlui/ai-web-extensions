document.addEventListener('DOMContentLoaded', () => {
    const iObserver = new IntersectionObserver(entries => {
        entries.forEach(({ target, isIntersecting }) => {
            target.classList[isIntersecting ? 'add' : 'remove']('visible')
            target.classList[isIntersecting ? 'remove' : 'add']('hidden')
        })
    }, { threshold: 0.5 })
    document.querySelectorAll('h1, p, img, .footer-links').forEach((fadableElem, idx) =>
        setTimeout(() => iObserver.observe(fadableElem), (idx+1) *55))
})
