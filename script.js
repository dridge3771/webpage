document.addEventListener('DOMContentLoaded', () => {
  const scene = document.querySelector('.scene');

  /* --- Background slideshow --- */

  const slides = Array.from(document.querySelectorAll('.bg-slide'));
  let slideIndex = 0;
  let slideshowTimer = null;
  let slideshowFrozen = false;
  const slideDelay = 5000;

  function showSlide(nextIndex) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === nextIndex);
    });
    slideIndex = nextIndex;
  }

  function startSlideshow() {
    if (slideshowTimer || slideshowFrozen || slides.length <= 1) return;
    slideshowTimer = setInterval(() => {
      const next = (slideIndex + 1) % slides.length;
      showSlide(next);
    }, slideDelay);
  }

  function stopSlideshow() {
    if (slideshowTimer) {
      clearInterval(slideshowTimer);
      slideshowTimer = null;
    }
  }

  function freezeSlideshow() {
    slideshowFrozen = true;
    stopSlideshow();
  }

  // kick off slideshow if there is more than one slide
  if (slides.length) {
    slides[0].classList.add('is-active');
    startSlideshow();
  }

  /* --- Door interactions & zoom-through-door --- */

  const doors = Array.from(document.querySelectorAll('.door'));
  const roomOverlay = document.querySelector('.room-overlay');
  const roomTitle = document.querySelector('.room-title');
  const roomExit = document.querySelector('.room-exit');

  let isTransitioning = false;

  doors.forEach((door, index) => {
    door.addEventListener('click', () => {
      if (isTransitioning) return;
      isTransitioning = true;

      // freeze slideshow so current image becomes the room wallpaper
      freezeSlideshow();

      const roomName = door.dataset.room || '';
      roomTitle.textContent = roomName ? roomName + ' Room' : 'Room';

      // set transform origin for this door
      scene.classList.remove('room-open-1', 'room-open-2', 'room-open-3', 'room-open-4');
      const doorNumber = index + 1;
      scene.classList.add('room-open-' + doorNumber);

      // slide chosen door left a bit
      doors.forEach(d => d.classList.remove('door-slide'));
      door.classList.add('door-slide');

      // start zooming wall outward through this door
      scene.classList.add('room-opening');

      // after zoom completes, hide wall + show room overlay
      setTimeout(() => {
        scene.classList.add('wall-hidden');
        scene.classList.add('room-active');
        roomOverlay.setAttribute('aria-hidden', 'false');
        isTransitioning = false;
      }, 1100); // matches .frosted-wall transition
    });
  });

  // Exit back to doors
  roomExit.addEventListener('click', () => {
    if (isTransitioning) return;
    isTransitioning = true;

    // show wall again
    scene.classList.remove('room-active');
    scene.classList.remove('wall-hidden');
    scene.classList.remove('room-opening');
    doors.forEach(d => d.classList.remove('door-slide'));

    // allow the wall to animate back into place
    setTimeout(() => {
      scene.classList.remove('room-open-1', 'room-open-2', 'room-open-3', 'room-open-4');
      roomOverlay.setAttribute('aria-hidden', 'true');

      // resume slideshow for landing page
      slideshowFrozen = false;
      startSlideshow();

      isTransitioning = false;
    }, 650);
  });
});
