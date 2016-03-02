var songarr = ["three_to_get_ready", "walking_shoes", "out_of_nowhere", "night_at_the_turntable", "but_not_for_me", "all_the_things_you_are"];

//Populate the array of songs, and pick one of them randomly
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


var correctSongNum = Math.floor(Math.random()*4 + 1);
rantitle[correctSongNum] = songname;


window.onload = function()
{
	for(i = 1; i <= 4; i ++)
	{
		if(i == correctSongNum)
		{
			document.getElementById("div"+i).style.color = 'black'
		}
		document.getElementById("div"+i).innerHTML = rantitle[i-1];
	}
}

document.getElementById(songname).play();
