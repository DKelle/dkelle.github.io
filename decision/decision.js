var me = {};

var you = {};

function keypress(e) {
    console.log(e.which);
    if (e.which == 13){
        var text = document.getElementById("textbox").value;
        if (text !== ""){
            console.log("you hit enter with text " + text);
            if (text.includes("1")) {
                curnode = curnode.l;
            } else {
                curnode = curnode.r;
            }

            send_text(curnode);
        }
    }
}

function send_text(node) {
    // First, send our response
    insertChat("me", node.long_msg, 1000);

    // Clear out the text box
    document.getElementById("textbox").value = "";

    // The other person has to respond to our message, and print our reply options eg:
    // I'm glad you had a good day. Did you sleep well?
    // (1) yes
    // (2) no
    if (node == null) {
        resetChat();
    } else {
        if (node.response_msg == "thisishack") {
            die();
        } else {
            insertChat("ashley", node.response_msg, 3000);

            if (node.l != null && node.r != null) {
                insertChat("ashley", node.l.short_msg, 3100);
                insertChat("ashley", node.r.short_msg, 3150);
            }
        }
    }

}

function die() {

    insertChat("me", "Hey dude, where were you at school today?", 5000, "10/01 6:03 PM");
    insertChat("me", "Are you ignoring me?", 8000, '10/01 6:10 PM');
    insertChat("me", "Hey... is everything okay? Why haven't you been at school all week?", 11000, '10/07 9:00 PM');
    insertChat("me", "...Hello?", 16000, '10/10 3:14 AM');
}

function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return "10/01 " + strTime;
}

//-- No use time. It is a javaScript effect.
function insertChat(who, text, time = 0, date = 0){
    var control = "";
    if (date == 0) {
        date = formatAMPM(new Date());
    }

    if (who == "ashley"){

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

function intro() {
    insertChat("ashley", "Hey, I can't play soccer with you today.", 0);
    insertChat("me", "Why not, what's up?", 1000);

    // Now start the interactive conversation
    insertChat("ashley", root.long_msg, 4300);
    insertChat("ashley", root.l.short_msg, 4400);
    insertChat("ashley", root.r.short_msg, 4500);

}

function resetChat(){
    $("ul").empty();
    curnode = root;

    //-- Print Messages
    //insertChat("ashley", root.long_msg, 0);
    //insertChat("ashley", "(1) " + root.l.short_msg);
    //insertChat("ashley", "(2) " + root.r.short_msg);
}

class Node {
  constructor(short_msg, long_msg, response_msg, l, r) {
    this.short_msg = short_msg;
    this.long_msg = long_msg;
    this.response_msg = response_msg;
    this.r = r;
    this.l = l;
  }
}

var gowith = new Node("(1) I'll go with you", "Why don't I go with you?", "I would like that, thank you for being there for me.", null, null);
var udou = new Node("(2) I understand", "I understand that. You do you, man", "*Suffers with depression for years without seeking help*", null, null);
var uok = new Node("(1) Are you alright?", "Are you okay? It sounds like you might be depressed. I really think you should see someone about how you're feeling", "I'm just scared to talk to them... I don't want them to judge me.", gowith, udou);
var lolyeah = new Node("(2) lol yeah", "Lol, yeah, bet. We all feel like that sometimes", "thisishack", null, null);
var getsleep = new Node("(1) get some sleep", "That sucks dude, get some rest. I'll see you tomorrow", "I just can't do it anymore. Do you ever feel like life isn't worth it?", uok, lolyeah);

var gowith2 = new Node("(1) I'll come with you", "Why don't I go with you? It could help you feel more comfortable and open.", "Actually... I would really like that. Thank you for being there for me. *Friend seeks help and beats depression*", null, null);
var noscare = new Node("(2) Don't be scared", "Nah man, don't be scared. You should just go talk to them! Let me know how it goes though, I have to go get lunch.", "Oh, for sure. Have fun. *Doesn't seek help and suffers from depression*", null, null)

var depression = new Node("(2) Sounds like depression", "It sounds like you are becoming depressed. I think you should go talk to the counselor about how you're feeling.", "I'm just scared to go talk to them. I don't know what to say or how to approach them.", gowith2, noscare);
var ifhw = new Node("(1) I'll let you know what happens at school", "Oh, alright. I'll let you know if we get any homework in class", "Okay, thanks. *Doesn't seek help and suffers with depression*", null, null);
var iknow = new Node("(1) I know", "Yeah man, I know what you mean. Sounds like you just need some rest. See you tomorrow then!", "Yeah, I guess you're right. Maybe I'll feel better after sleeping. Actually, I don't think I am going to go to school tomorrow. I just can't face the day", ifhw, depression);
var soundsserious = new Node("(2) sounds serious", "That sounds serious. Are you okay?", "You know... I'm not sure. I have just felt very overwhelmed lately and kind of worthless. I just want to sleep most days so that these feelings go away, you know?", iknow, depression);

var root = new Node("", "Ugh I'm just stressed about all the assignments we have to do. I've barely slept this month, and I can't focus in class. I feel awful, I'm just going to skip class today and go home and sleep.", '', getsleep, soundsserious);


var curnode = root;

resetChat();
intro();


//-- NOTE: No use time on insertChat.
