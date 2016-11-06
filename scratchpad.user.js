// ==UserScript==
// @name        Deckbox multilingual search
// @namespace   http://clement.turmel.info/
// @description Deckbox multilingual search
// @include     https://deckbox.org/*
// @require 	https://code.jquery.com/jquery-3.1.0.js
// @require 	https://raw.githubusercontent.com/Clemaul/Deckbox-Translaled-Search/master/removeDiacritics.js
// @resource    customCSS  https://raw.githubusercontent.com/Clemaul/Deckbox-Translaled-Search/master/style.css
// @version     7
// @grant       GM_addStyle
// @grant       GM_getResourceText
// ==/UserScript==

var customCSS = GM_getResourceText ("customCSS");
GM_addStyle (customCSS);

this.$ = this.jQuery = jQuery.noConflict(true);
$( document ).ready(function() {

  var jsonFile = null;

  //number max of cards to display
  var maxResults = 10;


  $.ajax({
    url: "https://raw.githubusercontent.com/Clemaul/Deckbox-Translaled-Search/master/AllSets-x.json",
    type: 'GET',
    crossDomain: true,
    dataType: 'json',
    //async: false,
    success: function(data) {
      jsonFile = data;
      //console.log(jsonFile);
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) { 
      console.log("Status: " + textStatus); console.log("Error: " + errorThrown); 
    }
  });

  var inputToSurcharge = null;
    
  //Input for searching and adding a card in Inventory
  var inventoryAddCardInput = "#new_card_input_advanced";
  //Input for searching and adding a card in Deck
  var deckAddCardInput = "#new_card_input";
    
  console.log("new_card_input_advanced : " + $(inventoryAddCardInput).val());
  console.log("new_card_input : "+ $(deckAddCardInput).val());
    
  //find the input to surcharge.
  if($(inventoryAddCardInput).val() != null){

    inputToSurcharge = inventoryAddCardInput;
  
  }else if($(deckAddCardInput).val() != null){

    inputToSurcharge = deckAddCardInput;
  }
    
  if(inputToSurcharge != null){
      console.log("surcharging " + inputToSurcharge + " !");
      surchargeInput(inputToSurcharge);
  }
    
  function surchargeInput(inputId){
      
      var newInputsAndDisplay = '<div><label for="searchLanguage">Search language</label><select id="searchLanguage"><option value="Chinese Simplified">Chinese Simplified</option><option value="Chinese Traditional">Chinese Traditional</option><option value="French" selected>French</option><option value="German">German</option><option value="Italian">Italian</option><option value="Japanese">Japanese</option><option value="Korean">Korean</option><option value="Portuguese (Brazil)">Portuguese (Brazil)</option><option value="Russian">Russian</option><option value="Spanish">Spanish</option>    </select></div><div><label  id="translatedSearchLabel" for="translatedSearch">selected language Search</label><input id="translatedSearch" type="text"></div><table class="table table-condensed"><thead><tr><th>#</th><th>Translated Search</th><th>EN</th></tr></thead><tbody id="results2"></tbody></table>';

      $(inputId).parent().append(newInputsAndDisplay);

      document.getElementById("translatedSearch").addEventListener("keyup", function(){
        searchTranslatedToEn();
        //console.log("ok");
      });


      function searchTranslatedToEn(){
        var selectedLanguage = $("#searchLanguage").val();

        console.log(selectedLanguage);

        //clear the results
        $("#results2").empty();
        //$("#defaultSearch").val("");
        $(inputId).val("");

        //retrieve fr search value
        var translatedSearch = removeDiacritics($("#translatedSearch").val().toLowerCase());

        console.log(translatedSearch);

        //if fr search value if superior than three
        if(translatedSearch.length>2){      

          var y = 0;
          var firstMatchResult = null;
          var cardsAlreadyMatched = [];

          var itterations = 0;

          //foreach magic bloc
          $.each(jsonFile, function(index , valueBLocs) {
            if(null != valueBLocs.cards){
              //foreach cards

              $.each(valueBLocs.cards, function(index , valueCards) {
                //console.log(valueCards);
                if(null != valueCards.foreignNames){

                  //foreach translations 
                  $.each(valueCards.foreignNames, function(index , valueTranslations) {

                    //if cards contains a translation in selected language
                    //AND if current card match with search string
                    //AND if card not already matched                          
                    if(selectedLanguage == valueTranslations.language
                       && removeDiacritics(valueTranslations.name.toLowerCase()).indexOf(translatedSearch) >= 0
                       && cardsAlreadyMatched.indexOf(valueCards.name) === -1
                       && itterations < maxResults){

                      itterations++;
                      cardsAlreadyMatched.push(valueCards.name);
                      displayResults2(valueTranslations.name , valueCards.name , y+1);
                      firstMatchResult = valueCards.name;
                      y++;                                                               
                    }
                  });
                }

              });
            }

          });

        }

      }
  }





//Displaying all the result into a list
function displayResults2(translatedName , defaultName , number){
	
	var trNode = document.createElement("TR"); 
	
    trNode.onclick = function() {bindDefaultName(defaultName)};
    
    var ThRowNode = document.createElement("TH");
    ThRowNode.appendChild(document.createTextNode(number));
    
    var ThTranslatedNameNode = document.createElement("TH");
    ThTranslatedNameNode.appendChild(document.createTextNode(translatedName));
    
    var ThDefaultNameNode = document.createElement("TH");
    ThDefaultNameNode.appendChild(document.createTextNode(defaultName));
    
    trNode.appendChild(ThRowNode);
    trNode.appendChild(ThTranslatedNameNode);
    trNode.appendChild(ThDefaultNameNode);
    
    document.getElementById("results2").appendChild(trNode);
    
}

//function bindDefaultName(value){
//
//    $("#defaultSearch").val(value);
//}

  function bindDefaultName(value){
    //console.log(value);
    //$("#defaultSearch").val(value);
    $(inputToSurcharge).val(value);
    $(inputToSurcharge).focus();
  }


});


