var me = {};

var you = {};

function keypress(e) {
    console.log(e.which);
    if (e.which == 13){
        var text = document.getElementById("textbox").value;
        if (text !== ""){
            console.log("you hit enter with text " + text);
            if (text.includes("a")) {
                curnode = curnode.left;
            } else {
                curnode = curnode.right;
            }


            insertChat("me", text);
            document.getElementById("textbox").value = "";

            if (curnode == null) {
                resetChat();
            } else {
                insertChat("ashley", curnode.msg);
            }
        }
    }
}

function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

//-- No use time. It is a javaScript effect.
function insertChat(who, text, time = 0){
    var control = "";
    var date = formatAMPM(new Date());

    if (who == "me"){

        control = '<li style="width:100%">' +
                        '<div class="msj macro">' +
                            '<div class="text text-l">' +
                                '<p>'+ text +'</p>' +
                                '<p><small>'+date+'</small></p>' +
                            '</div>' +
                        '</div>' +
                    '</li>';
    }else{
        control = '<li style="width:100%;">' +
                        '<div class="msj-rta macro">' +
                            '<div class="text text-r">' +
                                '<p>'+text+'</p>' +
                                '<p><small>'+date+'</small></p>' +
                            '</div>' +
                        '<div class="avatar" style="padding:0px 0px 0px 10px !important"></div>' +
                  '</li>';
    }
    setTimeout(
        function(){
            $("ul").append(control);

        }, time);

}

function resetChat(){
    $("ul").empty();
    curnode = root;

    //-- Print Messages
    insertChat("ashley", root.msg, 0);
}

class Node {
  constructor(msg, l, r) {
    this.msg = msg;
    this.right = r;
    this.left = l;
  }
}

var yesdumb = new Node("It's okay that you're dumb. Everyone is a little dumb.", null, null);
var nodumb = new Node("I'm really happy to hear that you are not dumb", null, null);

var yessmart = new Node("Yay! I'm glad you're smart. Congrats.", null, null);
var nosmart  = new Node("I'm glad that you can be having a good day enven though you r dum", null, null);

var badday = new Node("I'm sorry to hear you are not having a good day... is it because you are dumb?", yesdumb, nodumb);
var goodday = new Node("Why is your day so good? Is it because you are smart?", yessmart, nosmart);

var root = new Node("Are you having a good day?", goodday, badday);
var curnode = root;

resetChat();


//-- NOTE: No use time on insertChat.
