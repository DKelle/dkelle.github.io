var songarr = ["three_to_get_ready", "out_of_nowhere" ];
var songnum = Math.floor(Math.random()*songarr.length);
//var songarr = ["three_to_get_ready", "walking_shoes", "out_of_nowhere", "night_at_the_turntable", "but_not_for_me", "all_the_things_you_are"
alert(songarr[songnum]);
alert(songarr.length);
document.getElementById(songarr[songnum]).play();
