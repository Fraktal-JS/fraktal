function updateProgress() {
    const audio = $("#media audio")[0];

    $("#media-progress input")
        .val((100 / audio.duration) * audio.currentTime)
        .css("background-size", `${(100 / audio.duration) * audio.currentTime}% 100%`);
}

function editProgress() {
    const audio = $("#media audio")[0];
    const input = $("#media #media-controls #media-progress input");

    if (!$("#media audio source").attr('src')) return;

    audio.pause();
    $("#media-progress input").css("background-size", `${(100 / audio.duration) * input.val()}% 100%`);
    audio.currentTime = (input.val() * 0.01) * audio.duration;
    audio.play();
}

function mediaTogglePlay() {
    const audio = $("#media audio")[0];
    if (!$("#media audio source").attr('src')) return;

    audio.paused ? audio.play() : audio.pause();

    $("#mctrl-play #paused").css("display", audio.paused ? "" : "none");
    $("#mctrl-play #playing").css("display", audio.paused ? "none" : "");
}

function mediaStop() {
    const audio = $("#media audio")[0];
    $("#media-information").html(`<p><b>Now Playing:</b> Nothing</p>`);

    audio.pause();
    $("#media audio source").attr("src", null);
    audio.load();

    $("#mctrl-play #paused").css("display", "");
    $("#mctrl-play #playing").css("display", "none");
    
    $("#media-progress input")
        .val(0)
        .css("background-size", `0% 100%`);
    
    ipcRenderer.send("podcast::rpcReset"); // eslint-disable-line
}

function mediaToggleVolume() {
    const audio = $("#media audio")[0];

    if (audio.muted) {
        $("#media audio")[0].muted = false;
        $("#mctrl-volume #muted").css("display", "none");
        $("#mctrl-volume #unmuted").css("display", "");
    } else {
        $("#media audio")[0].muted = true;
        $("#mctrl-volume #muted").css("display", "");
        $("#mctrl-volume #unmuted").css("display", "none");
    }
}

$(document).ready(() => {});

/*var mediaPlayer;

document.addEventListener("DOMContentLoaded", function() {
    initialiseMediaPlayer();
    mediaPlayer.addEventListener('timeupdate', updateProgressBar, false);
    mediaPlayer.addEventListener('play', function() {
        var btn = document.getElementById('play-pause-button');
        changeButtonType(btn, 'pause');
    }, false);
    mediaPlayer.addEventListener('pause', function() {
        var btn = document.getElementById('play-pause-button');
        changeButtonType(btn, play);
    }, false);
    mediaPlayer.addEventListener('volumechange', function(e) {
        var btn = document.getElementById('mute-button');
        if (mediaPlayer.muted) changeButtonType(btn, 'unmute');
        else changeButtonType(btn, 'mute');
    }, false);
}, false)

function initialiseMediaPlayer() {
    mediaPlayer = document.getElementById('media-video');
    mediaPlayer.controls = false;
}

function changeButtonType(btn, value) {
    btn.title = value;
    btn.innerHTML = value;
    btn.className = value;
}

function stopPlayer() {
    mediaPlayer.pause();
    mediaPlayer.currentTime = 0;
}

function changeVolume(direction) {
    if (direction === '+') mediaPlayer.volume += mediaPlayer.volume == 1 ? 0 : 0.1;
    else mediaPlayer.volume -= (mediaPlayer.volume == 0 ? 0 : 0.1);
    mediaPlayer.volume = parseFloat(mediaPlayer.volume).toFixed(1);
}

function toggleMute() {
    var btn = document.getElementById('mute-button');
    if (mediaPlayer.muted) {
        changeButtonType(btn, 'mute');
        mediaPlayer.muted = false;
    }
    else {
        changeButtonType(btn, 'unmute');
        mediaPlayer.muted = true;
    }
}

function resetPlayer() {
    progressBar.value = 0;
    mediaPlayer.currentTime = 0;
    changeButtonType(playPauseBtn, 'play');
}

function replayMedia() {
    resetPlayer();
    mediaPlayer.play();
}

function togglePlayPause() {
    var btn = document.getElementById('play-pause-button');
    if (mediaPlayer.paused || mediaPlayer.ended) {
        btn.title = 'pause';
        btn.innerHTML = 'pause';
        btn.className = 'pause';
        mediaPlayer.play();
    }
    else {
        btn.title = 'play';
        btn.innerHTML = 'play';
        btn.className = 'play';
        mediaPlayer.pause();
    }
}

function updateProgressBar() {
    var progressBar = document.getElementById('progress-bar');
    var percentage = (100 / mediaPlayer.duration) * mediaPlayer.currentTime;
    progressBar.value = percentage;
    progressBar.innerHTML = percentage + '% played';
}


*/