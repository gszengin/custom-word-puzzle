// Event listeners for updating title, color, font, etc.
document.getElementById("title").addEventListener("input", updateTitle);
document.getElementById("titleColor").addEventListener("input", updateTitle);
document.getElementById("fontStyle").addEventListener("change", updateTitle);
document.getElementById("difficulty").addEventListener("change", generatePuzzle);
document.getElementById("words").addEventListener("input", generatePuzzle);

document.getElementById("generatePuzzleButton").addEventListener("click", generatePuzzle);


document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("downloadButton").addEventListener("click", downloadPDF);
    document.getElementById("saveSVGButton").addEventListener("click", saveSVG);
    document.getElementById("generateSolution").addEventListener("click", showSolution);
});


// Function to update title, color, and font style
function updateTitle() {
    const titleElement = document.getElementById("puzzleTitle");
    titleElement.textContent = document.getElementById("title").value;
    titleElement.style.color = document.getElementById("titleColor").value;
    
    // Apply selected font
    const selectedFont = document.getElementById("fontStyle").value;
    titleElement.style.fontFamily = `'${selectedFont}', sans-serif`;
}

// Function to generate puzzle
function generatePuzzle() {
    const gridSize = parseInt(document.getElementById("gridSize").value);
    const wordsInput = document.getElementById("words").value;
    const difficulty = document.getElementById("difficulty").value;
    
    if (!wordsInput.trim()) {
        alert("Please enter some words!");
        return;
    }

    const words = wordsInput.split(",").map(word => word.trim().toUpperCase());
    const grid = createEmptyGrid(gridSize);

    words.forEach(word => {
        if (!placeWordInGrid(grid, word, difficulty)) {
            console.warn(`⚠ Word "${word}" could not be placed.`);
        }
    });

    fillEmptySpaces(grid);
    displayPuzzle(grid);
}

function fillEmptySpaces(grid) {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (!grid[i][j]) {
                grid[i][j] = getRandomLetter();
            }
        }
    }
}


function createEmptyGrid(size) {
    return Array.from({ length: size }, () => Array(size).fill(""));
}

function placeWordInGrid(grid, word, difficulty) {
    const size = grid.length;
    const directions = getDirections(difficulty);
    let placed = false;
    let attempts = 0;
    const maxAttempts = 100; // Limit to prevent infinite looping

    while (!placed && attempts < maxAttempts) {
        let row = Math.floor(Math.random() * size);
        let col = Math.floor(Math.random() * size);
        let direction = directions[Math.floor(Math.random() * directions.length)];
        if (canPlaceWord(grid, word, row, col, direction)) {
            placeWord(grid, word, row, col, direction);
            placed = true;
        }
        attempts++;
    }

    if (!placed) {
        console.warn(`⚠ Word "${word}" could not be placed after ${maxAttempts} attempts.`);
    }
}

function getDirections(difficulty) {
    const easy = ["horizontal", "vertical"];
    const medium = ["horizontal", "vertical", "diagonal"];
    const hard = ["horizontal", "vertical", "diagonal", "reverse-horizontal", "reverse-vertical", "reverse-diagonal"];

    if (difficulty === "medium") return medium;
    if (difficulty === "hard") return hard;
    return easy;
}

function canPlaceWord(grid, word, row, col, direction) {
    const size = grid.length;
    let dx = 0, dy = 0;

    if (direction.includes("horizontal")) dx = 1;
    if (direction.includes("vertical")) dy = 1;
    if (direction.includes("reverse")) { dx *= -1; dy *= -1; }

    for (let i = 0; i < word.length; i++) {
        let newRow = row + i * dy;
        let newCol = col + i * dx;

        if (newRow < 0 || newRow >= size || newCol < 0 || newCol >= size || (grid[newRow][newCol] && grid[newRow][newCol] !== word[i])) {
            return false;
        }
    }
    return true;
}

function placeWord(grid, word, row, col, direction) {
    let dx = 0, dy = 0;
    if (direction.includes("horizontal")) dx = 1;
    if (direction.includes("vertical")) dy = 1;
    if (direction.includes("reverse")) { dx *= -1; dy *= -1; }

    for (let i = 0; i < word.length; i++) {
        grid[row + i * dy][col + i * dx] = word[i];
    }
}

function displayPuzzle(grid) {
    const puzzleSVG = document.getElementById("puzzleSVG");
    puzzleSVG.innerHTML = ""; // Clear previous content
    const size = grid.length;
    const cellSize = 30;

    puzzleSVG.setAttribute("viewBox", `0 0 ${size * cellSize} ${size * cellSize}`);
    puzzleSVG.setAttribute("width", size * cellSize);
    puzzleSVG.setAttribute("height", size * cellSize);

    grid.forEach((row, i) => {
        row.forEach((letter, j) => {
            let textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
            textElement.setAttribute("x", j * cellSize + cellSize / 2); // Center text in cell
            textElement.setAttribute("y", i * cellSize + cellSize / 2);
            textElement.setAttribute("font-size", "20px");
            textElement.setAttribute("text-anchor", "middle"); // Center horizontally
            textElement.setAttribute("dominant-baseline", "middle"); // Center vertically
            textElement.textContent = letter || getRandomLetter();
            puzzleSVG.appendChild(textElement);
        });
    });

    console.log("✅ Puzzle displayed in SVG format.");
}

function getRandomLetter() {
    return String.fromCharCode(65 + Math.floor(Math.random() * 26));
}

function showSolution() {
    alert("Solution feature to be implemented!");
}

