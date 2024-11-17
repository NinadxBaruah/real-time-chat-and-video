// const express = require("express");
// const router = express.Router();

// const handleProjectTicTacToe = require("../../controllers/handleProjectTicTacToe");
// const handleOfflineGameBoard = require("../../controllers/handleOfflineGameBoard")
// const multiplayerRoute = require("../http.route/multiplayerRoute")
// const chatAppRouter = require("./chatApp")
// const chatApp = require("./api")



// router.get('/tic-tac-toe',handleProjectTicTacToe);
// router.get('/tic-tac-toe/offlineGameBoard',handleOfflineGameBoard)
// router.use('/tic-tac-toe/multiplayer',multiplayerRoute);
// router.use('/chat-app', chatAppRouter)
// // router.get('/offlineGameBoard',handleOfflineGameBoard);
// module.exports = router

const express = require("express");
const router = express.Router();
const path = require("path");

const chatApp = require("./api");








// Chat app API routes
router.use('/chat-app/api', chatApp);

// Chat app client routes - This should be the last route for chat-app
router.get('/chat-app/*', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, 'dist/index.html'), {  //../../client/
      headers: {
        'Content-Type': 'text/html'
      }
    });
  } else {
    res.redirect("http://localhost:5173");
  }
});

module.exports = router;