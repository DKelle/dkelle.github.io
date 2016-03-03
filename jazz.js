
//populate the array of song titles
var songarr = ["three_to_get_ready", "walking_shoes", "out_of_nowhere", "night_at_the_turntable", "but_not_for_me", "all_the_things_you_are"];
var answerChoices = new Array();


window.onload = function()
{
    loadQuestion();
}

function loadQuestion()
{
    var songnum = Math.floor(Math.random()*songarr.length);
    var songname = songarr[songnum];

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
    var correctSongNum = Math.floor(Math.random()*4 + 1);
    answerChoices[correctSongNum-1] = songname;

    //Set each of the four divs to have one of the answer choices as text
    for(i = 1; i <= 4; i ++)
    {
	document.getElementById("div"+i).innerHTML = answerChoices[i-1];
    }

    document.getElementById(songname).play();
}

function showCorrectAnswer(divClicked)
{
    document.getElementById("div"+divClicked).style.color = 'red';
    document.getElementById("div"+correctSongNum).style.color = 'green';
}
