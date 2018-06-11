const { remote: { BrowserWindow }, ipcRenderer } = require("electron");

const bWindow = BrowserWindow.getFocusedWindow();
const storage = bWindow.storage;

setTimeout(() => $(".cover").fadeOut(2000), 500);

function loadPodcasts() {
    $("body").css("cursor", "");

    $('#podcast-list ul').empty();

    storage.podcasts.length ?
        storage.podcasts.forEach(p => $('#podcast-list ul').append(
            `<li class="nav-item podcast-link">
                <i class="fas fa-times podcast-remove" onclick="ipcRenderer.send('podcast::remove', $(this).parent().children('a').attr('url'));"></i>
                <a class="nav-link" href="#" onclick="ipcRenderer.send('podcast::load', '${p.url}');" url="${p.url}">
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

function addPodcast() {
    if (!/https?:\/\/\w+\.\w+(?:[\\\/\-_\w#?=]+)?/.test($("#podcast-add-input").val()))
        return $("#podcast-add-err").html("* Please provide a valid URL.");

    const searchBar = $("#podcast-add-input");
    if (!searchBar.val()) return;

    $("body").css("cursor", "progress");

    ipcRenderer.send("podcast::add", searchBar.val());

    searchBar.val(null);
    searchBar.blur();

    $('#podcast-add').modal("toggle");
}

function play(element) {
    const media = $("#media");
    const audio = $("#media audio");

    const elem = $(element);

    const podcast = elem.attr("podcast-title");

    const id = elem.attr("episode-id");
    const title = elem.attr("episode-title");
    const url = elem.attr("episode-url");

    $("#media audio source").attr("src", url);

    audio.attr("podcast-id", id);

    audio[0].load();
    audio[0].play();

    ipcRenderer.send("podcast::play", { title, podcast });

    audio[0].onended = () => {
        const newAudio = $(`#podcast-data-episodes li a[episode-id="${id - 1}"]`);
        if (!newAudio.length) return audio[0].empty();

        play(newAudio);
    };
}

function search() {
    const searchBar = $("#podcast-search");
    if (!searchBar.val()) return;

    ipcRenderer.send("podcast::search", searchBar.val());

    searchBar.val(null);
    searchBar.blur();
}

$(document).keydown(e => {
    if (e.which === 123) {
        bWindow.webContents.toggleDevTools();
    } else if (e.which === 116 || (e.keyCode == 82 && e.ctrlKey)) {
        location.reload();
    }
});

$(document).ready(() => {
    loadPodcasts();

    $('#podcast-add-form').submit(e => { addPodcast(); e.preventDefault(); });

    $('#podcast-add-input').keyup(function(e) {
        if (!e.target.value) return $("#podcast-add-err").html(null);

        const canSubmit = e.target.value && /https?:\/\/\w+\.\w+(?:[\\\/\-_\w#?=]+)?/.test(e.target.value);

        if (canSubmit) {
            $("#podcast-add-err").html(null);
            $("#podcast-add-input").attr("podcast-can-add", true);
        } else {
            $("#podcast-add-err").html("* Please provide a valid URL.");
            $("#podcast-add-input").attr("podcast-can-add", false);
        }
    });

    ipcRenderer.on("podcast-list::reload", (event) => loadPodcasts());

    ipcRenderer.on("err-reset", (event) => {
        $("body").css("cursor", "not-allowed");
        setTimeout(() => $("body").css("cursor", ""), 1000);
    });

    ipcRenderer.on("podcast::open", (event, data) => {
        $("#main").css("display", "none");

        $('#podcast-data-episodes').empty();
        $('#podcast-data-title').html(data.title);
        $('#podcast-data-description').html(data.description.long);

        let interval = 0;

        for (const e of data.episodes) {
            if (e.enclosure) {
                $('#podcast-data-episodes').append(
                    `<li class="nav-item podcast-data-episode-link">
                <a class="nav-link" podcast-title="${data.title}" episode-id="${interval}" episode-title="${e.title}" episode-url="${e.enclosure.url}" onclick="play(this)">
                    ${e.title}
                </a>
            </li>`
                );
                interval++;
            }
        }

        $("#podcast-data").css("display", "block");
    });

    $("#media-progress input").val(0);
    $("#media-progress input").css("background-size", `${$("#media-progress input").val()}% 100%`);

    $("#media-volume input").val(bWindow.storage.settings.volume * 100);
    $("#media-volume input").css("background-size", `${bWindow.storage.settings.volume * 100}% 100%`);

    $("#media-progress input").on("input", () => {
        $("#media-progress input").css("background-size", `${$("#media-progress input").val()}% 100%`);
    });
    $("#media-volume input").on("input", () => {
        $("#media-volume input").css("background-size", `${$("#media-volume input").val()}% 100%`);
    });
});