(function () {
  "use strict";

  const openButton = document.getElementById("mazeWidgetButton");
  const closeButton = document.getElementById("closeMazeButton");
  const overlay = document.getElementById("mazeOverlay");
  const canvas = document.getElementById("mazeCanvas");
  const statusElement = document.getElementById("gameStatus");
  const restartButton = document.getElementById("restartMazeButton");

  const game = new window.MazeGame(canvas, statusElement);
  let lastFocusedElement = null;

  const movementKeys = {
    ArrowUp: { dx: 0, dy: -1 },
    ArrowDown: { dx: 0, dy: 1 },
    ArrowLeft: { dx: -1, dy: 0 },
    ArrowRight: { dx: 1, dy: 0 },
  };

  function openModal() {
    lastFocusedElement = document.activeElement;
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    openButton.setAttribute("aria-expanded", "true");
    document.body.classList.add("modal-open");
    closeButton.focus();
    game.start();
  }

  function closeModal() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    openButton.setAttribute("aria-expanded", "false");
    document.body.classList.remove("modal-open");

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  function isModalOpen() {
    return overlay.classList.contains("is-open");
  }

  function handleKeyDown(event) {
    if (!isModalOpen()) {
      return;
    }

    if (event.key === "Escape") {
      closeModal();
      return;
    }

    const movement = movementKeys[event.key];

    if (movement) {
      event.preventDefault();
      game.movePlayer(movement.dx, movement.dy);
    }
  }

  function handleOverlayClick(event) {
    if (event.target === overlay) {
      closeModal();
    }
  }

  openButton.addEventListener("click", openModal);
  closeButton.addEventListener("click", closeModal);
  overlay.addEventListener("click", handleOverlayClick);
  restartButton.addEventListener("click", function () {
    game.reset();
  });
  document.addEventListener("keydown", handleKeyDown);

  game.draw();
})();
