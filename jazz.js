
//populate the array of song titles
var songarr = ["three_to_get_ready", "walking_shoes", "out_of_nowhere", "night_at_the_turntable", "but_not_for_me", "all_the_things_you_are"];
var songnum = Math.floor(Math.random()*songarr.length);
var songname = songarr[songnum];

//Create an array full of random titles
var answerChoices = new Array();
for(var i = 0; i < 4; i ++)
{
    var ran = Math.floor(Math.random()*songarr.length);
    while(answerChoices.indexOf(songarr[ran]) > -1 || songnum == ran)
    {
	ran = Math.floor(Math.random()*songarr.length);
    }
    answerChoices[i] = songarr[ran];
}

//randomly put the correct answer in the answer choices
var correctSongNum = Math.floor(Math.random()*4 + 1);
answerChoices[correctSongNum-1] = songname;

window.onload = function()
{
    document.getElementById(songname).play();

    for(i = 1; i <= 4; i ++)
    {
	//Set the text for each div		
	document.getElementById("div"+i).innerHTML = answerChoices[i-1];
    }



}

function showCorrectAnswer(divClicked)
{
    document.getElementById("div"+divClicked).style.color = 'red';
    document.getElementById("div"+correctSongNum).style.color = 'green';
}
