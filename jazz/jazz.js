//populate the array of song titles
var songs = ["Ko_Ko", "But_Not_For_Me", "Moon_Dreams", "Nights_At_The_Turn_Table", "O_Grande_Amor", "Black_And_Tan_Fantasy", "Jersey_Bounce", "Madness_In_Great_Ones", "Manteca", "Ive_Got_a_Gal_In_Kalamazoo", "Jumping_at_the_Woodside"];
var artists = ["Charlie_Parker", "Chet_Baker", "Duke_Ellington", "Gerry_Mulligan", "Stan_Getz", "Duke_Ellington", "Benny_Goodman", "Duke_Ellington", "Charlie_Parker", "Glen_Miller", "Count_Baise"];
var years = ["1945", "1996", "1949", "1953", "1963", "1930", "1942", "1957", "1947", "Null", "Null"];
var albums = ["Null", "Blue_Note_Blend_2", "Birth_Of_The_Cool", "Nights_At_The_Turn_Table", "Getz/Gilberto", "Null", "Null", "Such_Sweet_Thunder", "Null", "Null", "Null"];

//Use this array to determine which question we should ask. Our choices are which song, which artist, which year, and which almub is this song from
var qOneDistribution = [songs, songs, songs, songs, years, albums, artists, years, albums];
var qTwoDistribution = [songs, artists, artists, artists, years, albums];
//var qOneDistribution = [songs, songs, songs, songs, years, artists, years,];
//var qTwoDistribution = [songs, artists, artists, artists, years];

var answerChoices = new Array();
var correctButtonNum;
var answerIndex;
var answer;
var currentSongName;
var answerSrc;
var answerSrcTwo;
var twoQuestions;
var answerDisplayed;

window.onload = function()
{
    loadQuestion();
}

function loadQuestion()
{
    answerSrc = qOneDistribution[Math.floor(Math.random()*qOneDistribution.length)];
    answerIndex = Math.floor(Math.random()*answerSrc.length);
    //Make sure we aren't asking a quesiton that doesn't have an answer
    while(answerSrc[answerIndex] === "Null")
    {
        answerIndex = Math.floor(Math.random()*answerSrc.length);
    }

    currentSongName = songs[answerIndex];

    //35% chance of asking 2 questions
    twoQuestions = (Math.floor(Math.random()*100 + 1)) > 35;
    answerSrcTwo = qTwoDistribution[Math.floor(Math.random()*qTwoDistribution.length)];
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
    	while(answerChoices.indexOf(optionText) > -1 || optionText === answer || optionText.indexOf("Null") > -1)
    	{
	    ran = Math.floor(Math.random()*songs.length);
	    divText = answerSrc[ran];
	    divText2 = answerSrcTwo[ran];
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
    //song.currentTime = Math.floor(Math.random()*(song.duration - song.duration/25));
    song.play();
    answerDisplayed = false;
}

function startNewQuestion()
{
    if(!answerDisplayed)
    {
	return;
    }

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
    //Check if the correct answer is already being shown. If so, Do nothing
    if(answerDisplayed)
    {
	return;
    }

    //High light the correct answer
    document.getElementById("div"+divClicked).style.background = '#ff6666';
    document.getElementById("div"+correctButtonNum).style.background = '#9ad378';

    alterDistribution(divClicked == correctButtonNum);
    answerDisplayed = true;
}

function alterDistribution(answeredCorrectly)
{
    //Alter the distributions, so we are less likely to keep asking questions the user is getting right
    if(answeredCorrectly) 
    {
	//User was correct, so take one answerSrc out of distribution, unless it's the only one left
	var occurences = countOccurences(qOneDistribution, answerSrc);
	if(occurences > 1)
	{
	    qOneDistribution.splice(qOneDistribution.indexOf(answerSrc), 1);
	}
	
	//Also make sure this song is asked about less frequently
	occurences = countOccurences(songs, currentSongName)
	if(occurences > 1)
	{
	    var indexToRemove = songs.indexOf(currentSongName);
	    songs.splice(indexToRemove, 1);
	    albums.splice(indexToRemove, 1);
	    years.splice(indexToRemove, 1);
	    artists.splice(indexToRemove, 1);

	}

    }
    else
    {
	//The user got the question wrong. Add answerSrc to the distribution so we ask it more often
	qOneDistribution.push(answerSrc);

	//Add this song so it gets asked about more
	var indexToAdd = songs.indexOf(currentSongName);
	songs.push(songs[indexToAdd]);
	years.push(years[indexToAdd]);
	artists.push(artists[indexToAdd]);
	albums.push(albums[indexToAdd]);
	console.log("incrementing song: "+songs[indexToAdd]+"\n");
    }
}

function countOccurences(arr, elem)
{
    var count = 0;
    for(var i = 0; i < arr.length; i ++)
    {
	if(arr[i] === elem)
	{
	    count ++;
	}
    }
    return count;
}
