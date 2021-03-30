/* The image shown below the deck of cards*/

import React from "react";
import { useSelector, useDispatch } from 'react-redux';
import styled from "@emotion/styled";
import { CARDSCALE, playerBackSRC, encounterBackSRC} from "./Constants"
import { getCurrentFace, getVisibleFaceSRC } from "./Helpers";

const CardBack = React.memo(({
    groupType,
    stackIds,
    isDraggingOver,
    isDraggingFrom,
    playerN,
}) => {
  const storeStack0 = state => state?.gameUi?.game?.stackById[stackIds[0]];
  const stack0 = useSelector(storeStack0);
  const storeStack1 = state => state?.gameUi?.game?.stackById[stackIds[1]];
  const stack1 = useSelector(storeStack1);
  const storeCard0 = state => state?.gameUi?.game?.cardById[stack0?.cardIds[0]];
  const card0 = useSelector(storeCard0);
  const storeCard1 = state => state?.gameUi?.game?.cardById[stack1?.cardIds[0]];
  const card1 = useSelector(storeCard1);  
  const layoutStore = state => state.gameUi.layout;
  const layout = useSelector(layoutStore);
  const numRows = layout.length;
  const cardSize = CARDSCALE/numRows;
  console.log("rendering cardback")
  console.log(stackIds)

  var currentSideSRC;
  var currentFace;
  const groupSize = stackIds.length;
  if (groupType=="deck" && groupSize>0 && isDraggingOver && !isDraggingFrom) {
    currentSideSRC = getVisibleFaceSRC(card0, playerN)
    currentFace = getCurrentFace(card0)
  } else if (groupType=="deck" && groupSize>1 && isDraggingFrom) {
    currentSideSRC = getVisibleFaceSRC(card1, playerN)
    currentFace = getCurrentFace(card0)
  } else if (groupType=="discard" && groupSize>0 && isDraggingOver && !isDraggingFrom) {
    currentSideSRC = getVisibleFaceSRC(card0, playerN)
    currentFace = getCurrentFace(card0)
  } else if (groupType=="discard" && groupSize>1 && isDraggingFrom) {
    currentSideSRC = getVisibleFaceSRC(card1, playerN)
    currentFace = getCurrentFace(card0)
  }
  if (currentFace) {
    return (
        <div 
            style={{
                backgroundColor: "red",
                background: `url(${currentSideSRC}) no-repeat scroll 0% 0% / contain`,
                //borderWidth: '1px',
                borderRadius: '6px',
                borderColor: 'transparent',
                position: "relative",
                width: `${cardSize*currentFace.width}vw`,
                height: `${cardSize*currentFace.height}vw`,
                left: `${0.2 + (1.39-currentFace.width)*cardSize/2}vw`,
                top: "50%", //`${0.2 + (1.39-currentFace.height)*cardSize/2}vw`,
                transform: "translate(0%,-50%)",
            }}
        >
        </div>)
  } else {
    return (<div></div>);
  }
})

//left: `${0.2 + (1.39-currentFace.width)*CARDSCALE/2 + CARDSCALE/3*cardIndex}vw`,
//top: `${0.2 + (1.39-currentFace.height)*CARDSCALE/2}vw`,

export default CardBack;
