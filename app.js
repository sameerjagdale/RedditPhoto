function getURLs(sr, callback) {
    var resourceCount = 0;

    $.getJSON('https://www.reddit.com/r/' + sr + '/hot.json', function(res) {
        var children = res.data.children;
        var links  = [];
        children.forEach(function(val) {
            if(val.kind !== 't3') 
                return;
            var url = val.data.url;
            var title = val.data.title;
            if(isImage(url)) {
                links.push({'url':url,'title':title});
            } else {
                if(/imgur.com/.test(val.data.domain)) {
                    resourceCount++;
                    getImgurImages(url, links, title, function() {
                        resourceCount--;
                        if(resourceCount === 0) {
                            callback(links);
                        }
                    });
                }
            }
        });
    });
}

function isImage(url) {
    return /\.(gif|jpg|png)$/.test(url);
}

function getImgurImages(url, links, title, callback) {
    $.get(url, function(res){
        //console.log(res);
        var m,
        rex = /<img[^>]+src="\/\/?([^"\s]+)"?(.[^\/>])*\/>/g;
        
        while ( m = rex.exec( res ) ) {
            if(isImage(m[1])) {
                links.push({'url':"https://" + m[1] , 'title':title});
            }
        }
        
        callback();
    }); 
}    

function processLinks(links) {
    $('.overlay').show(500);
    
    var imgCount = links.length;
    $('.fotorama').html('');
   links.forEach(function(link) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            var e = this;    
            if(e.readyState === 4) {
                imgCount--;
                if(e.status === 200)
                $('.fotorama').append("<img src=\""+ window.URL.createObjectURL(e.response) + "\"" + "data-caption=\""+ link.title+ "\">");
            }
            if(imgCount === 0) {
                $('.fotorama').fotorama();
                $('.overlay').hide(500);
            }
        
        }
        xhr.open('GET', link.url);
        xhr.responseType = 'blob';
        xhr.send();
  });
}

function getRandomInRange(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function refresh() {
    subreddits = ['aww','earthporn', 'foodporn', 'roomporn', 'urbanexploration'];
    indx = getRandomInRange(0,subreddits.length - 1) 
    getURLs(subreddits[indx], processLinks);
}

setInterval(refresh, 24*60*60*1000);
refresh();

