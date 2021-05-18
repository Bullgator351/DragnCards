import React from "react";
import styled from "@emotion/styled";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { Stack } from "./Stack";
import CardBack from "./CardBack"

const Container = styled.div`
  background-color: ${props => props.isDraggingOver ? "rgba(1,1,1,0.3)" : ""};
  moz-box-shadow: ${props => props.isDraggingOver ? "0 0 15px 12px rgba(1,1,1,0.3)" : ""};
  webkit-box-shadow: ${props => props.isDraggingOver ? "0 0 15px 12px rgba(1,1,1,0.3)" : ""};
  box-shadow: ${props => props.isDraggingOver ? "0 0 15px 12px rgba(1,1,1,0.3)" : ""};
  -webkit-transition: all 0.2s;
  -moz-transition: all 0.2s;
  -o-transition: all 0.2s;
  transition: all 0.2s;
  padding-left: 0px;
  height: 100%;
  user-select: none;
  overflow-x: ${props => (props.groupType=="deck" || props.groupType=="discard") ? "none" : "auto"};
  overflow-y: hidden;
  scrollbar-color: rgba(1,1,1,0.8) rgba(1,1,1,0);
  max-height: 100%;
  position: relative;
`;

const DropZone = styled.div`
  /* stop the list collapsing when empty */
  display: ${props => (props.groupType=="deck" || props.groupType=="discard") ? "" : "flex"};
  width: 100%;
  height: 100%;
  min-height: 100%;
  padding: 0 0 0 0;
`;

const StacksList = React.memo(({
  isDraggingOver,
  isDraggingFrom,
  gameBroadcast,
  chatBroadcast,
  playerN,
  groupId,
  groupType,
  cardSize,
  stackIds,
  selectedStackIndices,
  registerDivToArrowsContext
}) => {
  const pile = (groupType=="deck" || groupType=="discard")
  // Truncate stacked piles
  var stackIdsToShow;
  if (pile && isDraggingOver && !isDraggingFrom) stackIdsToShow = [];
  else if (pile && stackIds.length>1) stackIdsToShow = [stackIds[0]]
  else stackIdsToShow = stackIds;
  if (!stackIdsToShow) return null;
  return (
    stackIdsToShow?.map((stackId, stackIndex) => (
      (selectedStackIndices.includes(stackIndex)) ? (
        <Stack
          key={stackId}
          gameBroadcast={gameBroadcast}
          chatBroadcast={chatBroadcast}
          playerN={playerN}
          groupId={groupId}
          groupType={groupType}
          stackIndex={stackIndex}
          cardSize={cardSize}
          stackId={stackId}
          numStacks={selectedStackIndices.length}
          registerDivToArrowsContext={registerDivToArrowsContext}
        /> 
      ) : null 
    ))
  ) 
});

export const Stacks = React.memo(({
  gameBroadcast,
  chatBroadcast,
  playerN,
  groupId,
  stackIds,
  groupType,
  cardSize,
  isCombineEnabled,
  selectedStackIndices,
  registerDivToArrowsContext
}) => {
  console.log("Rendering Stacks for ",groupId)
  return(
    <Droppable
      droppableId={groupId}
      key={groupId}
      isDropDisabled={false}
      isCombineEnabled={isCombineEnabled}
      direction={groupType=="deck" || groupType=="discard" ? "vertical" : "horizontal"}
    >
      {(dropProvided, dropSnapshot) => (
        <Container
          isDraggingOver={dropSnapshot.isDraggingOver}
          isDropDisabled={false}
          isDraggingFrom={Boolean(dropSnapshot.draggingFromThisWith)}
          {...dropProvided.droppableProps}
          groupType={groupType}
        >
          <div className="h-full">
            <CardBack 
              groupType={groupType} 
              stackIds={stackIds} 
              isDraggingOver={dropSnapshot.isDraggingOver} 
              isDraggingFrom={Boolean(dropSnapshot.draggingFromThisWith)}>
            </CardBack>
            <DropZone ref={dropProvided.innerRef} groupType={groupType}>
              <StacksList
                isDraggingOver={dropSnapshot.isDraggingOver}
                isDraggingFrom={Boolean(dropSnapshot.draggingFromThisWith)}
                gameBroadcast={gameBroadcast} 
                chatBroadcast={chatBroadcast} 
                playerN={playerN}
                groupId={groupId}
                groupType={groupType} 
                cardSize={cardSize}
                stackIds={stackIds}
                selectedStackIndices={selectedStackIndices}
                registerDivToArrowsContext={registerDivToArrowsContext}
              />
              {dropProvided.placeholder}
            </DropZone>
          </div>
        </Container>
      )}
    </Droppable>
  )
})


