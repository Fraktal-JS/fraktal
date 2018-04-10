const { remote: { BrowserWindow }, ipcRenderer } = require("electron");
const storage = require("fraktal-storage");

const bWindow = BrowserWindow.getFocusedWindow();
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
    if (!$('#podcast-add-text').attr("podcast-can-add")) return $('#podcast-add-err').html("* URL is not valid.");

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

function play(title, url) {
    $("#audio-box").empty();

    $("#audio-box").append(`
        <p><b>Now Playing:</b> ${title}</p>
        <audio controls id="audio-play">
            <source src="${url}" type="audio/mpeg">
        </audio>
    `);

    audio = $("#audio-box audio")[0];

    audio.play();
}

$(document).ready(function() {
    if (!storage.podcasts) storage.podcasts = [];
    podcastList(storage.podcasts);

    $('#podcast-add-form').submit(function(e) {
        podcastAdd();
        e.preventDefault();
    });

    $('#podcast-add-text').keyup(function(e) {
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

        for (const e of data.episodes) {
            if (e.enclosure) {
                $('#podcast-data-episodes').append(
                    `<li class="nav-item podcast-data-episode-link">
                <a class="nav-link" onclick="play(\`${e.title}\`, '${e.enclosure.url}')">
                    ${e.title}
                </a>
            </li>`
                );
            }
        }

        $("#podcast-data").css("display", "block");
    });
});