

var EventCenter = {
  on: function(type, handler){
    document.addEventListener(type, handler)
  },
  fire: function(type, data){
    return document.dispatchEvent(new CustomEvent(type, {
      detail: data
    }))
  }
}


  


var App = {
    init:function(){
        Footer.init()
        Fm.init()
    },
    bind:function(){
    }
}

var Fm = {
    init:function(){
        this.$container = $('#page-music')
        this.audio = new Audio()
        this.audio.autoplay = true
        this.bind()
    },
    bind:function(){
        var _this = this
        EventCenter.on('select-albumn',function(e,data){
            _this.id = e.detail.channelId
            _this.name = e.detail.channelName
            _this.loadMusic(function(){
                _this.setMusic()
            })
        })

        this.$container.find('.btn-play').on('click',function(){
            if($(this).hasClass('icon-bofang')){
                $(this).removeClass('icon-bofang').addClass('icon-zanting')
                _this.audio.play()
            }else{
                $(this).addClass('icon-bofang').removeClass('icon-zanting')
                _this.audio.pause()
            }
        })

        this.$container.find('.btn-next').on('click',function(){
            _this.loadMusic()
        })

        this.audio.addEventListener('play',function(){
            console.log('play')
            clearInterval(_this.statusClock)
            _this.statusClock = setInterval(function(){
                _this.updateStatus()
            },1000)
        })

        this.audio.addEventListener('pause',function(){
            clearInterval(_this.statusClock)
        })

        this.$container.find()

        
    },
    loadMusic:function(){
        var _this = this
        $.getJSON('https://jirenguapi.applinzi.com/fm/getSong.php',{channel: this.id}).done(function(ret){
            _this.song = ret['song'][0]
            _this.setMusic(_this.song)
            _this.loadLyric()
        })
    },
    loadLyric:function(){
        var _this = this;
        $.getJSON('https://jirenguapi.applinzi.com/fm/getLyric.php',{sid:this.song.sid}).done(function(ret){
            var lryic = ret.lyric
            var lryicObj = {}
            lryic.split('\n').forEach(function(line){
                var times = line.match(/\d{2}:\d{2}/g)
                var str = line.replace(/\[.+?\]/g,'')
                if(Array.isArray(times)){
                    times.forEach(function(time){
                        lryicObj[time] = str
                    })
                }
            })
            console.log(lryicObj)
            _this.lryicObj = lryicObj
        })
    },
    setMusic:function(){
        this.audio.src = this.song.url
        $('.bg').css('background-image',`url(${this.song.picture})`)
        $('figure').css('background-image',`url(${this.song.picture})`)
        $('.detail h1').html(this.song.title)
        $('.author').html(this.song.artist)
        this.$container.find('.tag').html(this.name)
        this.$container.find('.btn-play').addClass('icon-zanting').removeClass('icon-bofang')
    },
    updateStatus:function(){
        var _this = this
        //事件显示
        var min = Math.floor(_this.audio.currentTime/60)
        var sec = Math.floor(_this.audio.currentTime%60)
        if(sec < 10){
            sec = '0' + sec
        }
        _this.$container.find('.current-tim').html(`${min}:${sec}`)
        //进度条显示
        _this.$container.find('.bar-progress').css('width',_this.audio.currentTime/_this.audio.duration*100+'%')
        //歌词显示
        
        var line = this.lryicObj['0'+min+':'+sec]
        if(line){
          //this.$container.find('.lyric p').text(line)
        this.$container.find('.lyric p').text(line).boomText('line')
        }
        console.log(line)
    }

}

var Footer = {
    init:function(){
        var _this = this;
        this.$foot = $('footer')
        this.$box = this.$foot.find('.box')
        this.$ul = this.$foot.find('ul')
        this.$leftBtn = this.$foot.find('.icon-left')
        this.$rightBtn = this.$foot.find('.icon-right')
        this.toEnd = false
        this.toStart = true
        this.isAnimate = false
        _this.render();
        this.bind()
    },
    bind:function(){
        var _this = this
        $(window).resize(function(){
            _this.setStyle()
        })
        this.$rightBtn.on('click',function(){
            if(_this.isAnimate) return
                _this.isAnimate = true
                _this.toStart = false
                var itemWidth =  _this.$box.find('li').outerWidth(true)
                var rowNum = Math.floor(_this.$box.width() / itemWidth)
                if(!_this.toEnd){
                    _this.$ul.animate({
                        left:'-=' + rowNum * itemWidth
                    },400,function(){
                        _this.isAnimate = false
                        _this.$leftBtn.removeClass('disabled')
                        if( parseFloat(_this.$box.width()) - parseFloat(_this.$ul.css('left')) >= parseFloat(_this.$ul.css('width'))){
                            _this.toEnd = true
                            _this.$rightBtn.addClass('disabled')
                        }
                    })
                }
        })

        this.$leftBtn.on('click',function(){
            if(_this.isAnimate) return
             _this.isAnimate = true
            var itemWidth =  _this.$box.find('li').outerWidth(true)
            var rowNum = Math.floor(_this.$box.width() / itemWidth)
            if(!_this.toStart){
                _this.$ul.animate({
                    left:'+=' + rowNum * itemWidth
                },400,function(){
                    _this.isAnimate = false
                    _this.$rightBtn.removeClass('disabled')
                    if( parseFloat(_this.$ul.css('left')) >= 0 ){
                        _this.toStart = true
                        _this.$leftBtn.addClass('disabled')
                    }
                })
            }
        })

        this.$foot.on('click','li',function(){
            $(this).addClass('active')
                   .siblings().removeClass('active') 
            EventCenter.fire('select-albumn',{
                    channelId:$(this).attr('data-channels-id'),
                    channelName:$(this).attr('data-channels-name')
            })
        })


    },
    render:function(){
        var _this = this;
        $.getJSON('http://api.jirengu.com/fm/getChannels.php')
        .done(function(ret){
            _this.renderFooter(ret.channels)
        }).fail(function(){
            console.log('error')
        })
    },
    renderFooter:function(channels){
        var html = ''
        channels.forEach(function(channels){
            html += `<li data-channels-id="${channels.channel_id}" data-channels-name="${channels.name}">
                    <div class="cover" style="background-image:url(${channels.cover_small})"></div>
                    <h3>${channels.name}</h3>
                    </li>`
        })
        this.$ul.append(html)
        this.setStyle()
    },
    setStyle:function(){
        var count = this.$foot.find('li').length
        var width = this.$foot.find('li').outerWidth(true)
        this.$ul.css({
            width:count*width + 'px'
        })
    }
}

App.init()