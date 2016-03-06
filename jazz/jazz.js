
//populate the array of song titles

var songs = ["Ko_Ko", "But_Not_For_Me", "Moon_Dreams", "Nights_At_The_Turn_Table", "O_Grande_Amor", "Black_And_Tan_Fantasy", "Jersey_Bounce", "Madness_In_Great_Ones"]
var artists = ["Charlie_Parker", "Chet_Baker", "Duke_Ellington", "Gerry_Mulligan", "Stan_Getz", "Duke_Ellington", "Benny_Goodman", "Duke_Ellington"]
var years = ["1945", "1996", "1949", "1953", "1963", "1930", "1942", "1957"]
var albums = ["Null", "Blue_Note_Blend_2", "Birth_Of_The_Cool", "Nights_At_The_Turn_Table", "Getz/Gilberto", "Null", "Null", "Such_Sweet_Thunder" ]

//Use this array to determine which question we should ask. Our choices are which song, which artist, which year, and which almub is this song from
var qOneDistribution = [songs, songs, songs, songs, songs, songs, artists, years, albums];
var qTwoDistribution = [songs, artists, years, albums];

var answerChoices = new Array();
var correctButtonNum;
var answerIndex;
var answer;
var currentSongName;

window.onload = function()
{
    loadQuestion();
}

function loadQuestion()
{
    var answerSrc = qOneDistribution[Math.floor(Math.random()*qOneDistribution.length)];
    answerIndex = Math.floor(Math.random()*answerSrc.length);
    //Make sure we aren't asking a quesiton that doesn't have an answer
    while(answerSrc[answerIndex] === "Null")
    {
        answerIndex = Math.floor(Math.random()*answerSrc.length);
    }

    currentSongName = songs[answerIndex];

    //35% chance of asking 2 questions
    var twoQuestions = (Math.floor(Math.random()*100 + 1)) > 35;
    var answerSrcTwo = qTwoDistribution[Math.floor(Math.random()*qTwoDistribution.length)];
    //Make sure we aren't asking the same question twice
    while(answerSrc == answerSrcTwo || answerSrcTwo[answerIndex] === "Null")
    {
	answerSrcTwo = qTwoDistribution[Math.floor(Math.random()*qTwoDistribution.length)];
    }

    //Create the text for the correct answer
    answer = answerSrc[answerIndex] + (twoQuestions ? " / " + answerSrcTwo[answerIndex] : "");

    //Create an array full of random incorrect answers
    for(var i = 0; i < 4; i ++)
    {
    	var ran = Math.floor(Math.random()*answerSrc.length);
	var divText = answerSrc[ran];
	var divText2 = answerSrcTwo[ran];
	var optionText = answerSrc[ran] + (twoQuestions ? " / " + answerSrcTwo[ran] : "");
    	while(answerChoices.indexOf(optionText) > -1 || answerIndex == ran || divText === "Null" || (divText2 === "Null" && twoQuestions))
    	{
	    divText = answerSrc[ran];
	    divText2 = answerSrcTwo[ran];
	    ran = Math.floor(Math.random()*songs.length);
	    optionText = answerSrc[ran] + (twoQuestions ? " / " + answerSrcTwo[ran] : "");
    	}
    	answerChoices[i] = optionText;
    }

    //randomly put the correct answer in the answer choices
    correctButtonNum = Math.floor(Math.random()*4 + 1);
    answerChoices[correctButtonNum-1] = answer;

    //Set each of the four divs to have one of the answer choices as text
    for(i = 1; i <= 4; i ++)
    {
	document.getElementById("div"+i).children[0].innerHTML = answerChoices[i-1].replace(/[_]/g, " ");
    }

    //Set the question
    var questionOne = 	answerSrc == songs ? "What is the title of this song" :
			answerSrc == artists ? "Who is the artist of this song" :
			answerSrc == years ? "What year was this song released" : "What album is this song on";
    
    var questionTwo = 	answerSrcTwo == songs ? ", and what is the title" :
			answerSrcTwo == artists ? ", and who is the artist" :
			answerSrcTwo == years ? ", and what year was it released" : ", and what album is it on";

    var question = questionOne + (twoQuestions ? questionTwo : "") + "?";

    document.getElementById("question").innerHTML = question;

    //Start at some random point in the song
    var song = document.getElementById(currentSongName);
    song.currentTime = Math.floor(Math.random()*(song.duration - song.duration/25));
    //song.play();
}

function startNewQuestion()
{
    //Stop the previous song, and load a new one 
    document.getElementById(currentSongName).pause();
    document.getElementById(currentSongName).currentTime = 0;

    //set the oclor of all the divs back to black
    for(i = 1; i <= 4; i ++)
    {
	document.getElementById("div"+i).style.background = "#dadada";
    }

    loadQuestion();
}

function showCorrectAnswer(divClicked)
{
    //High light the correct answer
    document.getElementById("div"+divClicked).style.background = '#ff6666';
    document.getElementById("div"+correctButtonNum).style.background = '#9ad378';

}
