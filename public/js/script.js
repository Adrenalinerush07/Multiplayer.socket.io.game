var socket = io();
var symbol;
$(function () {
  $(".board button").attr("disabled", true);
  $(".board> button").on("click", makeMove);
  // Event is called when either player makes a move
  socket.on("move.made", function (data) {
    // Rendering the move
    $("#" + data.position).text(data.symbol);

    // to check later who wins
    myTurn = data.symbol !== symbol;

    // If the game is still going, show who's turn it is
    if (!isGameOver()) {
      if (gameTied()) {
        $("#messages").text("Game Drawn!");
        $(".board button").attr("disabled", true);
      } else {
        renderTurnMessage();
      }
      // If the game is over
    } else {
      // Show the message for the loser
      if (myTurn) {
        $("#messages").text("Game over. You lost.");
        // Show the message for the winner
      } else {
        $("#messages").text("Game over. You won!");
      }
      // Disable the board
      $(".board button").attr("disabled", true);
    }
  });

  // Set up the initial state when the game begins
  socket.on("game.begin", function (data) {
    // The server will asign X or O to the player
    symbol = data.symbol;
    // Give X the first turn
    myTurn = symbol === "X";
    renderTurnMessage();
  });

  // Disable the board if the opponent leaves
  socket.on("opponent.left", function () {
    $("#messages").text("Your opponent left the game.");
    $(".board button").attr("disabled", true);
  });
});

function getBoardState() {
  var obj = {};
  // accessing board 
  $(".board button").each(function () {
    obj[$(this).attr("id")] = $(this).text() || "";
  });
  return obj;
}

function gameTied() {
  var state = getBoardState();

  if (
    state.a0 !== "" &&
    state.a1 !== "" &&
    state.a2 !== "" &&
    state.b0 !== "" &&
    state.b1 !== "" &&
    state.b2 !== "" &&
    state.b3 !== "" &&
    state.c0 !== "" &&
    state.c1 !== "" &&
    state.c2 !== ""
  ) {
    return true;
  }
}

function isGameOver() {
  var state = getBoardState(),
    // One of the rows must be equal to either of these
    // value for
    // the game to be over
    matches = ["XXX", "OOO"],
    // These are all of the possible combinations
    // that would win the game
    rows = [
      state.a0 + state.a1 + state.a2,
      state.b0 + state.b1 + state.b2,
      state.c0 + state.c1 + state.c2,
      state.a0 + state.b1 + state.c2,
      state.a2 + state.b1 + state.c0,
      state.a0 + state.b0 + state.c0,
      state.a1 + state.b1 + state.c1,
      state.a2 + state.b2 + state.c2,
    ];

  // to either 'XXX' or 'OOO'
  for (var i = 0; i < rows.length; i++) {
    if (rows[i] === matches[0] || rows[i] === matches[1]) {
      return true;
    }
  }
}

function renderTurnMessage() {
  // Disable the board if it is the opponents turn
  if (!myTurn) {
    $("#messages").text("Your opponent's turn");
    $(".board button").attr("disabled", true);
    // Enable the board if it is your turn
  } else {
    $("#messages").text("Your turn.");
    $(".board button").removeAttr("disabled");
  }
}

function makeMove(e) {
  e.preventDefault();
  // It's not your turn
  if (!myTurn) {
    return;
  }
  // The space is already checked
  if ($(this).text().length) {
    return;
  }

  // Emit the move to the server
  socket.emit("make.move", {
    symbol: symbol,
    position: $(this).attr("id"),
  });
}
