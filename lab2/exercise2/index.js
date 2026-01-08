const audioPlayer = document.getElementById('audioPlayer');
const videoPlayer = document.getElementById('videoPlayer');
const audioTimeDisplay = document.getElementById('audioTime');
const videoTimeDisplay = document.getElementById('videoTime');

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}


audioPlayer.addEventListener('timeupdate', function() {
    audioTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
});


videoPlayer.addEventListener('timeupdate', function() {
    videoTimeDisplay.textContent = formatTime(videoPlayer.currentTime);
});
