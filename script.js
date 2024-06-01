console.log("This is scripting")
let currentSong = new Audio;
let songs
let currFolder

function extractArtistAndSong(filename) {
    let withoutExtension = filename.replace('.mp3', '');
    let parts = withoutExtension.split(' - ');
    let artistName = parts[0];
    let songName = parts[1]
    return {
        artistName: artistName,
        songName: songName
    };
}

function convertSecondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }
    // Calculate minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Format minutes and seconds to be always two digits
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    // Combine minutes and seconds into the MM:SS format
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    let songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        let filename = song.replaceAll("%20", " ");
        let result = extractArtistAndSong(filename);
        songUL.innerHTML = songUL.innerHTML + `<li>
                            <div class="songimg">
                                <img src="pictures/${result.artistName}.jpg" alt="">
                            </div>
                            <div class="description">
                                <h4>${result.songName}</h4>
                                <p>${result.artistName}</p>
                            </div></li>`
    }
    // Attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".description").lastElementChild.innerHTML + " - " + e.querySelector(".description").firstElementChild.innerHTML + ".mp3")
            playMusic(e.querySelector(".description").lastElementChild.innerHTML + " - " + e.querySelector(".description").firstElementChild.innerHTML + ".mp3")
            play.src = "svg/pause.svg"
        })
    })
    return songs
}

async function displayAlbums() {
    console.log("Displaying Albums")
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    console.log(div)
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")) {
            let folder = (e.href.split("/").slice(-1)[0])
            // Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response = await a.json()
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card"> 
                        <div class="play">
                            <svg fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg"
                                xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 17.804 17.804"
                                xml:space="preserve">
                                <g>
                                    <g id="c98_play">
                                        <path d="M2.067,0.043C2.21-0.028,2.372-0.008,2.493,0.085l13.312,8.503c0.094,0.078,0.154,0.191,0.154,0.313
            c0,0.12-0.061,0.237-0.154,0.314L2.492,17.717c-0.07,0.057-0.162,0.087-0.25,0.087l-0.176-0.04
            c-0.136-0.065-0.222-0.207-0.222-0.361V0.402C1.844,0.25,1.93,0.107,2.067,0.043z" />
                                    </g>
                                    <g id="Capa_1_78_">
                                    </g>
                                </g>
                            </svg>
                        </div>
                        <div class="img">
                        <img class="rounded" src="songs/${folder}/cover.jpg" alt="">
                        </div>
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>
                </div>`
        }
    }


    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])

        })
    })
}


const playMusic = (track, pause = false) => {
    // let audio=new Audio("/songs/"+track)
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "svg/pause.svg"
    }
    let result = extractArtistAndSong(decodeURI(track));

    document.querySelector(".songinfo").innerHTML =
        `
    <div class="songimg">
        <img src="pictures/${result.artistName}.jpg" alt="">
    </div>
    <div class="description">
        <h4>${result.songName}</h4>
        <p>${result.artistName}</p>
    </div>`
}

async function main() {

    // songs = await getSongs("songs/mix")
    // console.log(songs)

    await displayAlbums()





    // Attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".description").lastElementChild.innerHTML + " - " + e.querySelector(".description").firstElementChild.innerHTML + ".mp3")
            playMusic(e.querySelector(".description").lastElementChild.innerHTML + " - " + e.querySelector(".description").firstElementChild.innerHTML + ".mp3")
            play.src = "svg/pause.svg"
        })
    })
    //Attach an event listener to play, next and previous
    play.addEventListener("click", () => {

        if (currentSong.paused) {
            currentSong.play()
            play.src = "svg/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "svg/play.svg"
        }
    })


    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".current").innerHTML = `<div class="time">${convertSecondsToMinutes(parseInt(currentSong.currentTime))}</div>`
        document.querySelector(".total").innerHTML = `<div class="time">${convertSecondsToMinutes(parseInt(currentSong.duration))}</div>`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })


    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = (currentSong.duration) * percent / 100
    })

    // Add an event listener to pervious and next 
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // Add an event listener to repeat
    repeat.addEventListener("click", () => {
        currentSong.currentTime = 0
    })

    // Add an event listener to shuffle
    shuffle.addEventListener("click", () => {
        let shuffle = parseInt(Math.random() * songs.length)
        playMusic(songs[shuffle])
        console.log(shuffle)
    })

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("svg/mute.svg", "svg/volume.svg")
        }
    })

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("svg/volume.svg")) {
            e.target.src = e.target.src.replace("svg/volume.svg", "svg/mute.svg")
            currentSong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("svg/mute.svg", "svg/volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })

    // Load the playlist whenever the card is clicked

}


main()




