const { remote: { BrowserWindow }, ipcRenderer } = require("electron");

const bWindow = BrowserWindow.getFocusedWindow();
const storage = bWindow.storage;

setTimeout(() => $(".cover").fadeOut(2000), 500);

let audio;

document.addEventListener("keydown", function(e) {
    if (e.which === 123) {
        bWindow.webContents.toggleDevTools();
    } else if (e.which === 116 || (e.keyCode == 82 && e.ctrlKey)) {
        location.reload();
    }
});

function search() {
    const searchBar = $("#podcast-search");
    if (!searchBar.val()) return;

    ipcRenderer.send("podcast-search", searchBar.val());

    searchBar.val(null);
    searchBar.blur();
}

function podcastAdd() {
    if (!/https?:\/\/\w+\.\w+(?:[\\\/\-_\w#?=]+)?/.test($('#podcast-add-text').val())) return $("#podcast-add-err").html("* Please provide a valid URL.");

    const searchBar = $("#podcast-add-text");
    if (!searchBar.val()) return;

    $("body").css("cursor", "progress");

    ipcRenderer.send("podcast-add", searchBar.val());

    searchBar.val(null);
    searchBar.blur();

    $('#podcast-add').modal("toggle");
}

function loadPodcast(url) {
    ipcRenderer.send("podcast-load", url);
}

function remove(item) {
    const remove = $(item).parent().children("a");

    ipcRenderer.send("podcast-remove", remove.attr("url"));
}

function podcastList(podcasts) {
    $("body").css("cursor", "");

    $('#podcast-list ul').empty();

    podcasts.length ?
        podcasts.forEach(p => $('#podcast-list ul').append(
            `<li class="nav-item podcast-link">
                <i class="fas fa-times podcast-remove" onclick="remove(this)"></i>
                <a class="nav-link" href="#" onclick="loadPodcast('${p.url}')" url="${p.url}">
                    ${p.title}
                </a>
            </li>`
        )) :
        $('#podcast-list ul').append(
            `<li class="nav-item">
                <a class="nav-link">
                    <span data-feather="file-text"></span>
                    None to Display
                </a>
            </li>`
        );
}

function play(element) {
    const elem = $(element);

    const id = elem.attr("podcast-id");
    const title = elem.attr("podcast-title");
    const url = elem.attr("podcast-url");

    $("#audio-box").empty();

    $("#audio-box").append(`
        <p><b>Now Playing:</b> ${title}</p>
        <audio controls id="audio-play" podcast-id="${id}" onloadstart="this.volume=storage.settings.volume">
            <source src="${url}" type="audio/mpeg">
        </audio>
    `);

    audio = $("#audio-box audio")[0];

    audio.onvolumechange = function() {
        storage.settings.volume = audio.volume;
    };

    audio.play();

    audio.onended = () => {
        const newAudio = $(`#podcast-data-episodes li a[podcast-id="${id - 1}"]`);

        if (!newAudio.length) return $("#audio-box").empty();

        play(newAudio);
    };
}

$(document).ready(function() {
    if (!storage.podcasts) storage.podcasts = [];
    podcastList(storage.podcasts);

    $('#podcast-add-form').submit(function(e) {
        podcastAdd();
        e.preventDefault();
    });

    $('#podcast-add-text').keyup(function(e) {
        $('#podcast-add-text').attr("podcast-can-add", false);
        if (!e.target.value) return $("#podcast-add-err").html(null);
        if (!/https?:\/\/\w+\.\w+(?:[\\\/\-_\w#?=]+)?/.test(e.target.value)) return $("#podcast-add-err").html("* Please provide a valid URL.");
        $("#podcast-add-err").html(null);
        $('#podcast-add-text').attr("podcast-can-add", true);
    });

    ipcRenderer.on("podcast-list", (event, podcasts) => podcastList(podcasts));

    ipcRenderer.on("err-reset", (event, podcasts) => {
        $("body").css("cursor", "not-allowed");
        setTimeout(() => $("body").css("cursor", ""), 1000);
    });

    ipcRenderer.on("podcast-open", (event, data) => {
        $("#main").css("display", "none");

        $('#podcast-data-episodes').empty();
        $('#podcast-data-title').html(data.title);
        $('#podcast-data-description').html(data.description.long);

        let num = 0;

        for (const e of data.episodes) {
            if (e.enclosure) {
                $('#podcast-data-episodes').append(
                    `<li class="nav-item podcast-data-episode-link">
                <a class="nav-link" podcast-id="${num}" podcast-title="${e.title}" podcast-url="${e.enclosure.url}" onclick="play(this)">
                    ${e.title}
                </a>
            </li>`
                );
                num++;
            }
        }

        $("#podcast-data").css("display", "block");
    });
});