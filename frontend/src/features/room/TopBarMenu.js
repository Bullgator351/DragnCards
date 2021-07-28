import React, { useRef, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from "react-router-dom";
import useProfile from "../../hooks/useProfile";
import { sectionToLoadGroupId, sectionToDiscardGroupId } from "./Constants";
import store from "../../store";
import { setGame } from "./gameUiSlice";
import { processLoadList, processPostLoad } from "./Helpers";
import { cardDB } from "../../cardDB/cardDB";
import { loadDeckFromXmlText, getRandomIntInclusive } from "./Helpers";
import { useSetTouchMode } from "../../contexts/TouchModeContext";
import { useSetTouchAction } from "../../contexts/TouchActionContext";


export const TopBarMenu = React.memo(({
    setShowModal,
    gameBroadcast,
    chatBroadcast,
    playerN,
}) => {
  const myUser = useProfile();
  const myUserID = myUser?.id;
  const history = useHistory();
  const setTouchMode = useSetTouchMode();
  const setTouchAction = useSetTouchAction();

  const createdByStore = state => state.gameUi?.created_by;
  const createdBy = useSelector(createdByStore);
  const optionsStore = state => state.gameUi?.options;
  const options = useSelector(optionsStore);
  const roundStore = state => state.gameUi?.game.roundNumber;
  const round = useSelector(roundStore);
  const host = myUserID === createdBy;
  const cardsPerRoundStore = state => state.gameUi?.game.playerData[playerN]?.cardsDrawn;
  const cardsPerRound = useSelector(cardsPerRoundStore);
  
  const dispatch = useDispatch();
  const inputFileDeck = useRef(null);
  const inputFileGame = useRef(null);
  const inputFileCustom = useRef(null);
  console.log("Rendering TopBarMenu", options);

  const handleMenuClick = (data) => {
    if (!playerN) {
      alert("Please sit at the table first.");
      return;
    }
    if (data.action === "reset_game") {
      // Mark status
      chatBroadcast("game_update", {message: "marked game as "+data.state+"."});
      gameBroadcast("game_action", {action: "update_values", options: {updates: [["game", "victoryState", data.state]]}});
      // Save replay
      if (round > 0) {
        gameBroadcast("game_action", {action: "save_replay", options: {}});
        chatBroadcast("game_update",{message: "saved the replay to their profile."});
      }
      // Reset game
      gameBroadcast("game_action", {action: "reset_game", options: {}});
      chatBroadcast("game_update", {message: "reset the game."});
    } else if (data.action === "close_room") {
      // Mark status
      chatBroadcast("game_update", {message: "marked game as "+data.state+"."});
      gameBroadcast("game_action", {action: "update_values", options: {updates: [["game", "victoryState", data.state]]}});
      // Save replay
      if (round > 0) {
        gameBroadcast("game_action", {action: "save_replay", options: {}});
        chatBroadcast("game_update",{message: "saved the replay to their profile."});
      }
      // Close room
      history.push("/profile");
      chatBroadcast("game_update", {message: "closed the room."});
      gameBroadcast("close_room", {});
    } else if (data.action === "load_deck") {
      loadFileDeck();
    } else if (data.action === "unload_my_deck") {
      // Delete all cards you own
      chatBroadcast("game_update",{message: "unloaded their deck."});
      gameBroadcast("game_action", {
        action: "action_on_matching_cards", 
        options: {
            criteria:[["owner", playerN]], 
            action: "delete_card", 
        }
      });
      // Set threat to 00
      chatBroadcast("game_update",{message: "reset their deck."});
      gameBroadcast("game_action", {action: "update_values", options: {updates: [["game", "playerData", playerN, "threat", 0]]}});

    } else if (data.action === "unload_encounter_deck") {
      // Delete all cards from encounter
      chatBroadcast("game_update",{message: "unloaded the encounter deck."});
      gameBroadcast("game_action", {
        action: "action_on_matching_cards", 
        options: {
            criteria:[["owner", "shared"]], 
            action: "delete_card", 
        }
      });
    } else if (data.action === "random_coin") {
      const result = getRandomIntInclusive(0,1);
      if (result) chatBroadcast("game_update",{message: "flipped heads."});
      else chatBroadcast("game_update",{message: "flipped tails."});
    } else if (data.action === "random_number") {
      const max = parseInt(prompt("Random number between 1 and...","3"));
      if (max>=1) {
        const result = getRandomIntInclusive(1,max);
        chatBroadcast("game_update",{message: "chose a random number (1-"+max+"): "+result});
      }
    } else if (data.action === "cards_per_round") {
      const num = parseInt(prompt("Set the number of cards drawn during resource phase:",cardsPerRound));
      if (num>=0) {
        gameBroadcast("game_action", {action: "update_values", options: {updates: [["game", "playerData", playerN, "cardsDrawn", num]]}});
        chatBroadcast("game_update",{message: "set the number of cards they draw during the resource phase to "+num+"."});
      }
    } else if (data.action === "spawn_existing") {
      setShowModal("card");
    } else if (data.action === "spawn_custom") {
      setShowModal("custom");
    } else if (data.action === "spawn_quest") {
      setShowModal("quest");
    } else if (data.action === "download") {
      downloadGameAsJson();
    } else if (data.action === "load_game") {
      loadFileGame();
    } else if (data.action === "load_custom") {
      loadFileCustom();
    } else if (data.action === "num_players") {
      const num = data.value;
      gameBroadcast("game_action", {action: "update_values", options: {updates: [["game", "numPlayers", num]]}});
      chatBroadcast("game_update", {message: "set the number of players to: " + num});
    } else if (data.action === "layout") {
      gameBroadcast("game_action", {action: "update_values", options: {updates: [["game", "layout", data.value]]}});
    } else if (data.action === "quest_mode") {
      gameBroadcast("game_action", {action: "update_values", options: {updates: [["game", "questMode", data.mode]]}});
      chatBroadcast("game_update", {message: "set the quest mode to " + data.mode + "."});
    }
  }

  const loadFileDeck = () => {
    inputFileDeck.current.click();
  }

  const loadFileGame = () => {
    inputFileGame.current.click();
  }

  const loadFileCustom = () => {
    inputFileCustom.current.click();
  }

  const loadDeck = async(event) => {
    event.preventDefault();
    const reader = new FileReader();
    reader.onload = async (event) => { 
      const xmlText = (event.target.result)
      loadDeckFromXmlText(xmlText, playerN, gameBroadcast, chatBroadcast, options["privacyType"]);
    }
    reader.readAsText(event.target.files[0]);
  }

  const uploadGameAsJson = async(event) => {
    event.preventDefault();
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const gameObj = JSON.parse(event.target.result);
        if (gameObj) {
          dispatch(setGame(gameObj));
          gameBroadcast("game_action", {action: "update_values", options: {updates: [["game", gameObj]]}})
          chatBroadcast("game_update", {message: "uploaded a game."});
          gameBroadcast("game_action", {action: "update_values", options: {updates: [["game", "replayStep", 0]]}})
        }
      } catch(e) {
          alert("Game must be a valid JSON file."); // error in the above string (in this case, yes)!
      }
    }
    reader.readAsText(event.target.files[0]);
  }

  const uploadCustomCards = async(event) => {
    event.preventDefault();
    const reader = new FileReader();
    reader.onload = async (event) => {
      //try {
        console.log("target result", event.target.result);
        var loadList = JSON.parse(event.target.result);
        console.log("loadlist", loadList);
        //if (loadList) {
          loadList = processLoadList(loadList, playerN);
          gameBroadcast("game_action", {action: "load_cards", options: {load_list: loadList}});
          chatBroadcast("game_update",{message: "loaded a deck."});
          processPostLoad(loadList, playerN, gameBroadcast, chatBroadcast);
        //}
    //  } catch(e) {
      //    alert("Custom cards must be a valid text file. Check out the tutorial on YouTube.");
      //}
    }
    reader.readAsText(event.target.files[0]);
  }

  const downloadGameAsJson = () => {
    const state = store.getState();
    const exportObj = state.gameUi.game;
    const exportName = state.gameUi.gameName;
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    chatBroadcast("game_update", {message: "downloaded the game."});
  }

  return(
    <li key={"Menu"}><div className="h-full flex items-center justify-center" href="#">Menu</div>
      <ul className="second-level-menu">
        {host &&
          <li key={"numPlayers"}>
            <a href="#">Player count</a>
            <ul className="third-level-menu">
                <li key={"numPlayers1"}><a onClick={() => handleMenuClick({action:"num_players", value: 1})} href="#">1</a></li>
                <li key={"numPlayers2"}><a onClick={() => handleMenuClick({action:"num_players", value: 2})} href="#">2</a></li>
                <li key={"numPlayers3"}><a onClick={() => handleMenuClick({action:"num_players", value: 3})} href="#">3</a></li>
                <li key={"numPlayers4"}><a onClick={() => handleMenuClick({action:"num_players", value: 4})} href="#">4</a></li>
            </ul>
          </li>
        }
        {host &&
          <li key={"layout"}>
            <a href="#">Layout</a>
            <ul className="third-level-menu">
                <li key={"standard"}><a onClick={() => handleMenuClick({action:"layout", value: "standard"})} href="#">Standard</a></li>
                <li key={"extra"}><a onClick={() => handleMenuClick({action:"layout", value: "extra"})} href="#">Extra staging areas / map</a></li>
            </ul>
          </li>                
        }
        <li key={"touch_mode"}>
          <a href="#">Touch mode</a>
          <ul className="third-level-menu">
              <li key={"touch_enabled"}><a onClick={() => setTouchMode(true)} href="#">Enable (experimental)</a></li>
              <li key={"touch_disabled"}><a onClick={() => {setTouchMode(false) && setTouchAction(null)}} href="#">Disable</a></li>
          </ul>
        </li> 
        <li key={"load"}>
          <a href="#">Load</a>
          <ul className="third-level-menu">
            <li key={"load_quest"}><a href="#" onClick={() => handleMenuClick({action:"spawn_quest"})} href="#">Load quest</a></li>
            <li key={"load_deck"}>
              <a href="#" onClick={() => handleMenuClick({action:"load_deck"})} href="#">Load deck (OCTGN file)</a>
              <input type='file' id='file' ref={inputFileDeck} style={{display: 'none'}} onChange={loadDeck}/>
            </li>
            <li key={"load_game"}>
              <a  onClick={() => handleMenuClick({action:"load_game"})} href="#">Load game (.json)</a>
              <input type='file' id='file' ref={inputFileGame} style={{display: 'none'}} onChange={uploadGameAsJson}/>
            </li>
            <li key={"load_custom"}>
              <a  onClick={() => handleMenuClick({action:"load_custom"})} href="#">Load custom cards (.txt)</a>
              <input type='file' id='file' ref={inputFileCustom} style={{display: 'none'}} onChange={uploadCustomCards}/>
            </li>
          </ul>
        </li> 
        <li key={"unload"}>
          <a href="#">Unload</a>
          <ul className="third-level-menu">        
            <li key={"unload_my_deck"}><a  onClick={() => handleMenuClick({action:"unload_my_deck"})} href="#">Unload my deck</a></li>
            <li key={"unload_encounter_deck"}><a  onClick={() => handleMenuClick({action:"unload_encounter_deck"})} href="#">Unload encounter</a></li>
          </ul>
        </li>
        <li key={"spawn"}>
          <a href="#">Spawn card</a>
          <ul className="third-level-menu">
            <li key={"spawn_existing"}><a onClick={() => handleMenuClick({action:"spawn_existing"})} href="#">From the card pool</a></li>
            <li key={"spawn_custom"}><a onClick={() => handleMenuClick({action:"spawn_custom"})} href="#">Create your own card</a></li>
          </ul>
        </li> 
        <li key={"random"}>
          <a href="#">Random</a>
          <ul className="third-level-menu">
            <li key={"random_coin"}><a onClick={() => handleMenuClick({action:"random_coin"})} href="#">Coin</a></li>
            <li key={"random_number"}><a onClick={() => handleMenuClick({action:"random_number"})} href="#">Number</a></li>
          </ul>
        </li> 
        <li key={"options"}>
          <a href="#">Options</a>
          <ul className="third-level-menu">
          <li key={"cards_per_round"}><a onClick={() => handleMenuClick({action:"cards_per_round"})} href="#">Cards per round</a></li>
            <li key={"quest_mode_battle"}><a onClick={() => handleMenuClick({action:"quest_mode", mode: "Battle"})} href="#">Battle quest</a></li>
            <li key={"quest_mode_siege"}><a onClick={() => handleMenuClick({action:"quest_mode", mode: "Siege"})} href="#">Siege quest</a></li>
            <li key={"quest_mode_normal"}><a onClick={() => handleMenuClick({action:"quest_mode", mode: "Normal"})} href="#">Normal quest</a></li>
          </ul>
        </li> 
        <li key={"download"}><a onClick={() => handleMenuClick({action:"download"})} href="#">Download game</a></li>
        {host &&
          <li key={"reset"}>
              <a href="#">Reset Game</a>
              <ul className="third-level-menu">
                <li key={"reset_victory"}><a onClick={() => handleMenuClick({action:"reset_game", state: "victory"})} href="#">Mark as victory</a></li>
                <li key={"reset_defeat"}><a onClick={() => handleMenuClick({action:"reset_game", state: "defeat"})} href="#">Mark as defeat</a></li>
                <li key={"reset_incomplete"}><a onClick={() => handleMenuClick({action:"reset_game", state: "incomplete"})} href="#">Mark as incomplete</a></li>
              </ul>
          </li> 
        }       
        {host &&
          <li key={"shut_down"}>
              <a href="#">Close room</a>
              <ul className="third-level-menu">
                <li key={"close_victory"}><a onClick={() => handleMenuClick({action:"close_room", state: "victory"})} href="#">Mark as victory</a></li>
                <li key={"close_defeat"}><a onClick={() => handleMenuClick({action:"close_room", state: "defeat"})} href="#">Mark as defeat</a></li>
                <li key={"close_incomplete"}><a onClick={() => handleMenuClick({action:"close_room", state: "incomplete"})} href="#">Mark as incomplete</a></li>
              </ul>
          </li> 
        }
      </ul>
    </li>
  )
})