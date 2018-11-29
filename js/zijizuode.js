$.fn.boomText = function(type){
    var height = this.outerHeight(true);
    if(type == 'world'){
        //获取当前高度
        console.log(height)
        this.html(function(){
            var arr = $(this).text().split('').map(function(word){
                return `<span style="position:relative;top:${height}px">${word}</span>`
            })
            return arr.join('')
        })

        var index = 0
        var $boomTexts = this.find('span')
        var clock = setInterval(function(){
            // $boomTexts.eq(index).addClass('animated' + type)
            $boomTexts.eq(index).animate({
                top:0
            })
            index++
            if(index >= $boomTexts.length){
                clearInterval(clock)
            } 
        },300)           
     }

      if(type == 'line'){
        var text = this.text()
        var html = `<span class="top" style="position:relative;top:${height}px">${this.html()}</span>`
        this.html(html)
        $boomTexts = this.find('span')
        var clock = setInterval(function(){
            $boomTexts.animate({
                top:'0'
            })
            console.log('sss')
            clearInterval(clock)
        },0)
      } 

}
