const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const player = $('.player')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')

const app = {
  currentIndex : 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
        {
          name: "Señorita",
          singer: "Shawn Mendes x Camila Cabello",
          path: "./assets/music/song1.mp3",
          image: "https://photo-resize-zmp3.zadn.vn/w240_r1x1_webp/cover/4/6/e/8/46e83a87e1304b73619f184da45f0554.jpg"
        },
        {
          name: "Polaroid",
          singer: "Imagine Dragons",
          path: "./assets/music/song2.mp3",
          image: "https://photo-resize-zmp3.zadn.vn/w94_r1x1_webp/cover/d/d/9/4/dd942fba80b4a0aa05a5e27c0096c3de.jpg"
        },
        {
          name: "Hard Feelings",
          singer: "Lorde",
          path: "./assets/music/song3.mp3",
          image: "https://photo-resize-zmp3.zadn.vn/w94_r1x1_webp/cover/d/d/1/1/dd1113632d135eeaa5c7293daa2bdd84.jpg"
        },
        {
          name: "High Hopes",
          singer: "Kodaline",
          path: "./assets/music/song4.mp3",
          image: "https://photo-resize-zmp3.zadn.vn/w94_r1x1_webp/covers/6/d/6d9cceae4e980edb015807ba730d91d0_1371227973.jpg"
        },
        {
          name: "Exile",
          singer: "Taylor Swift x Bon Iver",
          path: "./assets/music/song5.mp3",
          image: "https://photo-resize-zmp3.zadn.vn/w94_r1x1_webp/cover/b/7/3/2/b7321d4046d1d9c58b84e773547b1cee.jpg"
        },
        {
          name: "Strangers By Nature",
          singer: "Adele",
          path: "./assets/music/song6.mp3",
          image: "https://photo-resize-zmp3.zadn.vn/w94_r1x1_webp/cover/a/7/5/a/a75a95edec29eefcee8b359a29228e09.jpg"
        },
        {
          name: "Birds",
          singer: "Imagine Dragons x Elisa", 
          path: "./assets/music/song7.mp3",
          image: "https://photo-resize-zmp3.zadn.vn/w94_r1x1_webp/cover/d/d/6/c/dd6c1aee0c81bfa8223587d77853beda.jpg"
        }
  ],
  setConfig: function(key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
  },
  render: function() {
      const htmls = this.songs.map((song, index) => {
          return `
          <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
              <div class="thumb" 
                  style="background-image: url('${song.image}')">
              </div>
              <div class="body">
                  <h3 class="title">${song.name}</h3>
                  <p class="author">${song.singer}</p>
              </div>
              <div class="option">
                  <i class="fas fa-ellipsis-h"></i>
              </div>
          </div>
          `
      })
      playlist.innerHTML = htmls.join('');
  },

  defineProperties: function() {
    Object.defineProperty(this, 'currentSong', {
      get: function() {
        return this.songs[this.currentIndex]
      }
    })
  },

  // DOM EVENT
  handleEvents: function() {
    const _this = this
    const cdWidth = cd.offsetWidth

    // Xử lý CD quay / dừng
    const cdThumbAnimate = cdThumb.animate([
      { transform: 'rotate(360deg)'}
    ], {
      duration: 10000, // 10 seconds
      iterations: Infinity,
    })
    cdThumbAnimate.pause()

    // Xử lý phóng to / thu nhỏ CD
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop

      cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    }

    // Xử lý khi click play
    playBtn.onclick = function() {
      if (_this.isPlaying) {
        audio.pause()
      } else {
        audio.play()
      }
    }

    // Khi song được play
    audio.onplay = function() {
      _this.isPlaying = true
      player.classList.add('playing')
      cdThumbAnimate.play()
    }

    // Khi song được pause
    audio.onpause = function() {
      _this.isPlaying = false
      player.classList.remove('playing')
      cdThumbAnimate.pause()
    }

    // Khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function() {
      if (audio.duration) {
        const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
        progress.value = progressPercent
      }
    }

    // Xử lý khi tua song
    progress.onchange = function (e) {
      const seekTime = audio.duration / 100 * e.target.value
      audio.currentTime = seekTime
    }

    // Khi next song
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong ()
      } else {
        _this.nextSong()
      }
      audio.play()
      _this.render() 
      _this.scrollToActiveSong()
    }

    // Khi prev song
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong ()
      } else {
        _this.prevSong()
      }
      audio.play()
      _this.render() 
      _this.scrollToActiveSong()
    }

    // Xử lý bật/tắt khi random song
    randomBtn.onclick = function (e) {
      _this.isRandom = !_this.isRandom
      _this.setConfig('isRandom', _this.isRandom)
      randomBtn.classList.toggle('active', _this.isRandom)
    }

    // Xử lý lặp lại một song
    repeatBtn.onclick = function (e){
      _this.isRepeat = !_this.isRepeat
      _this.setConfig('isRepeat', _this.isRepeat)
      repeatBtn.classList.toggle('active', _this.isRepeat)
    }

    // Xử lý next song khi audio ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play()
      } else {
        nextBtn.click()
      }
    }

    // Lắng nghe hành vi click vào playlist
    playlist.onclick = function (e) {
      const songNode = e.target.closest('.song:not(.active)');
      if (songNode || e.target.closest('.option')) {
        // Xử lý khi click vào song
        if (e.target.closest('.song:not(.active)')) {
          _this.currentIndex = Number(songNode.dataset.index)
          _this.loadCurrentSong()
          _this.render()
          audio.play()
        }

        // Xử lý khi click vào song option
        if (e.target.closest('.option')) {

        }
      }
    }
  },

  scrollToActiveSong: function() {
    setTimeout(() => {
      $('.song.active').scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }, 300)
  },

  loadCurrentSong: function() {
    heading.textContent = this.currentSong.name
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
    audio.src = this.currentSong.path
  },

  loadConfig: function() {
    this.isRandom = this.config.isRandom
    this.isRepeat = this.config.isRepeat
  },

  nextSong: function() {
    this.currentIndex++
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0
    }
    this.loadCurrentSong()
  },

  prevSong: function() {
    this.currentIndex--
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1 
    }
    this.loadCurrentSong()
  },

  playRandomSong: function() {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);

    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },

  start: function() {
    // Gán cấu hình từ Config
    this.loadConfig ()

    // Định nghĩa các thuộc tính cho Object
    this.defineProperties ()

    // Lắng nghe / xử lý các sự kiện (DOM events)
    this.handleEvents ()

    // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
    this.loadCurrentSong ()

    // Render playlist
    this.render()

    // Hiển thị trạng thái ban đầu của button repeat & random
    randomBtn.classList.toggle('active', _this.isRandom)
    repeatBtn.classList.toggle('active', _this.isRepeat)
  },
}

app.start()

