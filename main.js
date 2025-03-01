const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

//const PlAYER_STORAGE_KEY = "F8_PLAYER";

const player = $(".player")
const title = $('header h2')
const cd = $(".cd");
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const repeatBtn = $(".btn-repeat");
const prevBtn = $(".btn-prev");
const playBtn = $(".btn-toggle-play");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const progress = $("#progress");
const playlist = $('.playlist')

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,

  // config: {},
  /* // (1/2) Uncomment the line below to use localStorage
  // config: JSON.parse(localStorage.getItem(PlAYER_STORAGE_KEY)) || {},
  setConfig: function (key, value) {
    this.config[key] = value;
    // (2/2) Uncomment the line below to use localStorage
    // localStorage.setItem(PlAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      }
    });
  }, */

  songs: [
    {
      title: "Người Đáng Thương Là Anh",
      singer: "Only C",
      linkCDImg: "./asset/ndtla.jfif",
      linkAudio: "./asset/Nguoi-Dang-Thuong-La-Anh-Only-C.mp3"
    },
    {
      title: "Chạy Khỏi Thế Giới Này",
      singer: "Phương Ly ft. Da LAB",
      linkCDImg: "./asset/cktgn.jpg",
      linkAudio: "./asset/Chay-Khoi-The-Gioi-Nay-Da-LAB-Phuong-Ly.mp3"
    },
    {
      title: "Vì Anh Đâu Có Biết",
      singer: "Madihu ft. Vũ.",
      linkCDImg: "./asset/vadcb.jfif",
      linkAudio: "./asset/Vi-Anh-Dau-Co-Biet-Madihu-Feat-Vu.mp3"
    },
    {
      title: "Đoạn Kết Mới",
      singer: "Hoàng Dũng",
      linkCDImg: "./asset/dkm.jpg",
      linkAudio: "./asset/Doan-Ket-Moi-Hoang-Dung.mp3"
    }
  ],

  render: function() {
    var htmls = this.songs.map((song, index) => {
      return `
        <div class="song ${index === this.currentIndex ? "active" : ""}" data-index="${index}">
          <div class="thumb" style="background-image: url('${song.linkCDImg}')">
          </div>
          <div class="body">
            <h3 class="title">${song.title}</h3>
            <p class="singer">${song.singer}</p>
          </div>
          <div class="option">
            <i class="fas fa-ellipsis-h"></i>
          </div>
        </div>
      `
    })
    playlist.innerHTML = htmls.join('')
  },
  
  handleEventsControl: function() {
    // Xử lý phóng to / thu nhỏ CD
    const cdWidth = cd.offsetWidth
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const newCdWidth = cdWidth - scrollTop
      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0 // tránh số âm
      cd.style.opacity = newCdWidth / cdWidth
    }

    // Xử lý CD quay / dừng
    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000, // 10 seconds
      iterations: Infinity
    })
    cdThumbAnimate.pause()

    // Nhấn nút play
    playBtn.onclick = function () {
      if (app.isPlaying) 
        audio.pause()
      else 
        audio.play()
    }
    // Khi bài hát đang chạy
    audio.onplay = function () {
      app.isPlaying = true
      player.classList.add("playing") // css 26->34
      cdThumbAnimate.play()
    }
    // Khi bài hát dừng
    audio.onpause = function () {
      app.isPlaying = false
      player.classList.remove("playing")
      cdThumbAnimate.pause()
    }

    // Khi tiến độ bài hát thay đổi, thanh tự chạy
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(audio.currentTime * 100 / audio.duration)
        progress.value = progressPercent
      }
    }
    // Xử lý khi tua bài hát
    progress.onchange = function (e) {
      const seekTime = audio.duration * e.target.value / 100
      audio.currentTime = seekTime
    }
  
    // Khi next song
    nextBtn.onclick = function () {
      if (app.isRandom) 
        app.playRandomSong()
      else
        app.nextSong()
      audio.play()
      app.render()
      app.scrollToActiveSong();
    };
    // Khi prev song
    prevBtn.onclick = function () {
      if (app.isRandom) 
        app.playRandomSong()
      else 
        app.prevSong()
      audio.play()
      app.render()
      app.scrollToActiveSong();
    }

     // Xử lý lặp lại một song
    repeatBtn.onclick = function () {
      app.isRepeat = !app.isRepeat;
      //app.setConfig("isRepeat", app.isRepeat);
      repeatBtn.classList.toggle("active", app.isRepeat); // add/remove class active
    };
    // Xử lý bật / tắt random song
    randomBtn.onclick = function () {
      app.isRandom = !app.isRandom;
      //app.setConfig("isRandom", app.isRandom);
      randomBtn.classList.toggle("active", app.isRandom);
    };

    // Xử lý next song khi audio ended
    audio.onended = function () {
      if (app.isRepeat) 
        audio.play();
      else 
        nextBtn.click();
    };

    // Lắng nghe hành vi click vào playlist
    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");
      if (songNode || e.target.closest(".option")) {
        // Xử lý khi click vào song
        if (songNode) {
          app.currentIndex = Number(songNode.dataset.index);
          app.loadCurrentSong()
          app.render()
          audio.play()
        }
        // Xử lý khi click vào song option
        if (e.target.closest(".option")) {
          // nothing
        }
      }
    }
  },

  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      })
    }, 300)},
    
  loadCurrentSong: function() {
    title.textContent = this.songs[this.currentIndex].title
    cdThumb.style.backgroundImage = `url('${this.songs[this.currentIndex].linkCDImg}')`
    audio.src = this.songs[this.currentIndex].linkAudio
  },

  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex == this.songs.length) 
      this.currentIndex = 0
    this.loadCurrentSong()
  },
  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) 
      this.currentIndex = this.songs.length - 1;
    this.loadCurrentSong();
  },
  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length)
    } while (newIndex === this.currentIndex)
    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },

  // loadConfig: function () {
  //   this.isRandom = this.config.isRandom;
  //   this.isRepeat = this.config.isRepeat;
  // },
  
  start: function() {
    // this.loadConfig() // Gán cấu hình từ config vào ứng dụng
    // this.defineProperties() // Định nghĩa các thuộc tính cho object
    this.render()
    this.loadCurrentSong()
    this.handleEventsControl()
  }
}

app.start()