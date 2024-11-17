const express = require("express");
const router = express.Router();
const chatApp = require("./api");
const path = require("path"); // <-- Import the path module here

router.use('/api', chatApp);

router.use(express.static(path.join(__dirname, "client/public")));

router.get("/*", (req, res) => {
    if (process.env.NODE_ENV === 'production') {
      console.log(path.resolve(__dirname, '../../client/dist', 'index.html'))
      res.sendFile(path.join(__dirname, '../../client/dist/index.html'), {
        headers: {
          'Content-Type': 'text/html'
        }
      });
    }
    // else {
    //   // For development mode, you might want to serve React differently
    //   res.redirect("http://localhost:5173"); // Adjust according to your setup
    // }
});

module.exports = router;
