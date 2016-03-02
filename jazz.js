var songarr = ["three_to_get_ready", "walking_shoes", "out_of_nowhere", "night_at_the_turntable", "but_not_for_me", "all_the_things_you_are"];

//Populate the array of songs, and pick one of them randomly
//var songarr = ["three_to_get_ready", "out_of_nowhere" ];
var songnum = Math.floor(Math.random()*songarr.length);
var songname = songarr[songnum];
//Create an array full of random titles
var rantitle = new Array();
for(var i = 0; i < 4; i ++)
{
	var ran = Math.floor(Math.random()*songarr.length);
	while(rantitle.indexOf(songarr[ran]) > -1)
	{
		ran = Math.floor(Math.random()*songarr.length);
	}
	rantitle[i] = songarr[ran];
}


window.onload = function()
{
	for(i = 1; i <= 4; i ++)
	{
		document.getElementById("div"+i).innerHTML = rantitle[i-1];
	}
}

document.getElementById(songname).play();
