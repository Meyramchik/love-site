const noButton = document.querySelector("#noButton");
const yesButton = document.querySelector("#yesButton");
const stage = document.querySelector("#buttonStage");
const celebration = document.querySelector("#celebration");
const replayButton = document.querySelector("#replayButton");
const canvas = document.querySelector("#heartCanvas");
const context = canvas.getContext("2d");

let lastMove = 0;
let animationFrame;
let hearts = [];

const BASE_HEARTS = 95;
const MAX_HEARTS = 180;

function moveNoButton() {
  const now = performance.now();
  if (now - lastMove < 80) return;
  lastMove = now;

  const maxX = Math.max(0, stage.clientWidth - noButton.offsetWidth);
  const maxY = Math.max(0, stage.clientHeight - noButton.offsetHeight);
  noButton.style.left = `${Math.random() * maxX}px`;
  noButton.style.top = `${Math.random() * maxY}px`;
  noButton.style.setProperty("--tilt", `${-9 + Math.random() * 18}deg`);
  noButton.classList.add("is-running");
}

function keepNoUntouchable(event) {
  event.preventDefault();
  event.stopPropagation();
  moveNoButton();
}

noButton.addEventListener("pointerenter", moveNoButton);
noButton.addEventListener("pointerdown", keepNoUntouchable);
noButton.addEventListener("click", keepNoUntouchable);
noButton.addEventListener("touchstart", keepNoUntouchable, { passive: false });
noButton.addEventListener("contextmenu", keepNoUntouchable);

stage.addEventListener("pointermove", (event) => {
  const rect = noButton.getBoundingClientRect();
  const distanceX = Math.max(rect.left - event.clientX, 0, event.clientX - rect.right);
  const distanceY = Math.max(rect.top - event.clientY, 0, event.clientY - rect.bottom);
  if (Math.hypot(distanceX, distanceY) < 42) moveNoButton();
});

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = innerWidth * ratio;
  canvas.height = innerHeight * ratio;
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function makeHeart(fromCenter = false) {
  const palette = ["#f34e73", "#ff7892", "#ffb0bf", "#fff0f3", "#d92d55", "#ffcfda"];
  return {
    x: fromCenter ? innerWidth / 2 + (Math.random() - .5) * 130 : Math.random() * innerWidth,
    y: fromCenter ? innerHeight * .57 : innerHeight + 30 + Math.random() * 100,
    size: 8 + Math.random() * 25,
    speed: 1.2 + Math.random() * 3.8,
    drift: (Math.random() - .5) * 1.8,
    sway: Math.random() * Math.PI * 2,
    spin: (Math.random() - .5) * .05,
    angle: (Math.random() - .5) * .6,
    opacity: .45 + Math.random() * .55,
    color: palette[Math.floor(Math.random() * palette.length)],
  };
}

function drawHeart(heart) {
  context.save();
  context.translate(heart.x, heart.y);
  context.rotate(heart.angle);
  context.scale(heart.size / 30, heart.size / 30);
  context.beginPath();
  context.moveTo(0, 9);
  context.bezierCurveTo(-27, -8, -15, -31, 0, -16);
  context.bezierCurveTo(15, -31, 27, -8, 0, 9);
  context.fillStyle = heart.color;
  context.globalAlpha = heart.opacity;
  context.shadowColor = "rgba(100, 30, 48, .16)";
  context.shadowBlur = 8;
  context.fill();
  context.restore();
}

function animateHearts() {
  context.clearRect(0, 0, innerWidth, innerHeight);
  let visibleHeartCount = 0;

  hearts.forEach((heart) => {
    heart.y -= heart.speed;
    heart.sway += .035;
    heart.x += heart.drift + Math.sin(heart.sway) * .55;
    heart.angle += heart.spin;
    if (heart.y > -70) {
      hearts[visibleHeartCount] = heart;
      visibleHeartCount += 1;
      drawHeart(heart);
    }
  });
  hearts.length = visibleHeartCount;

  if (celebration.classList.contains("is-visible")) {
    if (hearts.length < BASE_HEARTS) hearts.push(makeHeart());
    animationFrame = requestAnimationFrame(animateHearts);
  }
}

function burstHearts(amount = 65) {
  const burstSize = Math.min(amount, MAX_HEARTS);
  const overflow = Math.max(0, hearts.length + burstSize - MAX_HEARTS);

  if (overflow > 0) hearts.splice(0, overflow);
  for (let i = 0; i < burstSize; i += 1) hearts.push(makeHeart(true));
}

function showLove() {
  celebration.classList.add("is-visible");
  celebration.setAttribute("aria-hidden", "false");
  resizeCanvas();
  hearts = Array.from({ length: 85 }, () => makeHeart());
  burstHearts();
  cancelAnimationFrame(animationFrame);
  animateHearts();
  window.setTimeout(() => replayButton.focus(), 750);
}

yesButton.addEventListener("click", showLove);
replayButton.addEventListener("click", () => burstHearts(80));
window.addEventListener("resize", resizeCanvas);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && celebration.classList.contains("is-visible")) {
    celebration.classList.remove("is-visible");
    celebration.setAttribute("aria-hidden", "true");
    yesButton.focus();
  }
});
