document.addEventListener('DOMContentLoaded', () => {
  const scene = document.querySelector('.scene');

  /* --- Background slideshow --- */

  const slides = Array.from(document.querySelectorAll('.bg-slide'));
  let slideIndex = 0;
  let slideshowTimer = null;
  let slideshowFrozen = false;
  const slideDelay = 12000; // 12s between fades

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

  // begin slideshow on load
  startSlideshow();

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

      // Freeze slideshow so current cosmic wallpaper becomes that room's fixed background
      freezeSlideshow();

      const roomName = door.dataset.room || '';
      roomTitle.textContent = roomName ? roomName + ' Room' : 'Room';

      // Clear any previous door-origin classes, then set the one for this door
      scene.classList.remove('room-open-1', 'room-open-2', 'room-open-3', 'room-open-4');
      const doorNumber = index + 1;
      scene.classList.add('room-open-' + doorNumber);

      // Start zooming wall outward, centered on this door
      scene.classList.add('room-opening');

      // Slide the clicked door left, but keep it in view
      doors.forEach(d => d.classList.remove('door-slide'));
      door.classList.add('door-slide');

      // After zoom completes, reveal the room overlay (wall is now offscreen)
      setTimeout(() => {
        scene.classList.add('room-active');
        roomOverlay.setAttribute('aria-hidden', 'false');
        isTransitioning = false;
      }, 1100); // should match CSS transition duration on .frosted-wall
    });
  });

  // Exit back to the door wall
  roomExit.addEventListener('click', () => {
    if (isTransitioning) return;
    isTransitioning = true;

    scene.classList.remove('room-active', 'room-opening');
    doors.forEach(d => d.classList.remove('door-slide'));

    // let the wall fade/scale back into place
    setTimeout(() => {
      scene.classList.remove('room-open-1', 'room-open-2', 'room-open-3', 'room-open-4');
      roomOverlay.setAttribute('aria-hidden', 'true');

      // Resume slideshow for the landing page again
      slideshowFrozen = false;
      startSlideshow();

      isTransitioning = false;
    }, 600);
  });
});