// Load svg2pdf.js library
async function loadSVG2PDF() {
    return new Promise((resolve, reject) => {
        if (typeof window.svg2pdf === 'function') {
            console.log("✅ svg2pdf is already loaded.");
            resolve();
            return;
        }

        console.log("⬇️ Loading svg2pdf...");
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/svg2pdf.js/2.0.0/svg2pdf.umd.min.js"; // Correct source
        script.onload = () => {
            if (typeof window.svg2pdf !== 'function') {
                window.svg2pdf = svg2pdf; // ✅ Assign the function properly
            }
            console.log("✅ svg2pdf.js loaded successfully.");
            resolve();
        };
        script.onerror = (error) => {
            console.error("❌ Failed to load svg2pdf.js", error);
            reject(new Error("Failed to load svg2pdf.js"));
        };
        document.head.appendChild(script);
    });
}


document.getElementById("saveSVGButton").addEventListener("click", function () {
    saveSVG();
});



function saveSVG() {
    // Get the displayed SVG element
    let svgElement = document.getElementById("puzzleSVG");

    // Clone the SVG to avoid modifications
    let clonedSvg = svgElement.cloneNode(true);

    // Serialize the SVG content to a string
    let serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(clonedSvg);

    // Add XML namespace if missing
    if (!svgString.includes("xmlns")) {
        svgString = svgString.replace(
            "<svg",
            '<svg xmlns="http://www.w3.org/2000/svg"'
        );
    }

    // Create a Blob for the SVG file
    let blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });

    // Create a download link
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "word_search_puzzle.svg";

    // Append link, trigger click, and remove link
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("✅ SVG file saved successfully!");
}

async function downloadPDF() {
    console.log("📥 Starting PDF download...");

    try {
        if (!window.jspdf) {
            console.error("❌ jsPDF library is missing!");
            alert("Error: jsPDF library is not loaded.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'letter' });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 50;
        let yOffset = 40;

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.text("Full Name: ___________________________", margin, yOffset);
        pdf.text("Date: ___________________", pageWidth - margin - 60, yOffset);
        yOffset += 40;

        const puzzleSVG = document.getElementById("puzzleSVG");
        if (!puzzleSVG || puzzleSVG.innerHTML.trim() === "") {
            alert("Error: The puzzle is empty! Please generate a puzzle first.");
            return;
        }

        const title = document.getElementById('title').value || "Word Search Puzzle";
        const titleColor = document.getElementById('titleColor').value;
        const fontStyle = document.getElementById('fontStyle').value;
        const instructionText = document.getElementById('instructionText').value || "Find all the words in the puzzle!";
        const instructionFont = document.getElementById('instructionFont').value;
        const instructionSize = parseInt(document.getElementById('instructionSize').value);
        const instructionColor = document.getElementById('instructionColor').value;

        pdf.setFont(fontStyle, "bold");
        pdf.setTextColor(titleColor);
        pdf.setFontSize(18);
        pdf.text(title, pageWidth / 2, yOffset, { align: "center" });
        yOffset += 30;

        pdf.setFont(instructionFont, "normal");
        pdf.setTextColor(instructionColor);
        pdf.setFontSize(instructionSize);
        pdf.text(instructionText, margin, yOffset);
        yOffset += 30;

        console.log("🎯 Converting SVG to PNG...");

        const svgData = new XMLSerializer().serializeToString(puzzleSVG);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imgData = canvas.toDataURL("image/png", 1.0);
            const scaleFactor = Math.min((pageWidth - 2 * margin) / img.width, 300 / img.height);
            const newWidth = img.width * scaleFactor;
            const newHeight = img.height * scaleFactor;
            const xPos = (pageWidth - newWidth) / 2;

            pdf.addImage(imgData, "PNG", xPos, yOffset, newWidth, newHeight);
            yOffset += newHeight + 30;

            addWordList(pdf, yOffset, pageWidth, margin);
            pdf.save("word_search_puzzle.pdf");
            console.log("📄 PDF download completed.");
        };

        img.src = url;

    } catch (error) {
        console.error("❌ Error during PDF creation:", error);
        alert("An error occurred while creating the PDF.");
    }
}


// ✅ Function to Add Word List Below the Puzzle
function addWordList(pdf, yOffset, pageWidth, margin) {
    const wordsInput = document.getElementById("words").value;
    const words = wordsInput.split(",").map(word => word.trim().toUpperCase());
    const title = document.getElementById('title').value || "Word Search Puzzle";
    const titleColor = document.getElementById('titleColor').value;
    const fontStyle = document.getElementById('fontStyle').value;

    pdf.setFont(fontStyle, "bold");
    pdf.setTextColor(titleColor);
    pdf.setFontSize(18);
    
    pdf.text("Word List:", margin, yOffset);
    yOffset += 20;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    pdf.setTextColor("Black");

    const colCount = 3; // 3 columns for words
    const colWidth = (pageWidth - (margin * 2)) / colCount;

    words.forEach((word, index) => {
        let colIndex = index % colCount;
        let rowIndex = Math.floor(index / colCount);
        let newYOffset = yOffset + rowIndex * 15; // Increased spacing

        // ✅ Handle Page Overflow
        if (newYOffset > 750) {
            pdf.addPage();
            yOffset = 40;
            pdf.text("Word List (continued):", margin, yOffset);
            yOffset += 30;
            newYOffset = yOffset;
        }

        pdf.text(word, margin + colIndex * colWidth, newYOffset);
    });
}
