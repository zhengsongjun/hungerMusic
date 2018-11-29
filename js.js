function say(callback){
    callback();
    console.log('运动完成')
}

function message(){
    setTimeout(function(){
        console.log('正在运动中')
    },5000)
}

say(message);