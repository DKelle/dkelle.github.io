
//populate the array of song titles
var songarr = ["three_to_get_ready", "walking_shoes", "out_of_nowhere", "night_at_the_turntable", "but_not_for_me", "all_the_things_you_are"];
var answerChoices = new Array();
var correctSongNum;
var songnum;
var songname;

window.onload = function()
{
    loadQuestion();
}

function loadQuestion()
{
    songnum = Math.floor(Math.random()*songarr.length);
    songname = songarr[songnum];

    //Create an array full of random titles
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
    correctSongNum = Math.floor(Math.random()*4 + 1);
    answerChoices[correctSongNum-1] = songname;

    //Set each of the four divs to have one of the answer choices as text
    for(i = 1; i <= 4; i ++)
    {
	document.getElementById("div"+i).innerHTML = answerChoices[i-1];
    }

    //Start at some random point in the song
    var song = document.getElementById(songname);
    song.currentTime = Math.floor(Math.random()*(song.duration - song.duration/25));
    song.play();
}

function startNewQuestion()
{
    //Stop the previous song, and load a new one 
    document.getElementById(songname).pause();
    document.getElementById(songname).currentTime = 0;

    //set the oclor of all the divs back to black
    for(i = 1; i <= 4; i ++)
    {
	document.getElementById("div"+i).style.color = 'black';
    }

    loadQuestion();
}

function showCorrectAnswer(divClicked)
{
    //High light the correct answer
    document.getElementById("div"+divClicked).style.color = 'red';
    document.getElementById("div"+correctSongNum).style.color = 'green';

}
