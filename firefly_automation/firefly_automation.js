/**
 * Moves a star within a box and prints the updated pattern.
 *
 * @param {number} boxWidth - The width of the box.
 * @param {number} boxHeight - The height of the box.
 * @param {number} intervalDuration - The duration in milliseconds between star updates.
 * @throws {Error} Throws an error if the star reaches the edge of the box.
 * @returns {void}
 */
function moveStar(boxWidth, boxHeight, intervalDuration) {
    var star_x = Math.floor(Math.random() * (boxWidth - 1));
    var star_y = Math.floor(Math.random() * (boxHeight - 1));

    var dxy = [
        [-1, 0],
        [0, -1],
        [1, 0],
        [0, 1],
        [0, 0],
        [-1, 1],
        [-1, -1],
        [1, -1],
    ];

    /**
     * Prints the box pattern with the star.
     *
     * @returns {void}
     */
    function printPattern() {
        console.clear()
        for (let i = 0; i < boxHeight; i++) {
            let pattern = '';
            for (let j = 0; j < boxWidth; j++) {
                if (i === 0 || i === boxHeight - 1) {
                    pattern += '-';
                } else {
                    if (j === 0 || j === boxWidth - 1) {
                        pattern += '|';
                    }
                    if (i === star_y && j === star_x) {
                        pattern += '*';
                    } else {
                        pattern += ' ';
                    }
                }
            }
            console.log(pattern);
        }
    }

    /**
     * Updates the star position within the box.
     *
     * @throws {Error} Throws an error if the star reaches the edge of the box.
     * @returns {void}
     */
    function updateStar() {
        const [dx, dy] = dxy[Math.floor(Math.random() * dxy.length)];

        let newStar_X = star_x + dx;
        let newStar_Y = star_y + dy;

        if (1 <= newStar_X && newStar_X <= boxWidth - 2 && 1 <= newStar_Y && newStar_Y <= boxHeight - 2) {
            star_x = newStar_X;
            star_y = newStar_Y;
        }

        else if(newStar_X == 0 || newStar_X == boxWidth -1){
            star_x = star_x - dx;
        }

        else if(newStar_Y == 0 || newStar_Y == boxHeight -1){
            star_y = star_y - dy;
        }

        printPattern();
    }

    // Set interval to update star position and print pattern every specified duration
    const interval = setInterval(updateStar, intervalDuration);
}

moveStar(10, 8, 100);
