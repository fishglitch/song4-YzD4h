const buttonStart = document.getElementById("start-button");
const buttonClear = document.getElementById("clear-button");

let audioInitialized = false; // Tone.js audio context initialization is set to false
let isPlaying = false; // Sequence playing is set to false

const reverb = new Tone.Reverb({
  decay: 2.5,
  preDelay: 0.1,
}).toDestination();
const synth = new Tone.PolySynth().connect(reverb);

// Setup grid Data
const rows = ["A4", "G4", "E4", "C4", "E4", "D4", "C4", "C5"]; // Note names
const cols = 8; // Number of columns
const grid = [];

// Create the grid structure
for (let i = 0; i < rows.length; i++) {
  const row = [];
  for (let j = 0; j < cols; j++) {
    row.push(false);
  }
  grid.push(row);
}

const container = document.getElementById("content");
const cells = []; // Array to store cell references

grid.forEach((row, rowIndex) => {
  const rowCells = [];
  for (let colIndex = 0; colIndex < cols; colIndex++) {
    const square = document.createElement("div");
    square.classList.add("cell");

    square.textContent = "🐠";
    // Listen for clicks on each cell
    square.addEventListener("click", () => {
      grid[rowIndex][colIndex] = !grid[rowIndex][colIndex];
      if (grid[rowIndex][colIndex]) {
        square.classList.add("active");
        playNote(rows[rowIndex], square); // Play note when cell is clicked
      } else {
        square.classList.remove("active");
      }
    });

    container.appendChild(square);
    rowCells.push(square);
  }
  cells.push(rowCells);
});

// Function to start the Tone.js audio context
function initializeAudio() {
  return Tone.start()
    .then(() => {
      console.log("audio is ready");
      audioInitialized = true; // Set audio flag to true
    })
    .catch((error) => {
      console.log("audio not ready", error);
    });
}

// Function to toggle the sequence
function toggleSequence() {
  if (!audioInitialized) {
    initializeAudio().then(() => {
      if (!isPlaying) {
        startSequence();
      }
    });
  } else {
    if (isPlaying) {
      stopSequence();
    } else {
      startSequence();
    }
  }
  // Add event listeners to buttons for the fish animation
  buttonStart.classList("fish-animation");

  // remove the animation class after fish animation ends
  setTimeout(() => {
    buttonStart.classList.remove("fish-animation");
  }, 300); // Remove animation class after 1 second
}

// Create sequence variable
let sequence;

// Function to start the sequence
function startSequence() {
  if (sequence) {
    sequence.dispose(); // Dispose of any existing sequence
  }

  // Create a new Sequence
  sequence = new Tone.Sequence(
    (time, col) => {
      rows.forEach((row, rowIndex) => {
        if (grid[rowIndex][col]) {
          // Check if the cell is active
          synth.triggerAttackRelease(row, "8n", time); // Play note
        }
      });
      highlightColumn(col); // Highlight the current column
    },
    Array.from({ length: cols }, (_, i) => i),
    "8n"
  );

  sequence.start(0); // Start the sequence immediately
  Tone.Transport.start(); // Start the transport

  isPlaying = true; // Update playing state
  buttonStart.textContent = "Stop Sequence"; // Change button text
}

// Function to stop the sequence
function stopSequence() {
  if (sequence) {
    sequence.stop(); // Stop the sequence
    Tone.Transport.stop(); // Stop the transport
    sequence.dispose(); // Dispose of the sequence
  }

  isPlaying = false; // Update playing state
  buttonStart.textContent = "Start Sequence"; // Change button text
}

// Highlight the current column
function highlightColumn(col) {
  // Clear previous highlights
  cells.forEach((row) => {
    row.forEach((cell) => {
      cell.classList.remove("highlight");
    });
  });
  // Highlight the current column
  cells.forEach((row) => {
    row[col].classList.add("highlight");
  });
}

// Function to play note immediately
function playNote(note, cell) {
  // Start the audio context if not already started
  if (!audioInitialized) {
    initializeAudio().then(() => {
      synth.triggerAttackRelease(note, "8n");
    });
  } else {
    synth.triggerAttackRelease(note, "8n");
  }

  // animation class to have the fish emoji dance
  cell.classList.add("fish-animation");
  setTimeout(() => {
    cell.classList.remove("fish-animation");
  }, 300); // Remove animation class after 1 second
}

// clear the sequence and reset the grid
function clearSequence() {
  grid.forEach((row, rowIndex) => {
    row.forEach((_, colIndex) => {
      grid[rowIndex][colIndex] = false; // Reset the grid
      cells[rowIndex][colIndex].classList.remove("active"); // Remove active class
    });
  });
  stopSequence(); // Stop the sequence if playing
  console.log("Grid cleared");
}
