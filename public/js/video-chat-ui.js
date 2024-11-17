const pillContainer = document.querySelector('.pill-container');
const loading = document.querySelector('.loading');
const idSection = document.querySelector('.id-section');
const callSection = document.querySelector('.call-section');
const copyId = document.getElementById('copyId');
const calling_user_id = document.getElementById('userId');
const ringtone = new Audio("/mp3/ring.mp3")
ringtone.loop = true;
const callInput = document.getElementById("callInput");
const callEndedModal = document.getElementById("callEndedModal");
const closeCallEndedModalBtn = document.getElementById("closeCallEndedModal");


// Function to show the modal
function showCallEndedModal() {
  callEndedModal.style.display = "block";
}

// Function to hide the modal
function hideCallEndedModal() {
  callEndedModal.style.display = "none";
}
closeCallEndedModalBtn.addEventListener("click", hideCallEndedModal);

class Modal {
    constructor() {
      this.modal = document.getElementById("customModal");
      this.overlay = this.modal.querySelector(".modal-overlay");
      this.closeBtn = this.modal.querySelector(".modal-close");
      this.actionBtn = this.modal.querySelector(".modal-button");
      this.title = this.modal.querySelector(".modal-title");
      this.message = this.modal.querySelector(".modal-message");
      this.container = this.modal.querySelector(".modal-container");
  
      this.setupEventListeners();
    }
  
    setupEventListeners() {
      this.overlay.addEventListener("click", () => this.close());
      this.closeBtn.addEventListener("click", () => this.close());
      this.actionBtn.addEventListener("click", () => this.close());
    }
  
    open({
      title = "Notification",
      message = "This is a modal message",
      buttonText = "Close",
      backgroundColor = null,
      textColor = null,
      accentColor = null,
    } = {}) {
      // Update content
      this.title.textContent = title;
      this.message.textContent = message;
      this.actionBtn.textContent = buttonText;
  
      // Update colors if provided
      if (backgroundColor) {
        this.container.style.backgroundColor = backgroundColor;
      }
      if (textColor) {
        this.container.style.color = textColor;
        this.title.style.color = textColor;
      }
      if (accentColor) {
        this.actionBtn.style.backgroundColor = accentColor;
      }
  
      // Show modal
      this.modal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  
    close() {
      this.modal.classList.remove("active");
      document.body.style.overflow = "";
  
      // Reset custom styles
      this.container.style.backgroundColor = "";
      this.container.style.color = "";
      this.title.style.color = "";
      this.actionBtn.style.backgroundColor = "";
    }
  }

  async function generateRandomString(n) {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < n; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }


  class CallNotification {
    constructor() {
      this.notification = document.getElementById('callNotification');
      this.acceptBtn = this.notification.querySelector('.accept');
      this.rejectBtn = this.notification.querySelector('.reject');
      this.message = this.notification.querySelector('.call-message');

      // Default callbacks 

      this.onAccept = () => console.log('received');
      this.onReject = () => console.log('reject');
      
      this.setupEventListeners();
    }
  
    setupEventListeners() {
      this.acceptBtn.addEventListener('click', () => {
        this.onAccept();
        this.hide();
      });
  
      this.rejectBtn.addEventListener('click', () => {
        this.onReject();
        this.hide();
      });
    }
  
    show(options = {}) {
      const {
        message = 'Jhon is calling',
        onAccept,
        onReject
      } = options;
  
      // Update message
      this.message.textContent = message;
      
      // Update callbacks if provided
      if (onAccept) this.onAccept = onAccept;
      if (onReject) this.onReject = onReject;
  
      // Show notification
      this.notification.classList.add('active');
    }
  
    hide() {
      this.notification.classList.remove('active');
    }
  }
  
  // Initialize notification
  const callNotification = new CallNotification();
  
  // Example usage:
  // callNotification.show('John Doe is calling');




  const muteBtn = document.getElementById('muteBtn');
  const videoBtn = document.getElementById('videoBtn');
  
  const micOn = document.querySelector('.mic-on');
  const micSlash = document.querySelector('.mic-slash');
  const videoOn = document.querySelector('.video-on');
  const videoSlash = document.querySelector('.video-slash');
  const endBtn = document.getElementById('endBtn')

  let isMuted = false;
  let isVideoOff = false;

  muteBtn.addEventListener('click', () => {
      isMuted = !isMuted;
      if (isMuted) {
          micOn.style.display = 'none';
          micSlash.style.display = 'block';
          muteBtn.title = "Unmute";
      } else {
          micOn.style.display = 'block';
          micSlash.style.display = 'none';
          muteBtn.title = "Mute";
      }
      const audioTrack = localStream.getAudioTracks()[0]; // Get the audio track
      if (audioTrack.enabled) {
        audioTrack.enabled = false; // Mute the audio
      } else {
        audioTrack.enabled = true; // Unmute the audio
      }

  });

  videoBtn.addEventListener('click', () => {
      isVideoOff = !isVideoOff;
      if (isVideoOff) {
          videoOn.style.display = 'none';
          videoSlash.style.display = 'block';
          videoBtn.title = "Start Video";
      } else {
          videoOn.style.display = 'block';
          videoSlash.style.display = 'none';
          videoBtn.title = "Stop Video";
      }
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack.enabled) {
        videoTrack.enabled = false; // Stop the video
      } else {
        videoTrack.enabled = true; // Resume the video
      }
  });

  endBtn.addEventListener('click' , async () =>{
      // Close the RTCPeerConnection
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;  // Set it to null to indicate it's no longer active
    console.log("Peer connection closed.");
  }

  // Stop all local media tracks
  if (localStream) {
    localStream.getTracks().forEach(track => {
      track.stop();  // Stop each track
    });
    localStream = null;
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;
    console.log("Local media tracks stopped.");
  }
 await sendStopCall()
  pillContainer.style.display = 'none'
  idSection.style.display = 'block'
  callSection.style.display = 'block'
  window.location.reload()
  })

  async function  sendStopCall() {
    return new Promise((resolve , reject) =>{
      try {
        socket.send(JSON.stringify({type:'stop:call',callerId:callInput.value}))
        resolve()
      } catch (error) {
        console.log(error)
        reject()
      }
    })
  }
  copyId.addEventListener('click' , () =>{
    navigator.clipboard.writeText(calling_user_id.textContent)
    .then(() => {
      console.log('text copied to clipboard')
      copyId.textContent = 'copied'
      copyId.style.backgroundColor = "green"
    }
    )
    .catch((error) => console.error('Error copying text:', error));
  })


  // Function to play the ringtone when a call is incoming
function playRingtone() {
  ringtone.play().catch((error) => {
      console.error("Error playing ringtone:", error);
  });
}

// Function to stop the ringtone when the call is answered or rejected
function stopRingtone() {
  ringtone.pause();
  ringtone.currentTime = 0;  // Reset playback to start
}