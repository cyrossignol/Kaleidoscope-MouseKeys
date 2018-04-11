var startGame = (function (window, document) {

    'use strict';

    var welcome = document.getElementById('welcome');
    var game = document.getElementById('game');

    var stats = (function () {
        var hits = 0;
        var hops = 0;
        var time = 0;
        var movingAvgHops = [ ];
        var movingAvgTimes = [ ];
        var lastHitTime = 0;

        var hitsScore = document.getElementById('score_hits');
        var hopsScore = document.getElementById('score_hops');
        var timeScore = document.getElementById('score_time');
        var avgHopsScore = document.getElementById('score_hops_avg');
        var avgTimeScore = document.getElementById('score_time_avg');

        function average(items) {
            if (items.length === 0) {
                return 0;
            }

            return items.reduce(function (current, next) {
                return current + next;
            }) / items.length;
        }

        function round(number, precision) {
            var scale = Math.pow(10, precision);

            // Here be floating-point errors (but we don't really care):
            return Math.round(number * scale) / scale;
        }

        function refreshScore() {
            hitsScore.innerHTML = hits;
            hopsScore.innerHTML = hops;
            timeScore.innerHTML = round(time / 1000, 2);
            avgHopsScore.innerHTML = round(average(movingAvgHops), 2);
            avgTimeScore.innerHTML = round(average(movingAvgTimes) / 1000, 2);
        }

        return {
            reset: function () {
                hits = hops = time = 0;
                movingAvgHops = [ ];
                movingAvgTimes = [ ];

                refreshScore();
            },

            recordHit: function () {
                var now = new Date().getTime();
                hits++;

                if (hits > 1) {
                    if (movingAvgHops.push(hops) > 10) {
                        movingAvgHops.shift();
                    }

                    if (movingAvgTimes.push(now - lastHitTime) > 10) {
                        movingAvgTimes.shift();
                    }

                    time = now - lastHitTime;
                }

                hops = 0;
                lastHitTime = now;
                refreshScore();
            },

            recordHop: function () {
                hops++;
                hopsScore.innerHTML = hops;
            }
        };
    })();

    game.addEventListener('contextmenu', function (event) {
        event.preventDefault();
        event.target.click();
    });

    game.addEventListener('mousemove', function (event) {
        stats.recordHop();
    });

    function startGame(gridSize) {
        welcome.style.display = 'none';
        stats.reset();

        game.appendChild(buildGridLayer(gridSize));
        game.appendChild(buildClickTarget());
        game.style.display = 'block';

        if (document.body.requestFullscreen) {
            document.body.requestFullscreen();
        } else if (document.body.webkitRequestFullscreen) {
            document.body.webkitRequestFullscreen();
        } else if (document.body.mozRequestFullScreen) {
            document.body.mozRequestFullScreen();
        } else if (document.body.msRequestFullscreen) {
            document.body.msRequestFullscreen();
        }
    }

    function buildGridLayer(gridSize) {
        var grid = createGrid(gridSize);
        var cells = getCells(grid);

        for (var depth = 0; depth < 8 - (gridSize * 2); depth++) {
            var nextCells = [ ];

            for (var cell = 0; cell < cells.length; cell++) {
                var subGrid = createGrid(gridSize);

                nextCells = nextCells.concat(getCells(subGrid));
                cells[cell].appendChild(subGrid);
            }

            cells = nextCells;
        }

        return grid;
    }

    function buildClickTarget() {
        var target = document.createElement('div');
        target.id = 'target';

        target.addEventListener('click', function () {
            stats.recordHit();

            target.style.left = Math.random() * 95 + '%';
            target.style.top = Math.random() * 95 + '%';
        });

        return target;
    }

    function createGrid(gridSize) {
        var grid = document.createElement('div');
        grid.className = 'grid grid-' + gridSize;

        for (var row = 0; row < gridSize; row++) {
            var gridRow = document.createElement('div');
            gridRow.className = 'row';

            for (var col = 0; col < gridSize; col++) {
                var cell = document.createElement('div');
                cell.className = 'cell';

                gridRow.appendChild(cell);
            }

            grid.appendChild(gridRow);
        }

        return grid;
    }

    function getCells(grid) {
        return Array.prototype.slice.call(grid.getElementsByClassName('cell'));
    }

    return startGame;

})(window, document);
