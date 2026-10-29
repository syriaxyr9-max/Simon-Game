"use strict";

const buttonColours = ["red", "blue", "green", "yellow"];
const SOUND_PATH = {
  red: "red.mp3",
  blue: "blue.mp3",
  green: "green.mp3",
  yellow: "yellow.mp3",
  wrong: "wrong.mp3"
};

let gamePattern = [];
let userClickedPattern = [];
let started = false;
let level = 0;

const sounds = {};
for (const [colour, path] of Object.entries(SOUND_PATH)) {
  sounds[colour] = new Audio(new URL(path, document.baseURI).href);
  sounds[colour].preload = "auto";
}

function playSound(colour) {
  const audio = sounds[colour];
  if (!audio) {
    console.error(`No sound configured for "${colour}".`);
    return;
  }

  audio.pause();
  audio.currentTime = 0;

  const playback = audio.play();
  if (playback && typeof playback.catch === "function") {
    playback.catch((error) => {
      // Report failures in the console instead of silently ignoring them.
      console.error(`Could not play ${SOUND_PATH[colour]}:`, error);
    });
  }
}

function nextSequence() {
  userClickedPattern = [];
  level++;
  $("#level-title").text("Level " + level);

  const randomChosenColour =
    buttonColours[Math.floor(Math.random() * buttonColours.length)];
  gamePattern.push(randomChosenColour);

  $("#" + randomChosenColour).stop(true, true)
    .fadeIn(100).fadeOut(100).fadeIn(100);
  playSound(randomChosenColour);
}

function animatePress(currentColour) {
  $("#" + currentColour).addClass("pressed");
  setTimeout(() => $("#" + currentColour).removeClass("pressed"), 100);
}

function checkAnswer(currentLevel) {
  if (userClickedPattern[currentLevel] === gamePattern[currentLevel]) {
    if (userClickedPattern.length === gamePattern.length) {
      setTimeout(nextSequence, 1000);
    }
  } else {
    playSound("wrong");
    $("body").addClass("game-over");
    $("#level-title").text("Game Over, Press Any Key to Restart");
    setTimeout(() => $("body").removeClass("game-over"), 200);
    startOver();
  }
}

function startOver() {
  level = 0;
  gamePattern = [];
  userClickedPattern = [];
  started = false;
}

$(".btn").on("click", function () {
  if (!started) return;

  const userChosenColour = this.id;
  userClickedPattern.push(userChosenColour);
  playSound(userChosenColour);
  animatePress(userChosenColour);
  checkAnswer(userClickedPattern.length - 1);
});

$(document).on("keydown", function () {
  if (!started) {
    started = true;
    nextSequence();
  }
});
